from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.paquete import Paquete
from app.schemas.usuario import Usuario

class ItemVentaBase(BaseModel):
    paquete_id: int
    cantidad: int

class ItemVentaCreate(ItemVentaBase):
    pass

class ItemVentaUpdate(BaseModel):
    cantidad: Optional[int] = None

class ItemVentaInDB(ItemVentaBase):
    id: int
    venta_id: int
    precio_unitario: float
    subtotal: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ItemVenta(ItemVentaInDB):
    paquete: Optional[Paquete] = None

# Legacy aliases for compatibility
DetalleVentaBase = ItemVentaBase
DetalleVentaCreate = ItemVentaCreate
DetalleVentaInDB = ItemVentaInDB
DetalleVenta = ItemVenta

class VentaBase(BaseModel):
    metodo_pago: str
    numero_transaccion: Optional[str] = None

class VentaCreate(VentaBase):
    pass

class VentaUpdate(BaseModel):
    estado: Optional[str] = None
    metodo_pago: Optional[str] = None
    numero_transaccion: Optional[str] = None

class VentaInDB(VentaBase):
    id: int
    usuario_id: int
    total: float
    estado: str
    created_at: datetime
    updated_at: datetime
    detalles: List[ItemVenta] = []

    class Config:
        from_attributes = True

class Venta(VentaInDB):
    usuario: Optional[Usuario] = None 