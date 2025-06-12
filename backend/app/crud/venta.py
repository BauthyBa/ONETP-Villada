from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.venta import Venta, DetalleVenta
from app.schemas.venta import VentaCreate, VentaUpdate
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