"""
Sales related views.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from ..models import Venta, Carrito
from ..serializers.venta import VentaSerializer, ConfirmarPagoSerializer
from .base import BaseViewSet

class VentaViewSet(BaseViewSet):
    """ViewSet for managing sales."""
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return sales for the current user or all sales for staff."""
        if self.request.user.is_staff:
            return Venta.objects.all()
        return Venta.objects.filter(usuario=self.request.user)
    
    def get_serializer_context(self):
        """Add the cart to the serializer context."""
        context = super().get_serializer_context()
        if self.action == 'create':
            cart = get_object_or_404(Carrito, usuario=self.request.user)
            context['carrito'] = cart
        return context
    
    @action(detail=False, methods=['post'])
    def confirmar_pago(self, request):
        """Confirm payment and create a sale from the cart."""
        cart = get_object_or_404(Carrito, usuario=request.user)
        
        # Check if cart is empty
        if not cart.items.exists():
            return Response(
                {'detail': 'El carrito está vacío.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate payment data
        serializer = ConfirmarPagoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create sale in a transaction
        with transaction.atomic():
            # Create sale
            venta = Venta.objects.create(
                usuario=request.user,
                metodo_pago=serializer.validated_data['metodo_pago'],
                notas=serializer.validated_data.get('notas', ''),
                fecha_viaje=serializer.validated_data.get('fecha_viaje')
            )
            
            # Add cart items to sale details
            for item in cart.items.all():
                venta.items.create(
                    paquete=item.paquete,
                    cantidad=item.cantidad,
                    precio_unitario=item.paquete.precio,
                    fecha_viaje=item.fecha_viaje
                )
            
            # Clear the cart
            cart.items.all().delete()
        
        # Return the created sale
        serializer = self.get_serializer(venta)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def confirmar_pago_existente(self, request, pk=None):
        """Confirm payment for an existing sale."""
        venta = self.get_object()
        
        if venta.estado != 'pendiente':
            return Response(
                {'detail': 'Solo se puede confirmar el pago de una venta pendiente.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        venta.pago_confirmado = True
        venta.estado = 'confirmada'
        venta.save()
        
        serializer = self.get_serializer(venta)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancel a sale."""
        venta = self.get_object()
        
        if venta.estado == 'cancelada':
            return Response(
                {'detail': 'La venta ya está cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        venta.estado = 'cancelada'
        venta.save()
        
        serializer = self.get_serializer(venta)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mis_compras(self, request):
        """Get the current user's purchases."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
