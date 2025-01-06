#!/usr/bin/env python3
"""clear_cache module"""

import os
import django

# Set the DJANGO_SETTINGS_MODULE environment variable to point to settings
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.cache import cache

def clear_cache():
    cache.clear()
    return "Cache Cleared successfully"

if __name__ == "__main__":
    print(clear_cache())
