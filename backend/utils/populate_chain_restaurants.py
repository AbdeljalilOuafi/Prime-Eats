#!/usr/bin/env python3
"""populate_chain_restaurants module"""
import os
import django
import subprocess
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from restaurants.chains import CHAINS
from restaurants.models import ChainRestaurant

def run_management_command(command):
    """Run a Django management command programmatically."""
    manage_path = os.path.join(os.path.dirname(__file__), '..', 'manage.py')  # Adjust to find manage.py
    try:
        subprocess.run(['python3', manage_path, command], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running command {command}: {e}")
        exit(1)

def populate_chain_restaurants():
    # Run makemigrations and migrate commands
    print("Running makemigrations...")
    run_management_command('makemigrations')

    print("Running migrate...")
    run_management_command('migrate')

    # Populate the database with chain restaurants
    print("Populating chain restaurants...")
    for restaurant_name, menu_data in CHAINS.items():
        ChainRestaurant.objects.create(
            name=restaurant_name,
            menu=menu_data,
            image_url=menu_data.get('image_url')
        )
    print("Database population complete.")

if __name__ == '__main__':
    populate_chain_restaurants()

