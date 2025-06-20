from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.models.venta import Venta, DetalleVenta
from app.schemas.venta import VentaCreate, VentaUpdate, ItemVentaUpdate
from app.crud.carrito import carrito
from app.crud.paquete import paquete
from app.crud.usuario import usuario
from app.services.email import email_service
from datetime import datetime

class CRUDVenta(CRUDBase[Venta, VentaCreate, VentaUpdate]):
    def get_by_usuario(
        self, db: Session, *, usuario_id: int, skip: int = 0, limit: int = 100
    ) -> List[Venta]:
        return (
            db.query(Venta)
            .options(joinedload(Venta.detalles).joinedload(DetalleVenta.paquete), joinedload(Venta.usuario))
            .filter(Venta.usuario_id == usuario_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_from_carrito(
        self,
        db: Session,
        *,
        usuario_id: int,
        carrito_id: int,
        venta_in: VentaCreate
    ) -> Optional[Venta]:
        carrito_obj = carrito.get(db, id=carrito_id)
        if not carrito_obj or carrito_obj.usuario_id != usuario_id:
            return None

        total = carrito.get_total(db, carrito_id=carrito_id)
        
        db_obj = Venta(
            usuario_id=usuario_id,
            total=total,
            estado="pendiente",
            metodo_pago=venta_in.metodo_pago,
            numero_transaccion=venta_in.numero_transaccion
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # Create sale details from cart items
        detalles_data = []
        for item in carrito_obj.items:
            detalle = DetalleVenta(
                venta_id=db_obj.id,
                paquete_id=item.paquete_id,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                subtotal=item.subtotal
            )
            db.add(detalle)

            # Update package availability
            paquete_obj = paquete.get(db, id=item.paquete_id)
            if paquete_obj:
                paquete_obj.cupo_disponible -= item.cantidad
                db.add(paquete_obj)
                
                # Collect details for email
                detalles_data.append({
                    'paquete_nombre': paquete_obj.nombre,
                    'cantidad': item.cantidad,
                    'precio_unitario': item.precio_unitario,
                    'subtotal': item.subtotal
                })

        # Mark cart as purchased
        carrito_obj.estado = "comprado"
        db.add(carrito_obj)
        
        db.commit()
        db.refresh(db_obj)
        
        # Send email notifications
        try:
            # Get client data
            client = usuario.get(db, id=usuario_id)
            if client:
                # Prepare venta data for email
                venta_data = {
                    'id': db_obj.id,
                    'fecha': db_obj.created_at.strftime('%d/%m/%Y %H:%M'),
                    'total': total,
                    'metodo_pago': venta_in.metodo_pago,
                    'estado': 'pendiente',
                    'detalles': detalles_data
                }
                
                client_data = {
                    'name': client.name,
                    'surname': client.surname,
                    'email': client.email,
                    'phone': client.phone,
                    'address': client.address
                }
                
                # Send confirmation email to client
                email_service.send_purchase_confirmation_client(
                    client_email=client.email,
                    client_name=f"{client.name} {client.surname}",
                    venta_data=venta_data
                )
                
                # Send notification to admin/sales team
                admin_users = db.query(usuario.model).filter(usuario.model.role == "jefe_ventas").all()
                for admin in admin_users:
                    email_service.send_new_sale_notification_admin(
                        admin_email=admin.email,
                        venta_data=venta_data,
                        client_data=client_data
                    )
        except Exception as e:
            # Log error but don't fail the transaction
            print(f"Error sending email notifications: {e}")
        
        return db_obj

    def update_detail(
        self,
        db: Session,
        *,
        venta_id: int,
        detalle_id: int,
        detalle_in: ItemVentaUpdate
    ) -> Optional[DetalleVenta]:
        detalle = (
            db.query(DetalleVenta)
            .filter(
                DetalleVenta.venta_id == venta_id,
                DetalleVenta.id == detalle_id
            )
            .first()
        )
        if not detalle:
            return None

        venta_obj = self.get(db, id=venta_id)
        if not venta_obj or venta_obj.estado != "pendiente":
            return None

        if detalle_in.cantidad is not None:
            # Calculate difference for package availability
            old_cantidad = detalle.cantidad
            new_cantidad = detalle_in.cantidad
            diff = new_cantidad - old_cantidad

            # Check package availability
            paquete_obj = paquete.get(db, id=detalle.paquete_id)
            if paquete_obj and paquete_obj.cupo_disponible < diff:
                return None

            # Update package availability
            if paquete_obj:
                paquete_obj.cupo_disponible -= diff
                db.add(paquete_obj)

            # Update detail
            detalle.cantidad = new_cantidad
            detalle.subtotal = detalle.precio_unitario * new_cantidad
            db.add(detalle)

            # Recalculate venta total
            self._recalculate_total(db, venta_id)

            db.commit()
            db.refresh(detalle)

        return detalle

    def remove_detail(
        self,
        db: Session,
        *,
        venta_id: int,
        detalle_id: int
    ) -> Optional[DetalleVenta]:
        detalle = (
            db.query(DetalleVenta)
            .filter(
                DetalleVenta.venta_id == venta_id,
                DetalleVenta.id == detalle_id
            )
            .first()
        )
        if not detalle:
            return None

        venta_obj = self.get(db, id=venta_id)
        if not venta_obj or venta_obj.estado != "pendiente":
            return None

        # Restore package availability
        paquete_obj = paquete.get(db, id=detalle.paquete_id)
        if paquete_obj:
            paquete_obj.cupo_disponible += detalle.cantidad
            db.add(paquete_obj)

        # Remove detail
        db.delete(detalle)

        # Recalculate venta total
        self._recalculate_total(db, venta_id)

        db.commit()
        return detalle

    def _recalculate_total(self, db: Session, venta_id: int):
        """Recalculate the total for a venta"""
        remaining_detalles = (
            db.query(DetalleVenta)
            .filter(DetalleVenta.venta_id == venta_id)
            .all()
        )
        
        new_total = sum(detalle.subtotal for detalle in remaining_detalles)
        
        venta_obj = self.get(db, id=venta_id)
        if venta_obj:
            venta_obj.total = new_total
            db.add(venta_obj)

    def confirmar(self, db: Session, *, venta_id: int) -> Optional[Venta]:
        venta = self.get(db, id=venta_id)
        if not venta or venta.estado != "pendiente":
            return None
        
        venta.estado = "confirmada"
        db.add(venta)
        db.commit()
        db.refresh(venta)
        
        # Send status update email to client
        try:
            client = usuario.get(db, id=venta.usuario_id)
            if client:
                venta_data = {
                    'id': venta.id,
                    'total': venta.total
                }
                email_service.send_sale_status_update(
                    client_email=client.email,
                    client_name=f"{client.name} {client.surname}",
                    venta_data=venta_data,
                    new_status='confirmada'
                )
        except Exception as e:
            print(f"Error sending confirmation email: {e}")
        
        return venta

    def cancelar(self, db: Session, *, venta_id: int) -> Optional[Venta]:
        venta = self.get(db, id=venta_id)
        if not venta or venta.estado == "cancelada":
            return None

        # Restore package availability
        for detalle in venta.detalles:
            paquete_obj = paquete.get(db, id=detalle.paquete_id)
            if paquete_obj:
                paquete_obj.cupo_disponible += detalle.cantidad
                db.add(paquete_obj)

        venta.estado = "cancelada"
        db.add(venta)
        db.commit()
        db.refresh(venta)
        
        # Send status update email to client
        try:
            client = usuario.get(db, id=venta.usuario_id)
            if client:
                venta_data = {
                    'id': venta.id,
                    'total': venta.total
                }
                email_service.send_sale_status_update(
                    client_email=client.email,
                    client_name=f"{client.name} {client.surname}",
                    venta_data=venta_data,
                    new_status='cancelada'
                )
        except Exception as e:
            print(f"Error sending cancellation email: {e}")
        
        return venta

venta = CRUDVenta(Venta) 