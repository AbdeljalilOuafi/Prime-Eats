from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order
import requests
from decimal import Decimal
import logging
from functools import wraps
from decouple import config
from django.core.cache import cache
import json
from django.shortcuts import render
from orders.tasks import send_order_confirmation_email
from orders.utils import send_mail



# Configure logging
logger = logging.getLogger(__name__)

# PayPal Configuration

# To switch to production mode, you'll need to:
# Use production PayPal credentials
# Update the PayPal SDK script URL to remove sandbox mode
# Implement proper error handling
# Use dynamic exchange rates if needed

PAYPAL_MODE = getattr(settings, 'PAYPAL_MODE', 'sandbox') 
PAYPAL_CLIENT_ID = config('PAYPAL_CLIENT_ID')
PAYPAL_SECRET = config('PAYPAL_SECRET')
PAYPAL_API_BASE_URL = 'https://api-m.paypal.com' if PAYPAL_MODE == 'live' else 'https://api-m.sandbox.paypal.com'

class PayPalError(Exception):
    """Custom exception for PayPal-related errors"""
    pass

def handle_paypal_errors(func):
    """Decorator to handle PayPal API errors consistently"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal API network error: {str(e)}")
            return JsonResponse(
                {'error': 'Payment service temporarily unavailable'},
                status=503
            )
        except PayPalError as e:
            logger.error(f"PayPal API error: {str(e)}")
            return JsonResponse(
                {'error': str(e)},
                status=400
            )
        except Exception as e:
            logger.error(f"Unexpected error in PayPal integration: {str(e)}")
            return JsonResponse(
                {'error': 'An unexpected error occurred'},
                status=500
            )
    return wrapper

class PayPalService:
    """Service class to handle PayPal API interactions"""

    @staticmethod
    def get_access_token():
        """Get PayPal access token with caching"""
        cache_key = 'paypal_access_token'
        access_token = cache.get(cache_key)

        if access_token:
            return access_token

        try:
            print(f"PAYPAL_CLIENT_ID: {PAYPAL_CLIENT_ID}\nPAYPAL_SECRET:{PAYPAL_SECRET}")
            response = requests.post(
                f'{PAYPAL_API_BASE_URL}/v1/oauth2/token',
                headers={
                    'Accept': 'application/json',
                    'Accept-Language': 'en_US',
                },
                auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET),
                data={'grant_type': 'client_credentials'}
            )

            response.raise_for_status()
            data = response.json()
            access_token = data['access_token']

            # Cache the token for slightly less than its expiry time
            expires_in = int(data.get('expires_in', 32400))  # Default 9 hours
            cache.set(cache_key, access_token, expires_in - 300)  # Cache for 5 minutes less than expiry

            print(f"Access Token: {access_token}")
            return access_token
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to obtain PayPal access token: {str(e)}")
            raise PayPalError("Failed to initialize payment service")

    @staticmethod
    def validate_order_status(order):
        """Validate order status before processing payment"""
        if order.is_paid:
            raise PayPalError("Order has already been paid")
        if order.status == 'cancelled':
            raise PayPalError("Cannot process payment for cancelled order")
        return True

class CreatePayPalOrderView(APIView):
    """View to create a PayPal order"""
    permission_classes = [IsAuthenticated]

    @handle_paypal_errors
    def post(self, request):
        order_id = request.data.get('order_id')

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return JsonResponse({'error': 'Order not found'}, status=404)

        PayPalService.validate_order_status(order)
        access_token = PayPalService.get_access_token()

        # For demo orders with ALX coupon
        if order.coupon_code == "ALX":
            items = list(order.items.all())
            # If there's only one item
            if len(items) == 1:
                items_payload = [{
                    'name': items[0].menu_item.name,
                    'quantity': '1',  # Force quantity to 1
                    'unit_amount': {
                        'currency_code': 'USD',
                        'value': '0.01'
                    }
                }]
            else:
                # Multiple items: first item $0.01, rest $0
                items_payload = []
                for i, item in enumerate(items):
                    if i == 0:
                        items_payload.append({
                            'name': item.menu_item.name,
                            'quantity': '1',  # Force quantity to 1
                            'unit_amount': {
                                'currency_code': 'USD',
                                'value': '0.01'
                            }
                        })
                    else:
                        # For remaining items
                        items_payload.append({
                            'name': item.menu_item.name,
                            'quantity': '1',  # Force quantity to 1
                            'unit_amount': {
                                'currency_code': 'USD',
                                'value': '0.00'
                            }
                        })
            
            paypal_amount = '0.01'
            
        else:
            # Normal order - use actual prices
            items_payload = [{
                'name': item.menu_item.name,
                'quantity': str(item.quantity),
                'unit_amount': {
                    'currency_code': 'USD',
                    'value': str(item.unit_price)
                }
            } for item in order.items.all()]
            paypal_amount = str(order.total_amount)

        payload = {
            'intent': 'CAPTURE',
            'purchase_units': [{
                'reference_id': str(order.id),
                'description': f'Order #{order.id} from {order.restaurant.name}',
                'amount': {
                    'currency_code': 'USD',
                    'value': paypal_amount,
                    'breakdown': {
                        'item_total': {
                            'currency_code': 'USD',
                            'value': paypal_amount
                        }
                    }
                },
                'items': items_payload
            }]
        }

        response = requests.post(
            f'{PAYPAL_API_BASE_URL}/v2/checkout/orders',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}'
            },
            json=payload
        )
        
        if response.status_code != 200:
            logger.error(f"PayPal API Error Response: {response.text}")

        response.raise_for_status()
        return JsonResponse({'paypal_order_id': response.json()['id']})

class CapturePayPalOrderView(APIView):
    """View to capture (complete) a PayPal payment"""
    permission_classes = [IsAuthenticated]

    @handle_paypal_errors
    def post(self, request):
        paypal_order_id = request.data.get('paypal_order_id')
        order_id = request.data.get('order_id')

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return JsonResponse({'error': 'Order not found'}, status=404)

        PayPalService.validate_order_status(order)
        access_token = PayPalService.get_access_token()

        response = requests.post(
            f'{PAYPAL_API_BASE_URL}/v2/checkout/orders/{paypal_order_id}/capture',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}'
            }
        )

        response.raise_for_status()
        response_data = response.json()

        if response_data['status'] == 'COMPLETED':
            order.is_paid = True
            order.status = 'confirmed'  # Update status after successful payment
            order.save()
            
            # Queue the confirmation email task
            # send_order_confirmation_email(order.id, order.user.email)
            send_mail(order.id, order.user.email)
            
            # Log successful payment
            logger.info(f"Payment completed for order {order.id}")

            return JsonResponse({
                'status': 'success',
                'message': 'Payment completed successfully',
                'order_status': order.status,
            })
        else:
            logger.warning(f"Payment not completed for order {order.id}. Status: {response_data['status']}")
            return JsonResponse({
                'status': 'error',
                'message': 'Payment not completed',
                'details': response_data
            }, status=400)

def home(request):
    return render(request, 'home.html')
