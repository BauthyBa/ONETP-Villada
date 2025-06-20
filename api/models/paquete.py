"""
Package related models.
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel

class CategoriaPaquete(BaseModel):
    """Package category model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(_('nombre'), max_length=100, unique=True)
    descripcion = models.TextField(_('descripción'), blank=True, null=True)
    icono = models.CharField(_('ícono'), max_length=50, blank=True, null=True)
    
    class Meta:
        verbose_name = _('categoría de paquete')
        verbose_name_plural = _('categorías de paquetes')
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class Paquete(BaseModel):
    """Tour package model."""
    DIFICULTAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(_('nombre'), max_length=200)
    descripcion = models.TextField(_('descripción'))
    precio = models.DecimalField(_('precio'), max_digits=10, decimal_places=2)
    duracion_dias = models.PositiveIntegerField(_('duración en días'), default=1)
    dificultad = models.CharField(
        _('dificultad'), 
        max_length=10, 
        choices=DIFICULTAD_CHOICES, 
        default='media'
    )
    categoria = models.ForeignKey(
        CategoriaPaquete, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name=_('categoría'),
        related_name='paquetes'
    )
    imagen_principal = models.ImageField(
        _('imagen principal'), 
        upload_to='paquetes/', 
        null=True, 
        blank=True
    )
    destacado = models.BooleanField(_('destacado'), default=False)
    cupo_maximo = models.PositiveIntegerField(_('cupo máximo'), default=20)
    incluye = models.TextField(_('qué incluye'), blank=True, null=True)
    no_incluye = models.TextField(_('qué no incluye'), blank=True, null=True)
    requisitos = models.TextField(_('requisitos'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('paquete')
        verbose_name_plural = _('paquetes')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.nombre
    
    @property
    def disponibilidad(self):
        """Calculate package availability."""
        from .venta import VentaDetalle
        vendido = VentaDetalle.objects.filter(
            paquete=self,
            venta__estado__in=['confirmada', 'en_proceso']
        ).count()
        return max(0, self.cupo_maximo - vendido)
    
    @property
    def disponible(self):
        """Check if package is available."""
        return self.disponibilidad > 0
