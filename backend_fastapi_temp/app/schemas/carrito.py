from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.paquete import Paquete

class ItemCarritoBase(BaseModel):
    paquete_id: int
    cantidad: int

class ItemCarritoCreate(ItemCarritoBase):
    pass

class ItemCarritoUpdate(BaseModel):
    cantidad: Optional[int] = None

class ItemCarritoInDB(ItemCarritoBase):
    id: int
    carrito_id: int
    precio_unitario: float
    subtotal: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ItemCarrito(ItemCarritoInDB):
    paquete: Optional[Paquete] = None

class CarritoBase(BaseModel):
    estado: str = "activo"

class CarritoCreate(CarritoBase):
    pass

class CarritoUpdate(BaseModel):
    estado: Optional[str] = None

class CarritoInDB(CarritoBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: datetime
    items: List[ItemCarrito] = []
    total: float = 0.0

    class Config:
        from_attributes = True

class Carrito(CarritoInDB):
    pass 