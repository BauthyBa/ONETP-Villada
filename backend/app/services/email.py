import logging
from typing import Optional, Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.sg = None
        if settings.SENDGRID_API_KEY and settings.EMAILS_ENABLED:
            self.sg = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send email using SendGrid"""
        if not self.sg:
            logger.warning("Email service not configured. Email not sent.")
            return False
        
        try:
            from_email = Email(settings.EMAILS_FROM_EMAIL, settings.EMAILS_FROM_NAME)
            to_email_obj = To(to_email)
            
            if plain_content:
                content = Content("text/plain", plain_content)
            else:
                content = Content("text/html", html_content)
            
            mail = Mail(from_email, to_email_obj, subject, content)
            
            if plain_content and html_content:
                mail.add_content(Content("text/html", html_content))
            
            response = self.sg.send(mail)
            logger.info(f"Email sent successfully to {to_email}. Status: {response.status_code}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False
    
    def send_purchase_confirmation_client(
        self,
        client_email: str,
        client_name: str,
        venta_data: Dict[str, Any]
    ) -> bool:
        """Send purchase confirmation email to client"""
        subject = f"Confirmación de Compra - Venta #{venta_data['id']}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">🎉 ¡Compra Confirmada!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">Tour Packages - Olimpíada ETP 2025</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
                    <h2 style="color: #667eea; margin-top: 0;">Hola {client_name},</h2>
                    
                    <p>¡Gracias por tu compra! Hemos recibido tu pedido y está siendo procesado.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #495057;">Detalles de la Compra:</h3>
                        <p><strong>Número de Venta:</strong> #{venta_data['id']}</p>
                        <p><strong>Fecha:</strong> {venta_data['fecha']}</p>
                        <p><strong>Total:</strong> <span style="color: #28a745; font-size: 18px; font-weight: bold;">${venta_data['total']}</span></p>
                        <p><strong>Método de Pago:</strong> {venta_data['metodo_pago']}</p>
                        <p><strong>Estado:</strong> <span style="color: #ffc107; font-weight: bold;">{venta_data['estado']}</span></p>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1976d2;">Paquetes Turísticos:</h3>
                        {self._format_sale_details(venta_data.get('detalles', []))}
                    </div>
                    
                    <p style="margin-top: 30px;">Nuestro equipo de ventas revisará tu pedido y te contactaremos pronto para confirmar los detalles del viaje.</p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px;">
                            Si tienes alguna pregunta, no dudes en contactarnos.<br>
                            <strong>Tour Packages - Olimpíada ETP 2025</strong>
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(client_email, subject, html_content)
    
    def send_new_sale_notification_admin(
        self,
        admin_email: str,
        venta_data: Dict[str, Any],
        client_data: Dict[str, Any]
    ) -> bool:
        """Send new sale notification to admin/sales team"""
        subject = f"Nueva Venta Registrada - #{venta_data['id']}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">💼 Nueva Venta</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">Sistema de Gestión - Tour Packages</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
                    <h2 style="color: #28a745; margin-top: 0;">Nueva venta registrada</h2>
                    
                    <p>Se ha registrado una nueva venta en el sistema que requiere tu atención.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #495057;">Información de la Venta:</h3>
                        <p><strong>ID de Venta:</strong> #{venta_data['id']}</p>
                        <p><strong>Fecha:</strong> {venta_data['fecha']}</p>
                        <p><strong>Total:</strong> <span style="color: #28a745; font-size: 18px; font-weight: bold;">${venta_data['total']}</span></p>
                        <p><strong>Método de Pago:</strong> {venta_data['metodo_pago']}</p>
                        <p><strong>Estado:</strong> <span style="color: #ffc107; font-weight: bold;">Pendiente de Confirmación</span></p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #856404;">Datos del Cliente:</h3>
                        <p><strong>Nombre:</strong> {client_data['name']} {client_data['surname']}</p>
                        <p><strong>Email:</strong> {client_data['email']}</p>
                        <p><strong>Teléfono:</strong> {client_data.get('phone', 'No especificado')}</p>
                        <p><strong>Dirección:</strong> {client_data.get('address', 'No especificada')}</p>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1976d2;">Paquetes Solicitados:</h3>
                        {self._format_sale_details(venta_data.get('detalles', []))}
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="background: #dc3545; color: white; padding: 15px; border-radius: 8px; margin: 0;">
                            <strong>⚠️ Acción Requerida:</strong><br>
                            Ingresa al panel de administración para confirmar o rechazar esta venta.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px;">
                            <strong>Tour Packages - Sistema de Gestión</strong><br>
                            Olimpíada Nacional de ETP 2025
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(admin_email, subject, html_content)
    
    def send_sale_status_update(
        self,
        client_email: str,
        client_name: str,
        venta_data: Dict[str, Any],
        new_status: str
    ) -> bool:
        """Send sale status update to client"""
        status_messages = {
            'confirmada': {
                'title': '✅ ¡Venta Confirmada!',
                'message': 'Tu compra ha sido confirmada exitosamente. Pronto nos contactaremos contigo para coordinar los detalles del viaje.',
                'color': '#28a745'
            },
            'cancelada': {
                'title': '❌ Venta Cancelada',
                'message': 'Lamentamos informarte que tu venta ha sido cancelada. Si tienes alguna pregunta, no dudes en contactarnos.',
                'color': '#dc3545'
            }
        }
        
        status_info = status_messages.get(new_status, {
            'title': 'Estado de Venta Actualizado',
            'message': f'El estado de tu venta ha sido actualizado a: {new_status}',
            'color': '#6c757d'
        })
        
        subject = f"Actualización de Venta #{venta_data['id']} - {status_info['title']}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: {status_info['color']}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">{status_info['title']}</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">Tour Packages - Olimpíada ETP 2025</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
                    <h2 style="color: {status_info['color']}; margin-top: 0;">Hola {client_name},</h2>
                    
                    <p>{status_info['message']}</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #495057;">Detalles de la Venta:</h3>
                        <p><strong>Número de Venta:</strong> #{venta_data['id']}</p>
                        <p><strong>Total:</strong> <span style="color: {status_info['color']}; font-size: 18px; font-weight: bold;">${venta_data['total']}</span></p>
                        <p><strong>Estado Actual:</strong> <span style="color: {status_info['color']}; font-weight: bold;">{new_status.title()}</span></p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px;">
                            Si tienes alguna pregunta, no dudes en contactarnos.<br>
                            <strong>Tour Packages - Olimpíada ETP 2025</strong>
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(client_email, subject, html_content)
    
    def _format_sale_details(self, detalles: list) -> str:
        """Format sale details for email"""
        if not detalles:
            return "<p>No hay detalles disponibles.</p>"
        
        html = ""
        for detalle in detalles:
            html += f"""
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                <p style="margin: 5px 0;"><strong>{detalle.get('paquete_nombre', 'Paquete')}</strong></p>
                <p style="margin: 5px 0; color: #666;">Cantidad: {detalle.get('cantidad', 1)} | Precio unitario: ${detalle.get('precio_unitario', 0)} | Subtotal: ${detalle.get('subtotal', 0)}</p>
            </div>
            """
        return html

# Create global instance
email_service = EmailService() 