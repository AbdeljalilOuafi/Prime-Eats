from decouple import config
import requests
import json


def fetch_google_places(latitude, longitude, radius):
    """
    Fetch restaurants from Google Places API
    """
    endpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'location': f'{latitude},{longitude}',
        'radius': radius,
        'type': 'restaurant',
        'key': config('GOOGLE_API_KEY')
    }
    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    return response.json().get('results', [])


latitude = 34.699954
longitude = -1.917121
radius = 1000

try:
    restaurants = fetch_google_places(latitude, longitude, radius)
    if not restaurants:
        print('Something went wrong')
    else:
        # Save the restaurants into a file named "restaurants.json"
        with open('restaurants.json', 'w', encoding='utf-8') as f:
            json.dump(restaurants, f, ensure_ascii=False, indent=4)
        print('Restaurants saved to "restaurants.json" successfully!')

except Exception as e:
    print(f"An error occurred: {e}")
