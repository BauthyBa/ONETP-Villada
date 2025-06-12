from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.carrito import Carrito, ItemCarrito
from app.schemas.carrito import CarritoCreate, CarritoUpdate, ItemCarritoCreate, ItemCarritoUpdate
from app.crud.paquete import paquete

class CRUDCarrito(CRUDBase[Carrito, CarritoCreate, CarritoUpdate]):
    def get_by_usuario(
        self, db: Session, *, usuario_id: int, skip: int = 0, limit: int = 100
    ) -> List[Carrito]:
        return (
            db.query(Carrito)
            .filter(Carrito.usuario_id == usuario_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_activo_by_usuario(
        self, db: Session, *, usuario_id: int
    ) -> Optional[Carrito]:
        return (
            db.query(Carrito)
            .filter(
                Carrito.usuario_id == usuario_id,
                Carrito.estado == "activo"
            )
            .first()
        )

    def create_with_usuario(
        self, db: Session, *, usuario_id: int
    ) -> Carrito:
        db_obj = Carrito(usuario_id=usuario_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def add_item(
        self,
        db: Session,
        *,
        carrito_id: int,
        item_in: ItemCarritoCreate
    ) -> ItemCarrito:
        carrito = self.get(db, id=carrito_id)
        if not carrito:
            return None

        paquete_obj = paquete.get(db, id=item_in.paquete_id)
        if not paquete_obj or paquete_obj.cupo_disponible < item_in.cantidad:
            return None

        # Check if item already exists in cart
        existing_item = (
            db.query(ItemCarrito)
            .filter(
                ItemCarrito.carrito_id == carrito_id,
                ItemCarrito.paquete_id == item_in.paquete_id
            )
            .first()
        )

        if existing_item:
            # Update existing item
            existing_item.cantidad += item_in.cantidad
            existing_item.subtotal = existing_item.cantidad * existing_item.precio_unitario
            db.add(existing_item)
        else:
            # Create new item
            db_obj = ItemCarrito(
                carrito_id=carrito_id,
                paquete_id=item_in.paquete_id,
                cantidad=item_in.cantidad,
                precio_unitario=paquete_obj.precio,
                subtotal=paquete_obj.precio * item_in.cantidad
            )
            db.add(db_obj)

        db.commit()
        return existing_item if existing_item else db_obj

    def remove_item(
        self, db: Session, *, carrito_id: int, item_id: int
    ) -> Optional[ItemCarrito]:
        item = (
            db.query(ItemCarrito)
            .filter(
                ItemCarrito.carrito_id == carrito_id,
                ItemCarrito.id == item_id
            )
            .first()
        )
        if item:
            db.delete(item)
            db.commit()
        return item

    def update_item(
        self,
        db: Session,
        *,
        carrito_id: int,
        item_id: int,
        item_in: ItemCarritoUpdate
    ) -> Optional[ItemCarrito]:
        item = (
            db.query(ItemCarrito)
            .filter(
                ItemCarrito.carrito_id == carrito_id,
                ItemCarrito.id == item_id
            )
            .first()
        )
        if not item:
            return None

        if item_in.cantidad is not None:
            paquete_obj = paquete.get(db, id=item.paquete_id)
            if not paquete_obj or paquete_obj.cupo_disponible < item_in.cantidad:
                return None
            item.cantidad = item_in.cantidad
            item.subtotal = item.cantidad * item.precio_unitario
            db.add(item)
            db.commit()
            db.refresh(item)
        return item

    def get_total(self, db: Session, *, carrito_id: int) -> float:
        items = (
            db.query(ItemCarrito)
            .filter(ItemCarrito.carrito_id == carrito_id)
            .all()
        )
        return sum(item.subtotal for item in items)

carrito = CRUDCarrito(Carrito) 