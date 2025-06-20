from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def create_admin_user(request):
    """Endpoint temporal para crear usuario admin"""
    try:
        # Verificar si el usuario ya existe
        if User.objects.filter(email='admin@tour.com').exists():
            return Response({
                'message': 'El usuario admin ya existe',
                'email': 'admin@tour.com',
                'password': 'admin1234'
            }, status=status.HTTP_200_OK)
        
        # Crear el usuario admin
        admin_user = User.objects.create_superuser(
            email='admin@tour.com',
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
