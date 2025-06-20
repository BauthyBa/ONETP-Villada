from sqlalchemy import Column, String, Float, Integer, Boolean, Date
from .base import BaseModel

class PaqueteTuristico(BaseModel):
    __tablename__ = "paquetes_turisticos"

    nombre = Column(String, nullable=False, index=True)
    descripcion = Column(String)
    precio = Column(Float, nullable=False)
    duracion_dias = Column(Integer, nullable=False)
    cupo_maximo = Column(Integer, nullable=False)
    cupo_disponible = Column(Integer, nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    destino = Column(String, nullable=False, index=True)
    imagen_url = Column(String)
    activo = Column(Boolean, default=True) 