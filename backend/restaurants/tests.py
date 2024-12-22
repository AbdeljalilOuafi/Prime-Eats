from django.test import TestCase

# Create your tests here.
import unittest
from unittest.mock import patch, MagicMock
from django.core.cache import cache
from django.test import TestCase
from rest_framework import status
from .models import Restaurant, FetchRestaurant, ChainRestaurant
from .utils import RestaurantDataService
from .menus import MENUS
import time

class TestRestaurantDataService(TestCase):
    def setUp(self):
        """Set up test environment before each test"""
        super().setUp()
        self.service = RestaurantDataService(google_api_key="test_key")
        self.test_latitude = 40.7128
        self.test_longitude = -74.0060
        self.rounded_coords = f"{round(self.test_latitude, 3)}:{round(self.test_longitude, 3)}"
        self.cache_key = f"restaurants:{self.rounded_coords}"

        # Clear cache and database before each test
        self.clean_up()

    def tearDown(self):
        """Clean up test environment after each test"""
        super().tearDown()
        self.clean_up()

    def clean_up(self):
        """Helper method to clean cache and database"""
        # Clear cache
        cache.clear()
        # Clear database
        Restaurant.objects.all().delete()
        FetchRestaurant.objects.all().delete()
        ChainRestaurant.objects.all().delete()

    def test_cache_hit(self):
        """Test that cached data is returned when available"""
        # Prepare test data
        test_data = {
            "restaurants": [],
            "chain_restaurants": []
        }

        # Set cache
        cache.set(self.cache_key, test_data)

        # Make request
        response = self.service.get_restaurants(self.test_latitude, self.test_longitude)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, test_data)

        # Verify cache exists
        self.assertIsNotNone(cache.get(self.cache_key))

    def test_database_hit(self):
        """Test that database data is returned when cache misses but DB has data"""
        # Verify cache is empty before test
        self.assertIsNone(cache.get(self.cache_key))

        # Create test restaurant
        restaurant = Restaurant.objects.create(
            name="Test Restaurant",
            latitude=self.test_latitude,
            longitude=self.test_longitude,
            rounded_coordinates=self.rounded_coords,
            address="123 Test St",
            rating=4.5,
            source="google",
            menu={"items": []}
        )

        # Create fetch entry
        fetch_entry = FetchRestaurant.objects.create(rounded_coordinates=self.rounded_coords)
        fetch_entry.restaurants.add(restaurant)

        # Make request
        response = self.service.get_restaurants(self.test_latitude, self.test_longitude)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("restaurants" in response.data)
        self.assertEqual(len(response.data["restaurants"]), 1)
        self.assertEqual(response.data["restaurants"][0]["name"], "Test Restaurant")

    @patch('requests.get')
    def test_google_api_failure(self, mock_get):
        """Test fallback to chain restaurants when Google API fails"""
        # Verify cache is empty before test
        self.assertIsNone(cache.get(self.cache_key))

        # Setup mock to raise exception
        mock_get.side_effect = Exception("API Error")

        # Create test chain restaurant
        ChainRestaurant.objects.create(
            name="Test Chain",
            menu={"items": []}
        )

        # Make request
        response = self.service.get_restaurants(self.test_latitude, self.test_longitude)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]["name"], "Test Chain")
        print(response.data[0]["name"])

    def test_is_chain(self):
        """Test _is_chain method"""
        test_cases = [
            ("McDonald's", True),
            ("Local Restaurant", False),
            ("Subway", True),
            ("Mom's Kitchen", False)
        ]

        for restaurant_name, expected in test_cases:
            result = self.service._is_chain(restaurant_name)
            self.assertEqual(result, expected, f"Failed for restaurant: {restaurant_name}")

    def test_infer_cuisine(self):
        """Test _infer_cuisine method"""
        test_cases = [
            {
                "name": "Tokyo Sushi",
                "types": ["restaurant", "food"],
                "expected": "Japanese"
            },
            {
                "name": "Mama's Pizza",
                "types": ["restaurant", "pizza"],
                "expected": "Italian"
            },
            {
                "name": "Random Restaurant",
                "types": ["restaurant"],
                "expected": "Unknown"
            }
        ]

        for case in test_cases:
            result = self.service._infer_cuisine(case["name"], case["types"])
            self.assertEqual(
                result,
                case["expected"],
                f"Failed for restaurant: {case['name']}"
            )

    def test_menu_generation(self):
        """Test generate_menu method using the actual MENUS dictionary"""

        # Test for existing cuisines
        for cuisine_type in MENUS.keys():

            menu = self.service.generate_menu(cuisine_type)

            # Verify menu matches the structure in MENUS
            self.assertEqual(menu, MENUS[cuisine_type])

            # Verify structure of returned menu
            self.assertIsInstance(menu, dict)

            # Check each category in the menu
            for category, items in menu.items():
                self.assertIsInstance(items, list, f"Category {category} should contain a list")

                # Check each item in the category
                for item in items:
                    self.assertIsInstance(item, dict)
                    self.assertIn('name', item)
                    self.assertIn('description', item)
                    self.assertIn('price', item)
                    self.assertIn('image_url', item)

                    # Verify data types of item fields
                    self.assertIsInstance(item['name'], str)
                    self.assertIsInstance(item['description'], str)
                    self.assertIsInstance(item['price'], (int, float))
                    self.assertIsInstance(item['image_url'], str)

        # Test for non-existent cuisine
        nonexistent_cuisine = "NonexistentCuisine"
        fallback_menu = self.service.generate_menu(nonexistent_cuisine)

        # Verify it falls back to the 'Unknown' menu if it exists, or returns an empty dict
        expected_fallback = MENUS.get('Unknown', {})
        self.assertEqual(fallback_menu, expected_fallback)

if __name__ == '__main__':
    unittest.main()
