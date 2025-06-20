"""
URL configuration for config project.

Including the API URLs and serving media files in development.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def healthcheck(request):
    """Simple healthcheck endpoint for Railway deployment."""
    return JsonResponse({"status": "ok", "message": "ONIET API is running"})

urlpatterns = [
    # Healthcheck endpoint
    path('', healthcheck, name='healthcheck'),
    
    # Django admin
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/v1/', include('api.urls')),
    
    # JWT Authentication
    path('api/v1/auth/', include('api.urls.auth', namespace='auth')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
