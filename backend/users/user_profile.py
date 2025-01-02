import requests
from django.conf import settings


#Create a Profile Model that has a OnetoOne relationship with user. when the user is created
# you should also populate the User profile using this function.
# It'll be a good idea if this was done in the background using Celery

#Add this function as a method for ClerkAuthentication class in auth.py
#Call it when a new user is created
def get_clerk_user_data(user_id):
    """Fetch user data from Clerk using the User ID"""
    try:
        response = requests.get(
            f'https://api.clerk.dev/v1/users/{user_id}',
            headers={
                'Authorization': f'Bearer {settings.CLERK_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
        )

        if response.status_code == 200:
            user_data = response.json()
            return {
                'first_name': user_data.get('first_name'),
                'last_name': user_data.get('last_name'),
                'profile_image_url': user_data.get('profile_image_url'),
                'phone_numbers': [phone['phone_number'] for phone in user_data.get('phone_numbers', [])],
                'email_addresses': [email['email_address'] for email in user_data.get('email_addresses', [])],
                'external_accounts': user_data.get('external_accounts', []),
                'created_at': user_data.get('created_at'),
                # Add any other fields you need
            }
        else:
            print(f"Failed to fetch user data: {response.status_code}")
            return None

    except Exception as e:
        print(f"Error fetching user data: {e}")
        return None

# Usage example in a view:
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile_data = UserProfileSerializer(request.user.profile).data
        return Response(profile_data, status=status.HTTP_200_OK)
