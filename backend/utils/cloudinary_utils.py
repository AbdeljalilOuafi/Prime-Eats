#!/usr/bin/env python3
"""cloudinary module"""

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from decouple import config

# Configuration
cloudinary.config(
    cloud_name="dqeyi8yx1",
    api_key="582353633926898",
    api_secret=config('CLOUDINARY_API_SECRET'),
    secure=True,
)

# Open the file in binary mode
with open("nice.jpg", "rb") as file:
    # Upload the file
    upload_result = cloudinary.uploader.upload(file, public_id="nice")
    print(f'File URL: {upload_result["secure_url"]}')

