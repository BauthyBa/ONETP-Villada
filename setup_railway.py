#!/usr/bin/env python
"""
Script para configurar la base de datos en Railway
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line
from api.models import Usuario

def setup_database():
    """Configura la base de datos y crea el usuario admin"""
    print("🔄 Ejecutando migraciones...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("🔄 Creando usuario administrador...")
    try:
        admin_user = Usuario.objects.create_user(
            email='admin@tour.com',
            password='admin1234',
            nombre='Admin',
            apellido='System',
            tipo_usuario='admin'
        )
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("✅ Usuario admin creado: admin@tour.com / admin1234")
    except Exception as e:
        print(f"⚠️  Usuario admin ya existe o error: {e}")
    
    print("🔄 Recolectando archivos estáticos...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    
    print("✅ Configuración completada!")

if __name__ == '__main__':
    setup_database() 