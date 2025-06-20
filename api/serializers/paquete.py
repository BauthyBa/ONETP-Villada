"""
Serializers for the package API views.
"""
from rest_framework import serializers
from ..models import CategoriaPaquete, Paquete
from .base import BaseModelSerializer

class CategoriaPaqueteSerializer(BaseModelSerializer):
    """Serializer for the package category model."""
    class Meta:
        model = CategoriaPaquete
        fields = ['id', 'nombre', 'descripcion', 'icono', 'is_active']
        read_only_fields = ['id', 'is_active']

class PaqueteSerializer(BaseModelSerializer):
    """Serializer for the package model."""
    categoria = CategoriaPaqueteSerializer(read_only=True)
    categoria_id = serializers.UUIDField(write_only=True)
    disponibilidad = serializers.IntegerField(read_only=True)
    disponible = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Paquete
        fields = [
            'id', 'nombre', 'descripcion', 'precio', 'duracion_dias',
            'dificultad', 'categoria', 'categoria_id', 'imagen_principal',
            'destacado', 'cupo_maximo', 'disponibilidad', 'disponible',
            'incluye', 'no_incluye', 'requisitos', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active']
    
    def validate_categoria_id(self, value):
        """Check that the category exists."""
        from ..models import CategoriaPaquete
        if not CategoriaPaquete.objects.filter(id=value).exists():
            raise serializers.ValidationError("La categoría especificada no existe.")
        return value
    
    def create(self, validated_data):
        """Create a new package."""
        categoria_id = validated_data.pop('categoria_id')
        categoria = CategoriaPaquete.objects.get(id=categoria_id)
        paquete = Paquete.objects.create(categoria=categoria, **validated_data)
        return paquete
    
    def update(self, instance, validated_data):
        """Update an existing package."""
        categoria_id = validated_data.pop('categoria_id', None)
        
        if categoria_id:
            from ..models import CategoriaPaquete
            instance.categoria = CategoriaPaquete.objects.get(id=categoria_id)
        
        return super().update(instance, validated_data)

class PaqueteImageSerializer(serializers.ModelSerializer):
    """Serializer for uploading images to packages."""
    class Meta:
        model = Paquete
        fields = ['id', 'imagen_principal']
        read_only_fields = ['id']
        extra_kwargs = {'imagen_principal': {'required': True}}
