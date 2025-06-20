"""
Import all models to make them available in the admin interface and for easier imports.
"""
from .base import BaseModel
from .usuario import Usuario, UsuarioManager
from .paquete import CategoriaPaquete, Paquete
from .carrito import Carrito, CarritoItem
from .venta import Venta, VentaDetalle

# This makes the models available at the package level
__all__ = [
    'BaseModel',
    'Usuario', 'UsuarioManager',
    'CategoriaPaquete', 'Paquete',
    'Carrito', 'CarritoItem',
    'Venta', 'VentaDetalle',
]