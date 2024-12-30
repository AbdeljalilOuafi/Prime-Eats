
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from jwt import decode, InvalidTokenError
from decouple import config
import time


User = get_user_model()

class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Clerk JWT verification
    Use with DRF's IsAuthenticated permission class
    """

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
        """Verify the JWT token using Clerk's public key"""
        # public_key = """-----BEGIN PUBLIC KEY-----
        # MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtjuB+q5pkx7aKbkUGjZw
        # 6zn7ZRjUbC2LDAx+HAXUvrtk4KHTVUFyo20xzF4hN91vWq1EAUBH50NaylK6/hQw
        # erMw20kHnijXksqzeb3YGJEW020NmbRzmlFGDzQDUr2+a9NcsvBdHMHkuywiStns
        # eVDjGBOuCCmCILKmaAgzkPNur2QcdfvWyaTvPjNmMvoaAg4mJCum/LZt0FlzRGBg
        # 3JBAw6lZSWArQJEUp0rKoscHj2Q9qATawR4nPbBnLT/3qi6S9kBZKg19lznNcqNT
        # ewbsyzieSCd/+DosXJsDq+Mr5+GUbrD3W3wKnoaiToqFnHsoIOaJT/6zB/FDHWh4
        # OwIDAQAB
        # -----END PUBLIC KEY-----"""

        public_key = config('CLERK_PUBLIC_KEY')
        PERMITTED_ORIGINS = [
            'http://localhost:3000',
            'http://localhost:8000',
            'http://localhost:5173'
            # Add react vite port here
            ]

        try:
            # Decode and verify the token
            decoded = decode(
                token,
                public_key,
                algorithms=['RS256'],
                options={'verify_exp': True}
            )

            # Validate token timing
            current_time = int(time.time())
            if decoded.get('exp') < current_time:
                raise AuthenticationFailed('Token has expired')
            if decoded.get('nbf') and decoded.get('nbf') > current_time:
                raise AuthenticationFailed('Token is not yet valid')

            # Validate authorized party (azp)
            azp = decoded.get('azp')
            if azp and azp not in PERMITTED_ORIGINS:
                raise AuthenticationFailed('Invalid authorized party')

            return decoded

        except InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            raise AuthenticationFailed(f'Token verification failed: {str(e)}')

    def authenticate(self, request):
        """
        Authenticate the request and return a tuple of (user, auth)
        """
        token = self.get_token(request)

        if not token:
            return None

        try:
            # Verify the token
            decoded = self.verify_token(token)

            # Get user info from token claims
            user_id = decoded.get('sub')  # Clerk uses 'sub' for user ID
            email = decoded.get('email')

            if not user_id:
                raise AuthenticationFailed('Invalid token: missing user ID')

            # Get or create user based on Clerk ID
            user, created = User.objects.get_or_create(
                clerk_id=user_id,
                defaults={
                    'username': user_id,  # or email, or whatever you prefer
                    'email': email,
                    # Set other fields as needed
                }
            )

            if created:
                # Fetch and Populate user.profile here
                pass

            return (user, None)  # Authentication successful

        except AuthenticationFailed as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')

    def authenticate_header(self, request):
        """
        Return a string to be used as the value of the `WWW-Authenticate`
        header in a `401 Unauthenticated` response
        """
        return 'Bearer realm="api"'
