from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DetalleVentaBase(BaseModel):
    paquete_id: int
    cantidad: int

class DetalleVentaCreate(DetalleVentaBase):
    pass

class DetalleVentaInDB(DetalleVentaBase):
    id: int
    venta_id: int
    precio_unitario: float
    subtotal: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DetalleVenta(DetalleVentaInDB):
    pass

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
    detalles: List[DetalleVenta] = []

    class Config:
        from_attributes = True

class Venta(VentaInDB):
    pass 