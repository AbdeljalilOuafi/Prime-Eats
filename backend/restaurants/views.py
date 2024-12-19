from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import RestaurantDataService
from decouple import config

class RestaurantListView(APIView):
    """
    Fetch nearby restaurants using coordinates.
    Steps:
    1. Check Redis cache for rounded coordinates.
    2. Check the database.
    3. Fetch from Google API or Yelp if no data exists.
    4. Generate fake fallback data as a last resort.
    """

    def get(self, request, *args, **kwargs):
        try:
            # 1. Extract parameters from request
            latitude = float(request.query_params.get("latitude"))
            longitude = float(request.query_params.get("longitude"))

            if not latitude or not longitude:
                return Response({'error': 'No location was provided'}, status=status.HTTP_400_BAD_REQUEST)

        except (TypeError, ValueError):
        # Latitude or longitude failed float conversion, in otherwords its an invalid value
            return Response(
                {'error': 'Invalid latitude or longitude. Please provide valid numeric values.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = RestaurantDataService(config('GOOGLE_API_KEY'))
        return service.get_restaurants(latitude, longitude)





class ReturnParams(APIView):
    def get(self, request, *args, **kwargs):
        name = request.query_params.get("name")
        if name:
            return Response({'success': f'Your name is {name}'})
        return Response({'error':'No params were found'})
