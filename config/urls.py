"""
URL configuration for config project.

Including the API URLs and serving media files in development.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password

User = get_user_model()

def healthcheck(request):
    """Simple healthcheck endpoint for Railway deployment."""
    return JsonResponse({"status": "ok", "message": "ONIET API is running"})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def verify_admin(request):
    """Endpoint para verificar y crear usuario admin"""
    try:
        # Verificar si el usuario admin existe
        admin_user = User.objects.filter(email='admin@tourpackages.com').first()
        
        if admin_user:
            return Response({
                'message': 'Usuario admin existe',
                'email': admin_user.email,
                'password': 'admin1234',
                'nombre': admin_user.nombre,
                'apellido': admin_user.apellido,
                'tipo_usuario': admin_user.tipo_usuario,
                'is_staff': admin_user.is_staff,
                'is_superuser': admin_user.is_superuser,
                'admin_url': 'https://oniet-backend.onrender.com/admin/'
            }, status=status.HTTP_200_OK)
        else:
            # Crear el usuario admin si no existe
            if request.method == 'POST':
                admin_user = User.objects.create_superuser(
                    email='admin@tourpackages.com',
                    password='admin1234',
                    nombre='Admin',
                    apellido='User',
                    tipo_usuario='admin'
                )
                return Response({
                    'message': 'Usuario admin creado exitosamente!',
                    'email': admin_user.email,
                    'password': 'admin1234',
                    'nombre': admin_user.nombre,
                    'apellido': admin_user.apellido,
                    'tipo_usuario': admin_user.tipo_usuario,
                    'is_staff': admin_user.is_staff,
                    'is_superuser': admin_user.is_superuser,
                    'admin_url': 'https://oniet-backend.onrender.com/admin/'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'Usuario admin no existe. Usa POST para crearlo.',
                    'admin_url': 'https://oniet-backend.onrender.com/admin/'
                }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'error': f'Error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_admin_simple(request):
    """Endpoint simple para crear usuario admin en la raíz"""
    try:
        # Verificar si el usuario ya existe
        if User.objects.filter(email='admin@tourpackages.com').exists():
            return Response({
                'message': 'El usuario admin ya existe',
                'email': 'admin@tourpackages.com',
                'password': 'admin1234'
            }, status=status.HTTP_200_OK)
        
        # Crear el usuario admin
        admin_user = User.objects.create_superuser(
            email='admin@tourpackages.com',
            password='admin1234',
            nombre='Admin',
            apellido='User',
            tipo_usuario='admin'
        )
        
        return Response({
            'message': 'Usuario admin creado exitosamente!',
            'email': admin_user.email,
            'password': 'admin1234',
            'nombre': admin_user.nombre,
            'apellido': admin_user.apellido,
            'tipo_usuario': admin_user.tipo_usuario
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Error creando usuario admin: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

urlpatterns = [
    # Healthcheck endpoint
    path('', healthcheck, name='healthcheck'),
    
    # Admin verification and creation endpoint
    path('verify-admin/', verify_admin, name='verify_admin'),
    
    # Admin creation endpoint (simple)
    path('create-admin/', create_admin_simple, name='create_admin_simple'),
    
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
