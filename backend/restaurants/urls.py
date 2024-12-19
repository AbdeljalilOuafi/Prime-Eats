from django.urls import path
from . import views

urlpatterns = [
    path('', views.RestaurantListView.as_view(), name="list-restraurants"),
    path('test_params', views.ReturnParams.as_view())
]

