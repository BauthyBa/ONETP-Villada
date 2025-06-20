"""
Custom validators for the API.
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_phone_number(value):
    """
    Validate that the phone number is in a valid format.
    
    Valid formats:
    - +54 9 11 1234-5678
    - 54 9 11 1234-5678
    - 011 15-1234-5678
    - 11-1234-5678
    - 1234-5678
    - 12345678
    """
    pattern = r'^(\+?\d{1,4}?[-.\s]?)?(\d{1,4}[-.\s]?)?(\d{1,4}[-.\s]?)?\d{1,4}[-.\s]?\d{1,9}$'
    
    if not re.match(pattern, value):
        raise ValidationError(
            _('%(value)s no es un número de teléfono válido'),
            params={'value': value},
        )


def validate_dni(value):
    """
    Validate that the DNI is in a valid format.
    
    Valid formats:
    - 12345678
    - 12.345.678
    - 12,345,678
    - 12 345 678
    """
    # Remove any non-digit characters
    dni = ''.join(filter(str.isdigit, str(value)))
    
    # Check length (7 or 8 digits for Argentine DNI)
    if len(dni) < 7 or len(dni) > 8:
        raise ValidationError(
            _('El DNI debe tener entre 7 y 8 dígitos'),
            params={'value': value},
        )


def validate_cbu(value):
    """
    Validate that the CBU is in a valid format.
    
    A CBU must be 22 digits long.
    """
    # Remove any non-digit characters
    cbu = ''.join(filter(str.isdigit, str(value)))
    
    if len(cbu) != 22:
        raise ValidationError(
            _('El CBU debe tener 22 dígitos'),
            params={'value': value},
        )


def validate_cuit_cuil(value):
    """
    Validate that the CUIT/CUIL is in a valid format.
    
    A CUIT/CUIL must be in the format XX-XXXXXXXX-X.
    """
    # Remove any non-digit characters
    cuit = ''.join(filter(str.isdigit, str(value)))
    
    if len(cuit) != 11:
        raise ValidationError(
            _('El CUIT/CUIL debe tener 11 dígitos'),
            params={'value': value},
        )
    
    # Validate check digit
    base = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    aux = 0
    
    for i in range(10):
        aux += int(cuit[i]) * base[i]
    
    aux = 11 - (aux % 11)
    
    if aux == 11:
        aux = 0
    elif aux == 10:
        aux = 9
    
    if aux != int(cuit[10]):
        raise ValidationError(
            _('El CUIT/CUIL no es válido'),
            params={'value': value},
        )


def validate_password_strength(value):
    """
    Validate that the password meets the minimum strength requirements.
    
    The password must:
    - Be at least 8 characters long
    - Contain at least one digit
    - Contain at least one uppercase letter
    - Contain at least one lowercase letter
    - Contain at least one special character
    """
    if len(value) < 8:
        raise ValidationError(
            _('La contraseña debe tener al menos 8 caracteres'),
            code='password_too_short',
        )
    
    if not any(char.isdigit() for char in value):
        raise ValidationError(
            _('La contraseña debe contener al menos un número'),
            code='password_no_digit',
        )
    
    if not any(char.isupper() for char in value):
        raise ValidationError(
            _('La contraseña debe contener al menos una letra mayúscula'),
            code='password_no_upper',
        )
    
    if not any(char.islower() for char in value):
        raise ValidationError(
            _('La contraseña debe contener al menos una letra minúscula'),
            code='password_no_lower',
        )
    
    if not any(not char.isalnum() for char in value):
        raise ValidationError(
            _('La contraseña debe contener al menos un carácter especial'),
            code='password_no_special',
        )


def validate_email_domain(value):
    """
    Validate that the email domain is allowed.
    
    This is a basic implementation that can be extended to check against
    a list of allowed or blocked domains.
    """
    from django.core.validators import validate_email as django_validate_email
    from django.core.exceptions import ValidationError as DjangoValidationError
    
    try:
        django_validate_email(value)
    except DjangoValidationError:
        raise ValidationError(
            _('Ingrese una dirección de correo electrónico válida'),
            code='invalid_email',
        )
    
    # Add any additional domain validation here
    # For example, to block disposable email domains:
    # blocked_domains = ['mailinator.com', 'tempmail.com']
    # domain = value.split('@')[-1].lower()
    # if domain in blocked_domains:
    #     raise ValidationError(
    #         _('No se permiten direcciones de correo electrónico temporales'),
    #         code='disposable_email',
    #     )


class FileValidator:
    """
    Validator for files, checking file size and content type.
    
    Example usage:
    
    class MyModel(models.Model):
        file = models.FileField(
            upload_to='uploads/',
            validators=[
                FileValidator(
                    max_size=1024 * 100,  # 100KB
                    content_types=['image/jpeg', 'image/png', 'application/pdf']
                )
            ]
        )
    """
    def __init__(self, max_size=None, content_types=None):
        self.max_size = max_size  # in bytes
        self.content_types = content_types
    
    def __call__(self, value):
        if self.max_size is not None and value.size > self.max_size:
            raise ValidationError(
                _('El archivo es demasiado grande. El tamaño máximo permitido es %(max_size)s bytes'),
                code='file_too_large',
                params={'max_size': self.max_size},
            )
        
        if self.content_types is not None and value.content_type not in self.content_types:
            raise ValidationError(
                _('Tipo de archivo no válido. Los tipos permitidos son: %(content_types)s'),
                code='invalid_file_type',
                params={'content_types': ', '.join(self.content_types)},
            )
