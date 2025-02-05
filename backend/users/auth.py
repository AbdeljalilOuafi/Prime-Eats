#!/usr/bin/env python3
"""auth module"""

from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from jwt import decode, InvalidTokenError, get_unverified_header

from decouple import config
from django.core.cache import cache
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from cryptography.hazmat.backends import default_backend
from jwt import decode, get_unverified_header
import requests
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from base64 import urlsafe_b64decode
import random



User = get_user_model()

class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Clerk JWT verification
    Use with DRF's IsAuthenticated permission class
    """
    def __init__(self):
        self.PERMITTED_ORIGINS = [
            'http://localhost:3000',
            'http://localhost:8000',
            'http://localhost:5173',
            'https://primeeats.live',
            'https://api.primeeats.live'
        ]

    def get_token(self, request):
        """Extract token from either cookie or Authorization header"""
        # First try to get from cookie for same-origin requests
        token = request.COOKIES.get('__session')

        # If not in cookie, try Authorization header for cross-origin
        if not token:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                return None
        return token

    def verify_token(self, token):
        """Verify the JWT token using Clerk's JWKS"""
        try:
            # Get key ID from token header
            token_headers = get_unverified_header(token)
            kid = token_headers.get('kid')

            if not kid:
                raise AuthenticationFailed('No key ID found in token header')

            # Fetch JWKS
            clerk_secret_key = config('CLERK_SECRET_KEY')
            headers = {
                'Authorization': f'Bearer {clerk_secret_key}'
            }

            jwks_url = 'https://clerk.primeeats.live/.well-known/jwks.json'
            jwks_response = requests.get(jwks_url, headers=headers)

            if not jwks_response.ok:
                raise AuthenticationFailed(f'Failed to fetch JWKS: {jwks_response.text}')

            jwks = jwks_response.json()

            # Find matching key
            public_key = None
            for key in jwks['keys']:
                if key['kid'] == kid:
                    if key['kty'] != 'RSA':
                        raise AuthenticationFailed('Unsupported key type')

                    def decode_base64(data):
                        pad = b'=' * (-len(data) % 4)
                        return urlsafe_b64decode(data.encode('ascii') + pad)

                    # Extract the modulus and exponent
                    e_decoded = int.from_bytes(decode_base64(key['e']), byteorder='big')
                    n_decoded = int.from_bytes(decode_base64(key['n']), byteorder='big')

                    # Create RSA public key
                    numbers = RSAPublicNumbers(e_decoded, n_decoded)
                    public_key = numbers.public_key(default_backend())
                    break

            if not public_key:
                raise AuthenticationFailed('No matching key found in JWKS')

            # Verify token using the public key directly
            decoded = decode(
                token,
                key=public_key,  # Use the public key object directly
                algorithms=['RS256'],
                options={'verify_exp': False}
            )

            # Clerk handle token expiration time now so no need for this
            
            # current_time = int(time.time())
            # if decoded.get('exp') < current_time:
            #     raise AuthenticationFailed('Token has expired')
            # if decoded.get('nbf') and decoded.get('nbf') > current_time:
            #     raise AuthenticationFailed('Token is not yet valid')

            azp = decoded.get('azp')
            if azp and azp not in self.PERMITTED_ORIGINS:
                raise AuthenticationFailed('Invalid authorized party')

            return decoded

        except Exception as e:
            print(f"Detailed error in verify_token: {str(e)}")
            raise AuthenticationFailed(f'Token verification failed: {str(e)}')

    def authenticate(self, request):
        """
        Authenticate the request and return a tuple of (user, auth)
        """
        token = self.get_token(request)

        if not token:
            return None  # Return None which would default to AnonymousUser

        try:
            # Verify the token
            decoded = self.verify_token(token)

            # Get user info from token claims
            user_id = decoded.get('sub')  # Clerk uses 'sub' for user ID

            if not user_id:
                raise AuthenticationFailed('Invalid token: missing user ID')

            # Check cache or database for an existing user
            user = self.get_or_create_user(user_id)
            return (user, None) # Successful Authentication

        except AuthenticationFailed as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')

    def get_or_create_user(self, user_id):
        """Fetch or create a user based on Clerk user_id."""
        # Check cache first
        cached_user = cache.get(f'user_{user_id}')
        if cached_user:
            return cached_user

        # Query database
        try:
            user = User.objects.get(clerk_id=user_id)
            cache.set(f'user_{user_id}', user, timeout=3600)  # Cache for 1 hour
            return user
        except User.DoesNotExist:
            # Fetch user info from Clerk and create the user
            return self.fetch_and_create_user(user_id)

    def fetch_and_create_user(self, user_id):
        #Fetch User data
        clerk_secret_key = config('CLERK_SECRET_KEY')
        headers = {'Authorization': f'Bearer {clerk_secret_key}'}
        user_info_url = f"https://api.clerk.com/v1/users/{user_id}"
        response = requests.get(user_info_url, headers=headers)

        if not response.ok:
            raise AuthenticationFailed("Failed to fetch user info from Clerk")

        user_data = response.json()
        email_addresses = user_data.get('email_addresses', [])
        primary_email = next(
            (email.get('email_address') for email in email_addresses if email.get('id') == user_data.get('primary_email_address_id')),
            None
        )
        if not primary_email:
            raise AuthenticationFailed('Primary email is missing from Clerk data')

        username = user_data.get('username') or f"{user_id[:8]}"
        while User.objects.filter(username=username).exists():
            random_number = random.randint(1, 100)
            username += str(random_number)

        if user_data.get('has_image'):
            image_url = user_data.get('image_url')
        else:
            image_url = ""


        user = User.objects.create(
            clerk_id=user_id,
            email=primary_email,
            username=username,
            profile_image_url=image_url,
        )

        # Cache the newly created user
        cache.set(f'user_{user_id}', user, timeout=3600)  # Cache for 1 hour

        return user
