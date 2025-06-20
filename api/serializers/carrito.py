"""
Serializers for the shopping cart API views.
"""
from rest_framework import serializers
from ..models import Carrito, CarritoItem, Paquete
from .paquete import PaqueteSerializer

class CarritoItemSerializer(serializers.ModelSerializer):
    """Serializer for the shopping cart item model."""
    id = serializers.UUIDField(read_only=True)
    paquete = PaqueteSerializer(read_only=True)
    paquete_id = serializers.UUIDField(write_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )

    class Meta:
        model = CarritoItem
        fields = [
            'id', 'paquete', 'paquete_id', 'cantidad', 
            'fecha_viaje', 'subtotal', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'subtotal']

    def validate_paquete_id(self, value):
        """Check that the package exists."""
        if not Paquete.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("El paquete especificado no existe o no está disponible.")
        return value

    def validate_cantidad(self, value):
        """Check that the quantity is valid."""
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        return value

    def create(self, validated_data):
        """Create a new cart item."""
        carrito = self.context['carrito']
        paquete_id = validated_data.pop('paquete_id')
        
        # Check if item already exists in cart
        carrito_item = carrito.items.filter(
            paquete_id=paquete_id,
            fecha_viaje=validated_data.get('fecha_viaje')
        ).first()
        
        if carrito_item:
            # Update quantity if item already in cart
            carrito_item.cantidad += validated_data.get('cantidad', 1)
            carrito_item.save()
            return carrito_item
        else:
            # Create new cart item
            return CarritoItem.objects.create(
                carrito=carrito,
                paquete_id=paquete_id,
                **validated_data
            )

class CarritoSerializer(serializers.ModelSerializer):
    """Serializer for the shopping cart model."""
    items = CarritoItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    cantidad_items = serializers.IntegerField(read_only=True)
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Carrito
        fields = [
            'id', 'usuario', 'items', 'total', 
            'cantidad_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usuario', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # Cart is updated through cart items, not directly
        return instance
