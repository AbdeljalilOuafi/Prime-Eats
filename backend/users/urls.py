from django.urls import path
from . import views

urlpatterns = [
    path('test-clerk/', views.ProtectedView.as_view(), name="protected-view"),
]
