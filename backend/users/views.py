from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"status": "OK",
                         "message": f"Authenticated as {request.user.email}",
                         "profile_picture": request.user.profile_image_url,
                         "username": request.user.username
                         }, status=status.HTTP_200_OK)
