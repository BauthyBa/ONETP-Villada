"""
Sales related models.
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from .usuario import Usuario
from .paquete import Paquete

class Venta(BaseModel):
    """Sale model."""
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('en_proceso', 'En proceso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]
    
    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('tarjeta_credito', 'Tarjeta de Crédito'),
        ('tarjeta_debito', 'Tarjeta de Débito'),
        ('transferencia', 'Transferencia Bancaria'),
        ('mercado_pago', 'Mercado Pago'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    codigo = models.CharField(_('código'), max_length=20, unique=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='compras',
        verbose_name=_('usuario')
    )
    fecha_venta = models.DateTimeField(_('fecha de venta'), auto_now_add=True)
    fecha_viaje = models.DateField(_('fecha de viaje'), null=True, blank=True)
    estado = models.CharField(
        _('estado'),
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente'
    )
    metodo_pago = models.CharField(
        _('método de pago'),
        max_length=20,
        choices=METODO_PAGO_CHOICES,
        default='efectivo'
    )
    pago_confirmado = models.BooleanField(_('pago confirmado'), default=False)
    fecha_confirmacion_pago = models.DateTimeField(
        _('fecha de confirmación de pago'),
        null=True,
        blank=True
    )
    notas = models.TextField(_('notas'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('venta')
        verbose_name_plural = _('ventas')
        ordering = ['-fecha_venta']
    
    def __str__(self):
        return f"Venta {self.codigo} - {self.usuario.get_full_name()}"
    
    @property
    def total(self):
        """Calculate total sale amount."""
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def cantidad_items(self):
        """Get total number of items in sale."""
        return self.items.count()
    
    def confirmar_pago(self):
        """Mark payment as confirmed."""
        if not self.pago_confirmado:
            self.pago_confirmado = True
            self.estado = 'confirmada'
            self.save()
    
    def cancelar(self):
        """Cancel the sale."""
        self.estado = 'cancelada'
        self.save()

class VentaDetalle(BaseModel):
    """Sale detail model."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('venta')
    )
    paquete = models.ForeignKey(
        Paquete,
        on_delete=models.PROTECT,
        related_name='venta_detalles',
        verbose_name=_('paquete')
    )
    cantidad = models.PositiveIntegerField(_('cantidad'), default=1)
    precio_unitario = models.DecimalField(
        _('precio unitario'),
        max_digits=10,
        decimal_places=2
    )
    fecha_viaje = models.DateField(_('fecha de viaje'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('detalle de venta')
        verbose_name_plural = _('detalles de venta')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.cantidad}x {self.paquete.nombre}"
    
    @property
    def subtotal(self):
        """Calculate subtotal for this item."""
        return self.precio_unitario * self.cantidad
    
    def save(self, *args, **kwargs):
        """Set the unit price if not set."""
        if not self.precio_unitario:
            self.precio_unitario = self.paquete.precio
        super().save(*args, **kwargs)
