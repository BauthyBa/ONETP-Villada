"""
Serializers for the sales API views.
"""
from rest_framework import serializers
from ..models import Venta, VentaDetalle, CarritoItem, Paquete
from .paquete import PaqueteSerializer

class VentaDetalleSerializer(serializers.ModelSerializer):
    """Serializer for the sale detail model."""
    id = serializers.UUIDField(read_only=True)
    paquete = PaqueteSerializer(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )

    class Meta:
        model = VentaDetalle
        fields = [
            'id', 'paquete', 'cantidad', 'precio_unitario',
            'fecha_viaje', 'subtotal', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'paquete', 'precio_unitario', 'subtotal',
            'created_at', 'updated_at'
        ]

class VentaSerializer(serializers.ModelSerializer):
    """Serializer for the sale model."""
    items = VentaDetalleSerializer(many=True, read_only=True)
    total = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    cantidad_items = serializers.IntegerField(read_only=True)
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)
    codigo = serializers.CharField(read_only=True)
    
    class Meta:
        model = Venta
        fields = [
            'id', 'codigo', 'usuario', 'fecha_venta', 'fecha_viaje',
            'estado', 'metodo_pago', 'pago_confirmado',
            'fecha_confirmacion_pago', 'notas', 'items',
            'total', 'cantidad_items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'codigo', 'usuario', 'fecha_venta', 'estado',
            'pago_confirmado', 'fecha_confirmacion_pago',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create a new sale from the shopping cart."""
        carrito = self.context['carrito']
        usuario = self.context['request'].user
        
        # Create sale
        venta = Venta.objects.create(
            usuario=usuario,
            metodo_pago=validated_data.get('metodo_pago', 'efectivo'),
            notas=validated_data.get('notas', ''),
            fecha_viaje=validated_data.get('fecha_viaje')
        )
        
        # Add cart items to sale details
        for item in carrito.items.all():
            VentaDetalle.objects.create(
                venta=venta,
                paquete=item.paquete,
                cantidad=item.cantidad,
                precio_unitario=item.paquete.precio,
                fecha_viaje=item.fecha_viaje
            )
        
        # Clear the cart
        carrito.items.all().delete()
        
        return venta

class ConfirmarPagoSerializer(serializers.Serializer):
    """Serializer for confirming payment."""
    metodo_pago = serializers.ChoiceField(
        choices=Venta.METODO_PAGO_CHOICES,
        required=True
    )
    notas = serializers.CharField(required=False, allow_blank=True)
    fecha_viaje = serializers.DateField(required=False, allow_null=True)
