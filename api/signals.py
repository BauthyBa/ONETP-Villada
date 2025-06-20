"""
Signal handlers for the API app.
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings

from .models import Usuario, Carrito


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_cart(sender, instance, created, **kwargs):
    """
    Automatically create a shopping cart when a new user is created.
    """
    if created and not instance.is_superuser:
        Carrito.objects.create(usuario=instance)


# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def save_user_profile(sender, instance, **kwargs):
#     """
#     Save the user profile when the user is saved.
#     """
#     instance.save()
