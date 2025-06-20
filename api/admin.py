"""
Django admin customization.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from . import models


class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""
    ordering = ['email']
    list_display = [
        'email', 'nombre', 'apellido', 'tipo_usuario',
        'is_active', 'is_staff', 'is_superuser', 'last_login'
    ]
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'tipo_usuario']
    search_fields = ['email', 'nombre', 'apellido']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Información Personal'), {
            'fields': ('nombre', 'apellido', 'telefono', 'fecha_nacimiento')
        }),
        (_('Dirección'), {
            'fields': ('direccion',)
        }),
        (_('Permisos'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions', 'tipo_usuario'
            )
        }),
        (_('Fechas Importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'password1', 'password2',
                'nombre', 'apellido', 'tipo_usuario',
                'is_active', 'is_staff'
            )
        }),
    )


@admin.register(models.CategoriaPaquete)
class CategoriaPaqueteAdmin(admin.ModelAdmin):
    """Admin View for CategoriaPaquete."""
    list_display = ('nombre', 'descripcion_corta', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('nombre', 'descripcion')
    prepopulated_fields = {}
    
    def descripcion_corta(self, obj):
        """Return a shortened description for admin list view."""
        if obj.descripcion and len(obj.descripcion) > 50:
            return f"{obj.descripcion[:50]}..."
        return obj.descripcion or ""
    descripcion_corta.short_description = 'Descripción'


@admin.register(models.Paquete)
class PaqueteAdmin(admin.ModelAdmin):
    """Admin View for Paquete."""
    list_display = (
        'nombre', 'precio', 'duracion_dias', 'dificultad',
        'categoria', 'destacado', 'disponible', 'is_active'
    )
    list_filter = ('categoria', 'dificultad', 'destacado', 'is_active')
    search_fields = ('nombre', 'descripcion')
    fieldsets = (
        (None, {
            'fields': ('nombre', 'descripcion', 'precio', 'imagen_principal')
        }),
        ('Detalles', {
            'fields': ('duracion_dias', 'dificultad', 'categoria', 'destacado', 'cupo_maximo')
        }),
        ('Información Adicional', {
            'classes': ('collapse',),
            'fields': ('incluye', 'no_incluye', 'requisitos')
        }),
    )
    prepopulated_fields = {}
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at', 'disponible', 'disponibilidad')
    list_display_links = ('nombre',)


class CarritoItemInline(admin.TabularInline):
    """Inline for cart items."""
    model = models.CarritoItem
    extra = 1
    readonly_fields = ('subtotal',)
    
    def subtotal(self, obj):
        """Calculate subtotal for the cart item."""
        return obj.subtotal
    subtotal.short_description = 'Subtotal'


@admin.register(models.Carrito)
class CarritoAdmin(admin.ModelAdmin):
    """Admin View for Carrito."""
    list_display = ('usuario', 'updated_at', 'total_items', 'total')
    list_filter = ('usuario',)
    search_fields = ('usuario__email', 'usuario__nombre', 'usuario__apellido')
    inlines = [CarritoItemInline]
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items')
    
    def total_items(self, obj):
        """Return total number of items in the cart."""
        return obj.items.count()
    total_items.short_description = 'Items'
    
    def total(self, obj):
        """Return total amount of the cart."""
        return f"${obj.total:,.2f}"
    total.short_description = 'Total'


class VentaDetalleInline(admin.TabularInline):
    """Inline for sale details."""
    model = models.VentaDetalle
    extra = 0
    readonly_fields = ('subtotal',)
    
    def subtotal(self, obj):
        """Calculate subtotal for the sale detail."""
        return obj.subtotal
    subtotal.short_description = 'Subtotal'


@admin.register(models.Venta)
class VentaAdmin(admin.ModelAdmin):
    """Admin View for Venta."""
    list_display = (
        'codigo', 'usuario', 'fecha_venta', 'estado',
        'metodo_pago', 'pago_confirmado', 'total_venta'
    )
    list_filter = ('estado', 'metodo_pago', 'pago_confirmado', 'fecha_venta')
    search_fields = ('codigo', 'usuario__email', 'usuario__nombre', 'usuario__apellido')
    inlines = [VentaDetalleInline]
    readonly_fields = ('fecha_venta', 'fecha_confirmacion_pago')
    date_hierarchy = 'fecha_venta'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('usuario')
    
    def total_venta(self, obj):
        """Return total amount of the sale."""
        return f"${obj.total:,.2f}"
    total_venta.short_description = 'Total'


# Register the User model with the custom UserAdmin
admin.site.register(models.Usuario, UserAdmin)
