from sqlalchemy import Column, Integer, Float, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel

class Venta(BaseModel):
    __tablename__ = "ventas"

    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    total = Column(Float, nullable=False)
    estado = Column(String, nullable=False, default="pendiente")
    metodo_pago = Column(String, nullable=False)
    numero_transaccion = Column(String)

    # Relaciones
    usuario = relationship("Usuario", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")

class DetalleVenta(BaseModel):
    __tablename__ = "detalles_venta"

    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    paquete_id = Column(Integer, ForeignKey("paquetes_turisticos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    # Relaciones
    venta = relationship("Venta", back_populates="detalles")
    paquete = relationship("PaqueteTuristico") 