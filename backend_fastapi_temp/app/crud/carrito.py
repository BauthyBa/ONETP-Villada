from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.models.carrito import Carrito, ItemCarrito
from app.models.venta import Venta, DetalleVenta
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
        carrito = (
            db.query(Carrito)
            .options(joinedload(Carrito.items).joinedload(ItemCarrito.paquete))
            .filter(
                Carrito.usuario_id == usuario_id,
                Carrito.estado == "activo"
            )
            .first()
        )
        if carrito:
            carrito.total = self.get_total(db, carrito_id=carrito.id)
        return carrito

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

    def checkout(self, db: Session, *, carrito_id: int) -> Optional[Venta]:
        """
        Convert cart to sale and mark cart as completed
        """
        carrito = self.get(db, id=carrito_id)
        if not carrito or carrito.estado != "activo":
            return None

        # Get cart items
        items = (
            db.query(ItemCarrito)
            .filter(ItemCarrito.carrito_id == carrito_id)
            .all()
        )
        
        if not items:
            return None

        # Calculate total
        total = sum(item.subtotal for item in items)

        # Create sale
        venta = Venta(
            usuario_id=carrito.usuario_id,
            total=total,
            estado="pendiente",
            metodo_pago="pendiente"
        )
        db.add(venta)
        db.flush()  # Get the venta.id

        # Create sale items
        for cart_item in items:
            venta_item = DetalleVenta(
                venta_id=venta.id,
                paquete_id=cart_item.paquete_id,
                cantidad=cart_item.cantidad,
                precio_unitario=cart_item.precio_unitario,
                subtotal=cart_item.subtotal
            )
            db.add(venta_item)
            
            # Update package availability
            paquete_obj = paquete.get(db, id=cart_item.paquete_id)
            if paquete_obj:
                paquete_obj.cupo_disponible -= cart_item.cantidad
                db.add(paquete_obj)

        # Mark cart as completed
        carrito.estado = "completado"
        db.add(carrito)

        db.commit()
        db.refresh(venta)
        return venta

carrito = CRUDCarrito(Carrito) 