"""
Shopping cart related models.
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from .usuario import Usuario
from .paquete import Paquete

class Carrito(BaseModel):
    """Shopping cart model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='carrito',
        verbose_name=_('usuario')
    )
    
    class Meta:
        verbose_name = _('carrito')
        verbose_name_plural = _('carritos')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Carrito de {self.usuario.get_full_name()}"
    
    @property
    def total(self):
        """Calculate total cart amount."""
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def cantidad_items(self):
        """Get total number of items in cart."""
        return self.items.count()

class CarritoItem(BaseModel):
    """Shopping cart item model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    carrito = models.ForeignKey(
        Carrito,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('carrito')
    )
    paquete = models.ForeignKey(
        Paquete,
        on_delete=models.CASCADE,
        related_name='carrito_items',
        verbose_name=_('paquete')
    )
    cantidad = models.PositiveIntegerField(_('cantidad'), default=1)
    fecha_viaje = models.DateField(_('fecha de viaje'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('ítem del carrito')
        verbose_name_plural = _('ítems del carrito')
        ordering = ['-created_at']
        unique_together = ('carrito', 'paquete', 'fecha_viaje')
    
    def __str__(self):
        return f"{self.cantidad}x {self.paquete.nombre}"
    
    @property
    def subtotal(self):
        """Calculate subtotal for this item."""
        return self.paquete.precio * self.cantidad
    
    def save(self, *args, **kwargs):
        """Override save to update cart timestamps."""
        self.carrito.save()  # Update cart's updated_at
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to update cart timestamps."""
        carrito = self.carrito
        super().delete(*args, **kwargs)
        carrito.save()  # Update cart's updated_at
