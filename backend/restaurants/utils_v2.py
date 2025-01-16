#!/usr/bin/env python3
"""restaurants/utils_v2 module"""


import logging
from django.core.cache import cache
from django.conf import settings
from .keywords import CUISINE_KEYWORDS
from .chains import CHAINS
from .menus import MENUS
import requests
from rest_framework.response import Response
from rest_framework import status
from .models import Restaurant, FetchRestaurant, ChainRestaurant, CuisineType
from .serializers import RestaurantSerializer, ChainRestaurantSerializer
import os
import random
import cloudinary.uploader
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from django.db import transaction
from asgiref.sync import sync_to_async
from typing import Tuple, List, Any


class RestaurantDataService:
    def __init__(self, google_api_key=None):
        self.google_api_key = google_api_key
        self.logger = logging.getLogger(__name__)

    async def get_restaurants(self, latitude, longitude, radius=500):
        rounded_coords = f"{round(latitude, 3)}:{round(longitude, 3)}"
        cache_key = f"restaurants:{rounded_coords}"

        # 1. Check Redis cache
        cached_data = await sync_to_async(cache.get)(cache_key)
        if cached_data:
            print("Data retrieved from Redis.")
            return cached_data

        # 2. Check Database
        db_results = await self.query_db(rounded_coords, cache_key)
        if db_results:
            print("Data retrieved from DataBase.")
            return db_results

        # 3. Try fetching from APIs
        try:
            api_restaurants, source = await self._fetch_from_apis(latitude, longitude, radius)
            
            if api_restaurants:
                restaurants = await self._save_restaurants(api_restaurants, rounded_coords, cache_key, source)
                return restaurants
                
        except Exception as e:
            print(f'Something went wrong, {e}\nFallback to Chain Restaurants.')
            # Fix: Wrap the ChainRestaurant query in sync_to_async
            chain_restaurants = await sync_to_async(lambda: list(ChainRestaurant.objects.all()))()
            chain_data = await sync_to_async(lambda: ChainRestaurantSerializer(chain_restaurants, many=True).data)()
            return {"restaurants": [], "chain_restaurants": chain_data}
        
    async def _fetch_from_apis(self, latitude, longitude, radius):
        """
        Attempt to fetch restaurants from multiple APIs
        """
        # Try Google Places first
        if self.google_api_key:
            try:
                google_restaurants = await self._fetch_google_places(latitude, longitude, radius)
                if google_restaurants:
                    return (google_restaurants, "google")
            except Exception as e:
                self.logger.warning(f"Google Places API Failed: {e}")

        # Fallback to Yelp if Google fails
        # if self.yelp_api_key:
        #     try:
        #         yelp_restaurants = await self._fetch_yelp(latitude, longitude, radius)
        #         if yelp_restaurants:
        #             return yelp_restaurants
        #     except Exception as e:
        #         self.logger.warning(f"Yelp API error: {e}")

        raise TypeError("All API's Failed")

    async def _fetch_google_places(self, latitude, longitude, radius):
        """
        Fetch restaurants from Google Places API
        """
        endpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'location': f'{latitude},{longitude}',
            'radius': radius,
            'type': 'restaurant',
            'key': self.google_api_key
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(endpoint, params=params) as response:
                if response.status != 200:
                    print('Google Failed')
                    response.raise_for_status()
                data = await response.json()
                return data.get('results', [])

    # def _fetch_yelp(self, latitude, longitude, radius):
    #     """
    #     Fetch restaurants from Yelp Fusion API
    #     """
    #     headers = {
    #         'Authorization': f'Bearer {self.yelp_api_key}',
    #     }
    #     params = {
    #         'latitude': latitude,
    #         'longitude': longitude,
    #         'radius': radius,
    #         'categories': 'restaurants',
    #         'limit': 50
    #     }

    #     response = requests.get('https://api.yelp.com/v3/businesses/search',
    #                             headers=headers,
    #                             params=params)
    #     businesses = response.json().get('businesses', [])

    #     return [
    #         {
    #             'name': business.get('name'),
    #             'address': ' '.join(business.get('location', {}).get('display_address', [])),
    #             'latitude': business.get('coordinates', {}).get('latitude'),
    #             'longitude': business.get('coordinates', {}).get('longitude'),
    #             'rating': business.get('rating', 0),
    #             'total_ratings': business.get('review_count', 0),
    #             'cuisine_type': business.get('categories', [{}])[0].get('title')
    #         }
    #         for business in businesses
    #     ]

    async def _save_restaurants(self, api_results, rounded_coords, cache_key, source):
        restaurants_data, photo_urls = await self.process_restaurants_async(api_results, rounded_coords)
        
        photo_url_iter = iter(photo_urls)
        restaurants = []
        
        # Create FetchRestaurant instance
        fetch_entry = await sync_to_async(FetchRestaurant.objects.create)(rounded_coordinates=rounded_coords)
        
        for (r, cuisine_type) in restaurants_data:
            if isinstance(r, ChainRestaurant):
                restaurants.append(r)
                await sync_to_async(fetch_entry.chain_restaurants.add)(r)
                continue

            image_url = ""
            if r.get("photos"):
                try:
                    image_url = next(photo_url_iter)
                    if isinstance(image_url, Exception):
                        image_url = ""
                except StopIteration:
                    pass

            # Create restaurant
            restaurant = await sync_to_async(Restaurant.objects.create)(
                name=r["name"],
                latitude=r["geometry"]["location"]["lat"],
                longitude=r["geometry"]["location"]["lng"],
                rounded_coordinates=rounded_coords,
                address=r.get("vicinity", "No address available"),
                rating=r.get("rating", random.uniform(2, 5)),
                source=source,
                cuisine_type=cuisine_type,
                image_url=image_url
            )
            
            restaurants.append(restaurant)
            await sync_to_async(fetch_entry.restaurants.add)(restaurant)

        # Serialize the results
        restaurants_to_serialize = [r for r in restaurants if not isinstance(r, ChainRestaurant)]
        chain_restaurants_to_serialize = [r for r in restaurants if isinstance(r, ChainRestaurant)]

        # Use sync_to_async for serialization
        restaurants_data = await sync_to_async(lambda: RestaurantSerializer(restaurants_to_serialize, many=True).data)()
        chain_restaurants_data = await sync_to_async(lambda: ChainRestaurantSerializer(chain_restaurants_to_serialize, many=True).data)()

        response_data = {
            "restaurants": restaurants_data,
            "chain_restaurants": chain_restaurants_data
        }

        # Cache the results
        await sync_to_async(cache.set)(cache_key, response_data)
        
        return response_data

    async def query_db(self, rounded_coords, cache_key):
        """Fixed async database querying"""
        # Convert the filter operation to async
        fetch_qs = FetchRestaurant.objects.filter(rounded_coordinates=rounded_coords)
        fetch_entry = await sync_to_async(lambda: fetch_qs.first())()

        if fetch_entry:
            # Get related restaurants
            restaurants = await sync_to_async(lambda: RestaurantSerializer(
                fetch_entry.restaurants.all(), 
                many=True
            ).data)()
            
            # Get related chain restaurants
            chain_restaurants = await sync_to_async(lambda: ChainRestaurantSerializer(
                fetch_entry.chain_restaurants.all(), 
                many=True
            ).data)()

            response_data = {
                "restaurants": restaurants,
                "chain_restaurants": chain_restaurants
            }

            # Cache the results
            await sync_to_async(cache.set)(cache_key, response_data)
            return response_data

        return None

    
    async def _is_chain_async(self, name: str) -> bool:
        """Async version of chain checking"""
        name = name.lower()
        return name and name in " ".join(chain.lower() for chain in CHAINS)

    async def _infer_cuisine_async(self, name: str, types: list) -> str:
        """Async version of cuisine inference"""
        name = name.lower()
        types = [t.lower() for t in types] if types else []
        search_text = f"{name} {' '.join(types)}"

        cuisine_scores = {}
        for cuisine, keywords in CUISINE_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in search_text)
            if score > 0:
                cuisine_scores[cuisine] = score

        if cuisine_scores:
            return max(cuisine_scores.items(), key=lambda x: x[1])[0]

        return 'Unknown'

    async def process_restaurants_async(self, api_results, rounded_coords):
        """Fixed async restaurant processing"""
        restaurants = []
        photo_tasks = []
        
        async with aiohttp.ClientSession() as session:
            for r in api_results:
                if await self._is_chain_async(r["name"]):
                    chain_qs = ChainRestaurant.objects.filter(name=r["name"])
                    chain = await sync_to_async(lambda: chain_qs.first())()
                    if chain:
                        restaurants.append((chain, None))
                    continue

                # Start photo fetch task if photo exists
                photo_task = None
                if r.get("photos") and len(r["photos"]) > 0 and r["photos"][0].get("photo_reference"):
                    photo_task = self.fetch_photo_async(
                        session,
                        r["photos"][0]["photo_reference"],
                        r["name"]
                    )
                    photo_tasks.append(photo_task)
                
                cuisine_name = await self._infer_cuisine_async(r["name"], r.get("types", []))
                cuisine_type = await sync_to_async(lambda: CuisineType.objects.get_or_create(name=cuisine_name)[0])()
                
                restaurants.append((r, cuisine_type))

            # Wait for all photo fetch tasks to complete
            photo_urls = await asyncio.gather(*photo_tasks, return_exceptions=True)
            
        return restaurants, photo_urls
    
    async def fetch_photo_async(self, session, photo_reference, restaurant_name):
        """
        Asynchronously fetch photo from Google Places API and upload to Cloudinary
        """
        if not photo_reference:
            return ""

        try:
            base_url = "https://maps.googleapis.com/maps/api/place/photo"
            params = {
                "photo_reference": photo_reference,
                "maxwidth": 400,
                "key": self.google_api_key
            }

            async with session.get(base_url, params=params) as response:
                if response.status != 200:
                    return ""
                    
                image_data = await response.read()
                
                # Cloudinary upload needs to be run in a thread pool as it's blocking
                with ThreadPoolExecutor() as executor:
                    upload_func = partial(
                        cloudinary.uploader.upload,
                        image_data,
                        folder="restaurants",
                        public_id=restaurant_name,
                        resource_type="auto"
                    )
                    upload_result = await asyncio.get_event_loop().run_in_executor(
                        executor, 
                        upload_func
                    )
                print(upload_result.get("secure_url", ""))
                
                return upload_result.get("secure_url", "")
        except Exception as e:
            self.logger.warning(f"Error fetching/uploading photo for {restaurant_name}: {str(e)}")
            return ""

    def _is_chain(self, name):

        name = name.lower()

        if name and name in " ".join(chain.lower() for chain in CHAINS):
            return True
        return False

    def _infer_cuisine(self, name: str, types: list) -> str:
        """
        Infer the cuisine of a restaurant based on its name, types, and description.
        """
        # Normalize inputs for case-insensitive matching
        name = name.lower()

        types = [t.lower() for t in types] if types else []

        # # Iterate through the cuisines and their keywords
        # for cuisine, keywords in CUISINE_KEYWORDS.items():
        #     # Check keywords in name
        #     if name and any(keyword in name for keyword in keywords):
        #         return cuisine

        #     # Check keywords in types
        #     if types and any(keyword in " ".join(types) for keyword in keywords):
        #         return cuisine

        # # Return 'Unknown' if no matches are found
        # return 'Unknown'
        search_text = f"{name} {' '.join(types)}"

        # Score each cuisine based on keyword matches
        cuisine_scores = {}
        for cuisine, keywords in CUISINE_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in search_text)
            if score > 0:
                cuisine_scores[cuisine] = score

        # Return the cuisine with the highest score, or 'Unknown' if no matches
        if cuisine_scores:
            return max(cuisine_scores.items(), key=lambda x: x[1])[0]

        return 'Unknown'


    def generate_menu(self, cuisine_type):
        # (Previous menu dictionary remains the same)

        # Menu selection logic
        menu = {}

        # Check if the cuisine type exists in menus
        if cuisine_type in MENUS:
            # Use all items in each category
            menu = MENUS[cuisine_type]
        else:
            # If cuisine type is not found, use the 'Unknown' menu
            menu = MENUS['Unknown']

        return menu

    def fetch_and_save_place_photo(self, photo_reference, restaurant_name):
        """
        Fetches a photo from Google Places API and uploads it to Cloudinary.

        Args:
            photo_reference (str): The photo reference from the Places API.

        Returns:
            str: The Cloudinary URL of the uploaded image.
        """
        base_url = "https://maps.googleapis.com/maps/api/place/photo"
        params = {
            "photo_reference": photo_reference,
            "maxwidth": 400,
            "key": self.google_api_key
        }

        # Make the API request
        response = requests.get(base_url, params=params)
        response.raise_for_status()

        # Upload the image to Cloudinary
        upload_result = cloudinary.uploader.upload(
            response.content,
            folder="restaurants",
            public_id=restaurant_name,
            resource_type="auto"  # Important for binary upload
        )
        
        print(f'Image URL: {upload_result["secure_url"]}')
        # Return the Cloudinary URL
        return upload_result.get("secure_url")

