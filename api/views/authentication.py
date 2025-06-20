"""
Authentication views for the API.
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from ..serializers.usuario import (
    UsuarioSerializer, 
    AuthTokenSerializer,
    CustomTokenObtainPairSerializer as BaseCustomTokenObtainPairSerializer,
    UsuarioProfileSerializer
)

Usuario = get_user_model()

class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UsuarioProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(TokenObtainPairView):
    """Login a user and return JWT tokens."""
    serializer_class = BaseCustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

class LogoutView(APIView):
    """Logout a user by blacklisting their refresh token."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(
                {"detail": "Token inválido o expirado"},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's profile."""
    serializer_class = UsuarioProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class CustomTokenObtainPairSerializer(BaseCustomTokenObtainPairSerializer):
    def validate(self, attrs):
        # Permitir que 'username' funcione como alias de 'email'
        if 'username' in attrs and 'email' not in attrs:
            attrs['email'] = attrs['username']
        elif 'email' in attrs and 'username' not in attrs:
            attrs['username'] = attrs['email']
        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
