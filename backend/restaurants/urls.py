from django.urls import path
from . import views

urlpatterns = [
    path('', views.RestaurantListView.as_view(), name="list-restraurants"),
    path('chain-restaurants/', views.ChainRestaurantListView.as_view(), name="list-chain-restraurants"),
]

