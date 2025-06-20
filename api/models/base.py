"""
Base model with common fields and methods.
"""
from django.db import models
from django.utils import timezone

class BaseModel(models.Model):
    """Abstract base model with common fields."""
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('fecha de actualización', auto_now=True)
    is_active = models.BooleanField('activo', default=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def delete(self, *args, **kwargs):
        """Soft delete implementation."""
        self.is_active = False
        self.save()

    def hard_delete(self, *args, **kwargs):
        """Permanently delete the record."""
        super().delete(*args, **kwargs)
