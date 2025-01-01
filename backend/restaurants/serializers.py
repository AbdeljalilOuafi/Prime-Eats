from rest_framework import serializers
from .models import *

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image_url', 'is_available']

class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(source='menuitem_set', many=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'items']

class MenuSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(source='category_set', many=True)

    class Meta:
        model = Menu
        fields = ['id', 'categories']

class RestaurantSerializer(serializers.ModelSerializer):
    menu = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'latitude', 'longitude', 'address',
                 'rating', 'image_url', 'menu']

    def get_menu(self, obj):
        if obj.cuisine_type and hasattr(obj.cuisine_type, 'menu'):
            return MenuSerializer(obj.cuisine_type.menu).data
        return None


class ChainRestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChainRestaurant
        fields = ['name', 'menu']
