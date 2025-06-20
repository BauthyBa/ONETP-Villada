from sqlalchemy import Column, Integer, Float, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel

class Carrito(BaseModel):
    __tablename__ = "carritos"

    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    estado = Column(String, nullable=False, default="activo")

    # Relaciones
    usuario = relationship("Usuario", back_populates="carritos")
    items = relationship("ItemCarrito", back_populates="carrito", cascade="all, delete-orphan")

class ItemCarrito(BaseModel):
    __tablename__ = "items_carrito"

    carrito_id = Column(Integer, ForeignKey("carritos.id"), nullable=False)
    paquete_id = Column(Integer, ForeignKey("paquetes_turisticos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    # Relaciones
    carrito = relationship("Carrito", back_populates="items")
    paquete = relationship("PaqueteTuristico") 