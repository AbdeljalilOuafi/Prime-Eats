from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils_v2 import RestaurantDataService
from decouple import config
from rest_framework.permissions import AllowAny
from .models import ChainRestaurant
from .serializers import ChainRestaurantSerializer
from django.core.cache import cache
from asgiref.sync import async_to_sync
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class RestaurantListView(APIView):
    """
    Fetch nearby restaurants using coordinates.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            # 1. Extract parameters from request
            latitude = float(request.query_params.get("latitude"))
            longitude = float(request.query_params.get("longitude"))
            radius = request.query_params.get("radius")
            
            if radius:
                radius = 1000
            
            if not latitude or not longitude:
                return Response({'error': 'No location was provided'}, 
                              status=status.HTTP_400_BAD_REQUEST)

        except (TypeError, ValueError) as e:
            return Response(
                {'error': f'Invalid latitude or longitude, {e}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = RestaurantDataService(config('GOOGLE_API_KEY'))
        
        # Convert the async get_restaurants method to sync
        sync_get_restaurants = async_to_sync(service.get_restaurants)
        return sync_get_restaurants(latitude, longitude, radius)

class ChainRestaurantListView(APIView):
    """
    API endpoint that returns all chain restaurants with permanent caching.
    Cache is only invalidated manually through admin when needed.
    """
    CACHE_KEY = 'chain_restaurants_list'

    def get(self, request):
        # Try to get data from cache first
        chains_data = cache.get(self.CACHE_KEY)
        
        if chains_data is None:
            # If not in cache, get from database
            chain_restaurants = ChainRestaurant.objects.all()
            
            if not chain_restaurants.exists():
                return Response(
                    {"error": "No data was found! Are you sure the database is populated ?"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Serialize the data
            chains_data = ChainRestaurantSerializer(chain_restaurants, many=True).data
            
            # Store in cache permanently (timeout=None)
            cache.set(self.CACHE_KEY, chains_data, timeout=None)
        
        return Response(chains_data, status=status.HTTP_200_OK)
