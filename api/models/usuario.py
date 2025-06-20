"""
User model and related models.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from .base import BaseModel

class UsuarioManager(BaseUserManager):
    """Custom user model manager where email is the unique identifier."""
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError(_('El correo electrónico es obligatorio'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin, BaseModel):
    """Custom user model that supports using email instead of username."""
    TIPO_USUARIO_CHOICES = [
        ('admin', 'Administrador'),
        ('cliente', 'Cliente'),
        ('vendedor', 'Vendedor'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('correo electrónico'), unique=True)
    nombre = models.CharField(_('nombre'), max_length=100)
    apellido = models.CharField(_('apellido'), max_length=100)
    telefono = models.CharField(_('teléfono'), max_length=20, blank=True, null=True)
    direccion = models.TextField(_('dirección'), blank=True, null=True)
    fecha_nacimiento = models.DateField(_('fecha de nacimiento'), null=True, blank=True)
    tipo_usuario = models.CharField(_('tipo de usuario'), max_length=20, choices=TIPO_USUARIO_CHOICES, default='cliente')
    
    # Required fields for Django user model
    is_staff = models.BooleanField(_('es staff'), default=False)
    is_active = models.BooleanField(_('activo'), default=True)
    is_superuser = models.BooleanField(_('es superusuario'), default=False)
    
    # Custom manager
    objects = UsuarioManager()

    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    class Meta:
        verbose_name = _('usuario')
        verbose_name_plural = _('usuarios')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}>"
    
    def get_full_name(self):
        """Return the full name of the user."""
        return f"{self.nombre} {self.apellido}"
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.nombre
    
    @property
    def is_admin(self):
        """Check if user is an admin."""
        return self.tipo_usuario == 'admin' or self.is_superuser
    
    @property
    def is_cliente(self):
        """Check if user is a client."""
        return self.tipo_usuario == 'cliente'
    
    @property
    def is_vendedor(self):
        """Check if user is a vendor."""
        return self.tipo_usuario == 'vendedor'
