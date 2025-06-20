from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class Usuario(BaseModel):
    __tablename__ = "usuarios"

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)
    role = Column(String, nullable=False, default="cliente")
    is_active = Column(Boolean, default=True)
    
    # Relationships
    carritos = relationship("Carrito", back_populates="usuario")
    ventas = relationship("Venta", back_populates="usuario") 