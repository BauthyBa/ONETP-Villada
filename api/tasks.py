"""
Background tasks for the ONIET API.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

from .models import Usuario, Venta


@shared_task
def send_welcome_email(user_id):
    """
    Send a welcome email to a new user.
    """
    try:
        user = Usuario.objects.get(id=user_id)
        subject = '¡Bienvenido a ONIET!'
        message = f"""
        ¡Hola {user.get_full_name()}!

        Gracias por registrarte en ONIET. Estamos encantados de tenerte con nosotros.

        Con tu cuenta podrás:
        - Explorar nuestros paquetes turísticos
        - Hacer reservas de manera sencilla
        - Gestionar tus compras
        - Y mucho más...

        ¡Comienza a explorar ahora!

        Saludos,
        El equipo de ONIET
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return f"Welcome email sent to {user.email}"
    except Usuario.DoesNotExist:
        return f"User with id {user_id} does not exist"


@shared_task
def send_order_confirmation(venta_id):
    """
    Send an order confirmation email to the user.
    """
    try:
        venta = Venta.objects.select_related('usuario').get(id=venta_id)
        user = venta.usuario
        
        subject = f'ONIET - Confirmación de compra #{venta.codigo}'
        message = f"""
        Hola {user.get_full_name()},

        Gracias por tu compra en ONIET. Aquí tienes los detalles de tu pedido:

        Número de pedido: {venta.codigo}
        Fecha: {venta.fecha_venta.strftime('%d/%m/%Y %H:%M')}
        Total: ${venta.total:,.2f}
        
        Detalles de los paquetes:
        """
        
        # Add package details
        detalles = venta.detalles.select_related('paquete').all()
        for detalle in detalles:
            message += f"- {detalle.paquete.nombre}: {detalle.cantidad} x ${detalle.precio_unitario:,.2f}\n"
        
        message += """
        Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.

        Saludos,
        El equipo de ONIET
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return f"Order confirmation sent for order #{venta.codigo} to {user.email}"
    except Venta.DoesNotExist:
        return f"Venta with id {venta_id} does not exist"


@shared_task
def cleanup_expired_carts():
    """
    Clean up expired shopping carts.
    """
    from datetime import datetime, timedelta
    from .models import Carrito
    
    expiration_time = datetime.now() - timedelta(days=settings.CART_EXPIRATION_DAYS)
    expired_carts = Carrito.objects.filter(
        fecha_actualizacion__lt=expiration_time
    ).exclude(items__isnull=True)
    
    count = expired_carts.count()
    expired_carts.update(items=None)  # Clear items but don't delete the cart
    
    return f"Cleaned up {count} expired carts"
