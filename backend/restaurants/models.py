from django.db import models

# Create your models here.

class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    rounded_coordinates = models.CharField(max_length=50, db_index=True)  # For fast lookup
    address = models.CharField(max_length=500, null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    source = models.CharField(max_length=50)  # 'google', 'yelp', or 'faker'
    menu = models.JSONField(null=True, blank=True)  # Store the menu as JSON
    image_url = models.CharField(max_length=500, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.source})"

class FetchRestaurant(models.Model):
    rounded_coordinates = models.CharField(max_length=50, db_index=True)  # Rounded latitude and longitude
    restaurants = models.ManyToManyField('Restaurant')
    chain_restaurants = models.ManyToManyField('ChainRestaurant')
    created_at = models.DateTimeField(auto_now_add=True)

class ChainRestaurant(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    menu = models.JSONField()
