#!/usr/bin/env python3
"""
Script para configurar usuario admin en Render
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

def setup_admin_user():
    """Configurar usuario admin con las credenciales correctas"""
    try:
        # Verificar si el usuario ya existe
        admin_user, created = User.objects.get_or_create(
            email='admin@tourpackages.com',
            defaults={
                'nombre': 'Admin',
                'apellido': 'User',
                'tipo_usuario': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'password': make_password('admin1234')
            }
        )
        
        if created:
            print("✅ Usuario admin creado exitosamente!")
        else:
            # Actualizar la contraseña si el usuario ya existe
            admin_user.password = make_password('admin1234')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.tipo_usuario = 'admin'
            admin_user.save()
            print("✅ Usuario admin actualizado exitosamente!")
        
        print(f"📧 Email: {admin_user.email}")
        print(f"🔑 Password: admin1234")
        print(f"👤 Nombre: {admin_user.nombre} {admin_user.apellido}")
        print(f"🔑 Tipo: {admin_user.tipo_usuario}")
        print(f"👑 Staff: {admin_user.is_staff}")
        print(f"👑 Superuser: {admin_user.is_superuser}")
        
    except Exception as e:
        print(f"❌ Error configurando usuario admin: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    setup_admin_user() 