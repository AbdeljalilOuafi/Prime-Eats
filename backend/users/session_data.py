

# I don't think Frontend will need this but i made it just in case
def get_clerk_session_data(session_id):
    """Fetch session data from Clerk using the Session ID"""
    try:
        response = requests.get(
            f'https://api.clerk.dev/v1/sessions/{session_id}',
            headers={
                'Authorization': f'Bearer {settings.CLERK_SECRET_KEY}',
                'Content-Type': 'application/json'
            }
        )

        if response.status_code == 200:
            session_data = response.json()
            return {
                'status': session_data.get('status'),
                'last_active_at': session_data.get('last_active_at'),
                'expire_at': session_data.get('expire_at'),
                'abandon_at': session_data.get('abandon_at'),
                'client': session_data.get('client'),  # Contains device, browser info
                # Add any other fields you need
            }
        return None

    except Exception as e:
        print(f"Error fetching session data: {e}")
        return None

# Example of using both in a view:
class UserSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the session ID from the current JWT token
        token = request.COOKIES.get('__session')
        if token:
            decoded = decode(token, public_key, algorithms=['RS256'])
            session_id = decoded.get('sid')

            return Response({
                'session_data': get_clerk_session_data(session_id)
            })
        return Response({'error': 'No session token found'}, status=400)
