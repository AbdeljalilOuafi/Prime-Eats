import os
import django

# Set the DJANGO_SETTINGS_MODULE environment variable to point to settings
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.cache import cache
from restaurants.models import Restaurant, FetchRestaurant, ChainRestaurant

def clear_all_data():
    # Clear all tables
    print("Deleting all records...")

    # Delete FetchRestaurant records (including many-to-many relationships)
    fetch_count = FetchRestaurant.objects.all().delete()
    print(f"Deleted FetchRestaurant records: {fetch_count}")

    # Delete Restaurant records
    restaurant_count = Restaurant.objects.all().delete()
    print(f"Deleted Restaurant records: {restaurant_count}")

    # Delete ChainRestaurant records
    chain_count = ChainRestaurant.objects.all().delete()
    print(f"Deleted ChainRestaurant records: {chain_count}")

    # Clear Django cache
    cache.clear()
    print("Cache cleared")

    return "All data cleared successfully"

# Run the function
if __name__ == "__main__":
    clear_all_data()
