"""
Utility functions for sending emails.
"""
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def send_email(subject, to_email, template_name, context=None, from_email=None, **kwargs):
    """
    Send an email using a template.
    
    Args:
        subject (str): Email subject
        to_email (str or list): Recipient email(s)
        template_name (str): Name of the template to use (without extension)
        context (dict): Context variables for the template
        from_email (str, optional): Sender email. Defaults to settings.DEFAULT_FROM_EMAIL.
        **kwargs: Additional arguments to pass to EmailMultiAlternatives
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    if context is None:
        context = {}
    
    if from_email is None:
        from_email = settings.DEFAULT_FROM_EMAIL
    
    # Render HTML content
    html_content = render_to_string(f'emails/{template_name}.html', context)
    
    # Create text version from HTML
    text_content = strip_tags(html_content)
    
    # Create the email
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=from_email,
        to=to_email if isinstance(to_email, list) else [to_email],
        **kwargs
    )
    
    # Attach HTML content
    email.attach_alternative(html_content, "text/html")
    
    # Send the email
    try:
        email.send()
        return True
    except Exception as e:
        # Log the error or handle it as needed
        print(f"Error sending email: {e}")
        return False


def send_welcome_email(user):
    """
    Send a welcome email to a new user.
    
    Args:
        user: The user to send the welcome email to
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    context = {
        'user': user,
        'site_name': getattr(settings, 'SITE_NAME', 'ONIET'),
        'contact_email': getattr(settings, 'CONTACT_EMAIL', 'contacto@oniet.com'),
    }
    
    subject = f"¡Bienvenido a {context['site_name']}!"
    
    return send_email(
        subject=subject,
        to_email=user.email,
        template_name='welcome',
        context=context
    )


def send_password_reset_email(user, reset_url):
    """
    Send a password reset email to a user.
    
    Args:
        user: The user to send the password reset email to
        reset_url (str): The password reset URL
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    context = {
        'user': user,
        'reset_url': reset_url,
        'site_name': getattr(settings, 'SITE_NAME', 'ONIET'),
        'contact_email': getattr(settings, 'CONTACT_EMAIL', 'contacto@oniet.com'),
    }
    
    subject = f"Restablecer tu contraseña en {context['site_name']}"
    
    return send_email(
        subject=subject,
        to_email=user.email,
        template_name='password_reset',
        context=context
    )


def send_order_confirmation_email(order):
    """
    Send an order confirmation email.
    
    Args:
        order: The order to confirm
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    context = {
        'order': order,
        'user': order.usuario,
        'site_name': getattr(settings, 'SITE_NAME', 'ONIET'),
        'contact_email': getattr(settings, 'CONTACT_EMAIL', 'contacto@oniet.com'),
    }
    
    subject = f"Confirmación de tu pedido #{order.codigo}"
    
    return send_email(
        subject=subject,
        to_email=order.usuario.email,
        template_name='order_confirmation',
        context=context
    )
