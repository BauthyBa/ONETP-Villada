"""
Shopping cart related views.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from ..models import Carrito, CarritoItem, Paquete
from ..serializers.carrito import CarritoSerializer, CarritoItemSerializer
from .base import BaseViewSet

class CarritoViewSet(BaseViewSet):
    """ViewSet for managing shopping carts."""
    serializer_class = CarritoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return the current user's cart."""
        # Get or create cart for the current user
        cart, _ = Carrito.objects.get_or_create(usuario=self.request.user)
        return Carrito.objects.filter(id=cart.id)
    
    def get_serializer_context(self):
        """Add the cart to the serializer context."""
        context = super().get_serializer_context()
        cart, _ = Carrito.objects.get_or_create(usuario=self.request.user)
        context['cart'] = cart
        return context
    
    @action(detail=False, methods=['get'])
    def mi_carrito(self, request):
        """Get the current user's cart."""
        cart = get_object_or_404(Carrito, usuario=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def agregar_item(self, request):
        """Add an item to the cart."""
        cart, _ = Carrito.objects.get_or_create(usuario=request.user)
        
        # Add cart to request data for validation
        data = request.data.copy()
        data['carrito'] = cart.id
        
        serializer = CarritoItemSerializer(
            data=data,
            context={'carrito': cart, 'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def vaciar(self, request):
        """Empty the cart."""
        cart = get_object_or_404(Carrito, usuario=request.user)
        cart.items.all().delete()
        return Response(
            {'detail': 'El carrito ha sido vaciado.'},
            status=status.HTTP_200_OK
        )

class CarritoItemViewSet(BaseViewSet):
    """ViewSet for managing cart items."""
    serializer_class = CarritoItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return items from the current user's cart."""
        cart = get_object_or_404(Carrito, usuario=self.request.user)
        return CarritoItem.objects.filter(carrito=cart)
    
    def get_serializer_context(self):
        """Add the cart to the serializer context."""
        context = super().get_serializer_context()
        cart = get_object_or_404(Carrito, usuario=self.request.user)
        context['carrito'] = cart
        return context
    
    def destroy(self, request, *args, **kwargs):
        """Remove an item from the cart."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'detail': 'El ítem ha sido eliminado del carrito.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def incrementar(self, request, pk=None):
        """Increment the quantity of an item in the cart."""
        item = self.get_object()
        item.cantidad += 1
        item.save()
        serializer = self.get_serializer(item)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def decrementar(self, request, pk=None):
        """Decrement the quantity of an item in the cart."""
        item = self.get_object()
        if item.cantidad > 1:
            item.cantidad -= 1
            item.save()
        else:
            item.delete()
            return Response(
                {'detail': 'El ítem ha sido eliminado del carrito.'},
                status=status.HTTP_200_OK
            )
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)
