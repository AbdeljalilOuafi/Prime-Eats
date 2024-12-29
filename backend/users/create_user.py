from auth import ClerkAuthentication
import os
import sys
import django
from django.contrib.auth import get_user_model

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
User = get_user_model()

User.objects.all().delete()

print(ClerkAuthentication.create_user("abdeljalilouafi55@gmail.com", "PASSWORD"))
