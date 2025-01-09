#!/usr/bin/env python3
"""core/deployement_settings module"""


import os
import dj_database_url
from .settings import *
from .settings import BASE_DIR

print("Loading deployment settings...")

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'prime-eats-backend.onrender.com',
    'primeeats.live',
    'www.primeeats.live',
    'api.primeeats.live',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Keep local development URL
    'https://primeeats.live',
    'https://www.primeeats.live',
    'https://api.primeeats.live',
    'https://prime-eats-backend.onrender.com',
]

CSRF_TRUSTED_ORIGINS = [
    'https://prime-eats-backend.onrender.com',
    'https://primeeats.live',
    'https://www.primeeats.live',
    'https://api.primeeats.live',
]

DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY') #MAKE SECRET_KEY AS ENVIRONMENT VARIABLE IN RENDER


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

STORAGES = {
    "default":{
        "BACKEND" : "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND" : "whitenoise.storage.CompressedStaticFilesStorage",
    },

}

DATABASES = {
    'default': dj_database_url.config(
        default= os.environ['DATABASE_URL'],
        conn_max_age=600
    )
}

PAYPAL_MODE = 'live'
