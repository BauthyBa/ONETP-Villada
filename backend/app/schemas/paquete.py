from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class PaqueteBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    duracion_dias: int
    cupo_maximo: int
    destino: str
    imagen_url: Optional[HttpUrl] = None

class PaqueteCreate(PaqueteBase):
    fecha_inicio: datetime
    fecha_fin: datetime

class PaqueteUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    duracion_dias: Optional[int] = None
    cupo_maximo: Optional[int] = None
    cupo_disponible: Optional[int] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    destino: Optional[str] = None
    imagen_url: Optional[HttpUrl] = None
    activo: Optional[bool] = None

class PaqueteInDB(PaqueteBase):
    id: int
    cupo_disponible: int
    fecha_inicio: datetime
    fecha_fin: datetime
    activo: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Paquete(PaqueteInDB):
    pass 