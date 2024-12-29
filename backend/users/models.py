# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    clerk_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    def __str__(self):
        return self.email
