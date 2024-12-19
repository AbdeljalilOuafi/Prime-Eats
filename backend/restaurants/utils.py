import logging
from django.core.cache import cache
from .keywords import CUISINE_KEYWORDS
from .chains import CHAINS
from .menus import MENUS
import requests
from rest_framework.response import Response
from rest_framework import status
from .models import Restaurant, FetchRestaurant, ChainRestaurant
from .serializers import RestaurantSerializer, ChainRestaurantSerializer

class RestaurantDataService:
    def __init__(self, google_api_key=None):
        self.google_api_key = google_api_key
        self.logger = logging.getLogger(__name__)

    def get_restaurants(self, latitude, longitude, radius=1000):
        """
        Comprehensive restaurant data retrieval strategy
        """
        # Rounded coordinates for caching and DB lookup

        rounded_coords = f"{round(latitude, 3)}:{round(longitude, 3)}"
        cache_key = f"restaurants:{rounded_coords}"

        # 1. Check Redis cache
        cached_data = cache.get(cache_key)
        if cached_data:
            print("Data retrieved from Redis.")
            return Response(cached_data, status=status.HTTP_200_OK)

        # 2. Check Database
        db_results = self.query_db(rounded_coords, cache_key)
        if db_results:
            print("Data retrieved from DataBase.")
            return Response(db_results, status=status.HTTP_200_OK)


        # 3. Try fetching from APIs
        try:
            api_restaurants, source = self._fetch_from_apis(latitude, longitude, radius)
            if api_restaurants:
                # Save fetched restaurants to local database and cache
                restaurants = self._save_restaurants(api_restaurants, rounded_coords, cache_key ,source)
                return Response(restaurants, status=status.HTTP_200_OK)
        except Exception as e:
            # Return All Chain Restaurants as a last resort if no data was found in Cach, DB
            # and All API'S Failed (most likely due to exceeding the free rate limit.)

            # TODO: Could use Pagination here if the ChainRestaurants Table was too big.
            restaurants = ChainRestaurantSerializer(ChainRestaurant.objects.all(), many=True).data
            return Response(restaurants, status=status.HTTP_200_OK)

    def _fetch_from_apis(self, latitude, longitude, radius):
        """
        Attempt to fetch restaurants from multiple APIs
        """
        # Try Google Places first
        if self.google_api_key:
            try:
                google_restaurants = self._fetch_google_places(latitude, longitude, radius)
                if google_restaurants:
                    return (google_restaurants, "google")
            except Exception as e:
                self.logger.warning(f"Google Places API Failed: {e}")

        # Fallback to Yelp if Google fails

        # if self.yelp_api_key:
        #     try:
        #         yelp_restaurants = self._fetch_yelp(latitude, longitude, radius)
        #         if yelp_restaurants:
        #             return yelp_restaurants
        #     except Exception as e:
        #         self.logger.warning(f"Yelp API error: {e}")

        raise TypeError("All API's Failed")

    def _fetch_google_places(self, latitude, longitude, radius):
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

        response = requests.get(endpoint, params=params)
        response.raise_for_status() #raises an HTTPError for HTTP errors (status codes 4xx or 5xx)
        return response.json().get('results', [])

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

    def query_db(self, rounded_coords, cache_key):

        fetch_entry = FetchRestaurant.objects.filter(rounded_coordinates=rounded_coords).first()

        if fetch_entry:
            # Serialize data
            restaurants_data = RestaurantSerializer(fetch_entry.restaurants.all(), many=True).data
            chain_restaurants_data = ChainRestaurantSerializer(fetch_entry.chain_restaurants.all(), many=True).data

            # Prepare response data
            response_data = {
                "restaurants": restaurants_data,
                "chain_restaurants": chain_restaurants_data
            }

            # Cache the serialized response
            cache.set(cache_key, response_data)

            return response_data

        return None

    def _save_restaurants(self, api_results, rounded_coords, cache_key, source):

        restaurants = []

        for r in api_results:
            if self._is_chain(r["name"]):
                chain = ChainRestaurant.objects.filter(name=r["name"]).first()
                if chain:
                    restaurants.append(chain)
            else:
                # TODO: fetch the restaurant image url here
                restaurant = Restaurant.objects.create(
                    name=r["name"],
                    latitude=r["geometry"]["location"]["lat"],
                    longitude=r["geometry"]["location"]["lng"],
                    rounded_coordinates=rounded_coords,
                    address=r.get("address", "No address available"),
                    rating=r.get("rating"),
                    source=source,
                    menu=self.generate_menu(self._infer_cuisine(r["name"], r.get("types", [])))
                )
                restaurants.append(restaurant)

        # Save to FetchRestaurant
        fetch_entry = FetchRestaurant.objects.create(rounded_coordinates=rounded_coords)
        for r in restaurants:
            if isinstance(r, ChainRestaurant):
                fetch_entry.chain_restaurants.add(r)
            else:
                fetch_entry.restaurants.add(r)

        restaurants_data = RestaurantSerializer(fetch_entry.restaurants.all(), many=True).data
        chain_restaurants_data = ChainRestaurantSerializer(fetch_entry.chain_restaurants.all(), many=True).data

        # Prepare response data
        response_data = {
            "restaurants": restaurants_data,
            "chain_restaurants": chain_restaurants_data
        }

        # Cache the serialized response
        cache.set(cache_key, response_data)

        return response_data


    def _is_chain(self, name):

        name = name.lower()

        if name and name in " ".join(chain.lower() for chain in CHAINS): #Use chains.keys here to make CHAINS a hashmap
                                                                         #with the value being the menu, then use this data for creating ChainRestraunts objects and saving to the table
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


    def generate_menu(cuisine_type: str):
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


