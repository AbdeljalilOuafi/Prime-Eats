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
from restaurants.menus import MENUS
from restaurants.models import ChainRestaurant, CuisineType, Menu, Category, MenuItem


def run_management_command(command):
    """Run a Django management command programmatically."""
    manage_path = os.path.join(os.path.dirname(__file__), '..', 'manage.py')
    try:
        subprocess.run(['python3', manage_path, command], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running command {command}: {e}")
        exit(1)

def migrate_menu_data():
    for cuisine_name, categories in MENUS.items():
        # Create cuisine type and menu
        cuisine_type = CuisineType.objects.create(name=cuisine_name)
        menu = Menu.objects.create(cuisine_type=cuisine_type)

        # Create categories and items
        for category_name, items in categories.items():
            category = Category.objects.create(
                menu=menu,
                name=category_name
            )

            # Create menu items
            for item in items:
                MenuItem.objects.create(
                    category=category,
                    name=item['name'],
                    description=item['description'],
                    price=item['price'],
                    image_url=item['image_url']
                )
                
                
def migrate_chain_restaurants():
    for chain_name, chain_data in CHAINS.items():
            # Create or get the menu
            menu = Menu.objects.create(
                name=f"{chain_name} Menu",
                is_active=True
            )

            # Create or get the chain restaurant
            chain_restaurant, created = ChainRestaurant.objects.get_or_create(
                name=chain_name,
                defaults={
                    'image_url': chain_data.get('image_url'),
                    'menu': menu
                }
            )

            # Create categories and menu items
            for category_name, items in chain_data.items():
                if category_name != 'image_url':  # Skip the image_url entry
                    category = Category.objects.create(
                        menu=menu,
                        name=category_name
                    )

                    # Create menu items
                    for item in items:
                        MenuItem.objects.create(
                            category=category,
                            name=item['name'],
                            description=item['description'],
                            price=item['price'],
                            image_url=item.get('image_url'),
                            is_available=True
                        )
            print(f'Successfully created menu for {chain_name}') 

def populate_db():
    # Run makemigrations and migrate commands
    print("Running makemigrations...")
    run_management_command('makemigrations')

    print("Running migrate...")
    run_management_command('migrate')

    # Populate the database with chain restaurants
    print("Populating chain restaurants...")
    migrate_chain_restaurants()

    print("Populating Menus...")
    migrate_menu_data()

    print("Database population complete.")

if __name__ == '__main__':
    populate_db()

