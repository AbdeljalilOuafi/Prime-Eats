#!/usr/bin/env python3
"""core/deployement_settings module"""


import os
import dj_database_url
from .settings import *
from .settings import BASE_DIR

ALLOWED_HOSTS = [
    os.environ.get('RENDER_EXTERNAL_HOSTNAME'),
    'primeeats.live',
    'www.primeeats.live',
    'api.primeeats.live',
]

CSRF_TRUSTED_ORIGINS = [
    'https://' + os.environ.get('RENDER_EXTERNAL_HOSTNAME'),
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
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'https://primeeats.live',
    'https://www.primeeats.live',
    'https://api.primeeats.live'
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
