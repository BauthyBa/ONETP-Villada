"""
URL configurations for the API.
"""
from django.urls import include, path

# Import all versioned URL configurations
from .v1 import urlpatterns as v1_urls

# Current API version
CURRENT_API_VERSION = 'v1'

# Map of API versions to their URL configurations
urlpatterns = [
    # Current version (no namespace for the root API)
    path('', include(v1_urls)),
    
    # Versioned APIs
    path('v1/', include((v1_urls, 'v1'), namespace='v1')),
]
