from django.db import models


class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    rounded_coordinates = models.CharField(max_length=50, db_index=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    source = models.CharField(max_length=50)  # 'google', 'yelp', or 'faker'
    image_url = models.CharField(max_length=500, null=True, blank=True)
    cuisine_type = models.ForeignKey('CuisineType', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.source})"

class CuisineType(models.Model):
    name = models.CharField(max_length=100, unique=True)  # e.g., 'Italian', 'Chinese'

    def __str__(self):
        return self.name

class Menu(models.Model):
    cuisine_type = models.OneToOneField(CuisineType, on_delete=models.CASCADE, related_name='menu')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.cuisine_type.name} Menu"

class Category(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g., 'Appetizers', 'Pasta'

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.menu.cuisine_type.name} - {self.name}"

class MenuItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.category.menu.cuisine_type.name})"


class ChainRestaurant(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    menu = models.JSONField()

class FetchRestaurant(models.Model):
    rounded_coordinates = models.CharField(max_length=50, db_index=True)
    restaurants = models.ManyToManyField('Restaurant')
    chain_restaurants = models.ManyToManyField('ChainRestaurant')
    created_at = models.DateTimeField(auto_now_add=True)
