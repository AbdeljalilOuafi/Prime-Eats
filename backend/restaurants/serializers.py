from rest_framework import serializers
from .models import Restaurant, ChainRestaurant

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['name', 'latitude', 'longitude', 'rounded_coordinates',
                  'address', 'rating', 'source', 'menu', 'image_url']


class ChainRestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChainRestaurant
        fields = ['name', 'menu']
