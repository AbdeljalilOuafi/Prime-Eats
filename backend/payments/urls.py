from django.urls import path
from . import views

urlpatterns = [
    path('create-paypal-order/', views.CreatePayPalOrderView.as_view(), name='create-paypal-order'),
    path('capture-paypal-order/', views.CapturePayPalOrderView.as_view(), name='capture-paypal-order'),
    path('test', views.home)
]
