"""
User related views.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from ..models import Usuario
from ..serializers.usuario import (
    UsuarioSerializer,
    UsuarioProfileSerializer
)
from .base import BaseViewSet

class UsuarioViewSet(BaseViewSet):
    """ViewSet for managing users."""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only the authenticated user's profile for non-staff users."""
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(id=self.request.user.id)
    
    def get_permissions(self):
        """Allow unauthenticated users to register."""
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ['retrieve', 'update', 'partial_update', 'me']:
            return UsuarioProfileSerializer
        return self.serializer_class
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Retrieve the authenticated user's profile.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def check_email(self, request):
        """
        Check if an email is already registered.
        """
        email = request.data.get('email')
        if not email:
            return Response(
                {'email': ['Este campo es obligatorio.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = Usuario.objects.filter(email__iexact=email).exists()
        return Response({'exists': exists}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Change the authenticated user's password.
        """
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not all([old_password, new_password]):
            return Response(
                {'detail': 'Se requieren tanto la contraseña antigua como la nueva.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(old_password):
            return Response(
                {'old_password': ['La contraseña actual es incorrecta.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'new_password': ['La contraseña debe tener al menos 8 caracteres.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        # Invalidate all tokens
        RefreshToken.for_user(user)
        
        return Response(
            {'detail': 'Contraseña actualizada correctamente.'},
            status=status.HTTP_200_OK
        )
