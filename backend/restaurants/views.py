from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import RestaurantDataService
from decouple import config
from rest_framework.permissions import AllowAny
from .models import ChainRestaurant
from .serializers import ChainRestaurantSerializer
from django.core.cache import cache

class RestaurantListView(APIView):
    """
    Fetch nearby restaurants using coordinates.
    Steps:
    1. Check Redis cache for rounded coordinates.
    2. Check the database.
    3. Fetch from Google API or Yelp if no data exists.
    4. Generate fake fallback data as a last resort.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            # 1. Extract parameters from request
            latitude = float(request.query_params.get("latitude"))
            longitude = float(request.query_params.get("longitude"))
            radius = request.query_params.get("radius")

            if radius:
                try:
                    radius = float(radius)  # Convert radius to float
                except ValueError:
                    return Response({'error': 'Invalid radius. Please provide a valid numeric value.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                radius = 1000

            if not latitude or not longitude:
                return Response({'error': 'No location was provided'}, status=status.HTTP_400_BAD_REQUEST)

        except (TypeError, ValueError):
        # Latitude or longitude failed float conversion, in otherwords its an invalid value
            return Response(
                {'error': 'Invalid latitude or longitude. Please provide valid numeric values.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = RestaurantDataService(config('GOOGLE_API_KEY'))
        return service.get_restaurants(latitude, longitude, radius)

class ChainRestaurantListView(APIView):
    """
    API endpoint that returns all chain restaurants.
    """
    def get(self, request):
        chain_restaurants = ChainRestaurant.objects.all()
        chains_data = ChainRestaurantSerializer(chain_restaurants, many=True).data
        if chains_data:
            return Response(chains_data, status=status.HTTP_200_OK)
        else:
            return Response({"error":"No data was found! Are you sure the database is populated ?"})


