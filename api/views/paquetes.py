"""
Package related views.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from ..models import CategoriaPaquete, Paquete
from ..serializers.paquete import (
    CategoriaPaqueteSerializer,
    PaqueteSerializer,
    PaqueteImageSerializer
)
from .base import BaseViewSet

class CategoriaPaqueteViewSet(BaseViewSet):
    """ViewSet for managing package categories."""
    queryset = CategoriaPaquete.objects.all()
    serializer_class = CategoriaPaqueteSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'created_at']
    ordering = ['nombre']

class PaqueteViewSet(BaseViewSet):
    """ViewSet for managing tour packages."""
    queryset = Paquete.objects.select_related('categoria').all()
    serializer_class = PaqueteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'categoria': ['exact'],
        'dificultad': ['exact'],
        'destacado': ['exact'],
        'precio': ['lte', 'gte'],
        'duracion_dias': ['lte', 'gte'],
    }
    search_fields = ['nombre', 'descripcion', 'categoria__nombre']
    ordering_fields = ['nombre', 'precio', 'duracion_dias', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = super().get_queryset()
        
        # Only show active packages to non-staff users
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        
        # Filter by category name
        categoria_nombre = self.request.query_params.get('categoria_nombre', None)
        if categoria_nombre:
            queryset = queryset.filter(categoria__nombre__iexact=categoria_nombre)
        
        return queryset
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        """Upload an image to a package."""
        package = self.get_object()
        serializer = PaqueteImageSerializer(package, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def destacados(self, request):
        """Get featured packages."""
        queryset = self.get_queryset().filter(destacado=True, is_active=True)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categorias(self, request):
        """Get all categories with package counts."""
        from django.db.models import Count, Q
        
        # Get active packages count for each category
        categories = CategoriaPaquete.objects.annotate(
            paquetes_count=Count('paquetes', filter=Q(paquetes__is_active=True))
        ).filter(paquetes_count__gt=0).order_by('nombre')
        
        serializer = CategoriaPaqueteSerializer(categories, many=True)
        return Response(serializer.data)
