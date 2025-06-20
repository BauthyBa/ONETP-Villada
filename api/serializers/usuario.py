"""
Serializers for the user API views.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from ..models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer for the user object."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password', 'placeholder': 'Contraseña'},
        min_length=8,
        max_length=68
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password', 'placeholder': 'Confirmar Contraseña'},
        min_length=8,
        max_length=68
    )

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'password', 'password2',
            'nombre', 'apellido', 'telefono', 'direccion',
            'fecha_nacimiento', 'tipo_usuario', 'is_active'
        ]
        read_only_fields = ('id', 'is_active', 'tipo_usuario')
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        """Create and return a user with encrypted password."""
        validated_data.pop('password2', None)
        return Usuario.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update and return user."""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        
        if password:
            user.set_password(password)
            user.save()
            
        return user

class AuthTokenSerializer(serializers.Serializer):
    """Serializer for the user authentication object."""
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        """Validate and authenticate the user."""
        # Permitir 'username' como alias de 'email'
        email = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )

            if not user:
                msg = _('No se pudo autenticar con las credenciales proporcionadas.')
                raise serializers.ValidationError(msg, code='authorization')

            if not user.is_active:
                msg = _('Esta cuenta ha sido deshabilitada.')
                raise serializers.ValidationError(msg, code='authorization')

        else:
            msg = _('Debe incluir "email" (o "username") y "contraseña".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer to include user data in the response."""
    username = serializers.CharField(required=False, write_only=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Hacer que email no sea requerido si se proporciona username
        self.fields['email'].required = False
    
    def validate(self, attrs):
        # Permitir 'username' como alias de 'email'
        if 'username' in attrs and 'email' not in attrs:
            attrs['email'] = attrs['username']
        
        # Remover username de attrs para evitar conflictos
        attrs.pop('username', None)
        
        data = super().validate(attrs)
        
        # Add custom claims
        data.update({
            'user': {
                'id': self.user.id,
                'email': self.user.email,
                'nombre': self.user.nombre,
                'apellido': self.user.apellido,
                'tipo_usuario': self.user.tipo_usuario,
                'is_staff': self.user.is_staff,
                'is_superuser': self.user.is_superuser,
            }
        })
        
        return data

class UsuarioProfileSerializer(serializers.ModelSerializer):
    """Serializer for the user profile."""
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre', 'apellido',
            'telefono', 'direccion', 'fecha_nacimiento',
            'tipo_usuario', 'is_active', 'last_login'
        ]
        read_only_fields = ('id', 'email', 'tipo_usuario', 'is_active', 'last_login')
