#!/usr/bin/env python3
"""
Script para crear usuario admin en Render
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    """Crear usuario admin si no existe"""
    try:
        # Verificar si el usuario ya existe
        if User.objects.filter(email='admin@tour.com').exists():
            print("⚠️  El usuario admin ya existe")
            admin_user = User.objects.get(email='admin@tour.com')
            print(f"📧 Email: {admin_user.email}")
            print(f"👤 Nombre: {admin_user.nombre} {admin_user.apellido}")
            print(f"🔑 Tipo: {admin_user.tipo_usuario}")
            return
        
        # Crear el usuario admin
        admin_user = User.objects.create_superuser(
            email='admin@tour.com',
            password='admin1234',
            nombre='Admin',
            apellido='User',
            tipo_usuario='admin'
        )
        
        print("✅ Usuario admin creado exitosamente!")
        print(f"📧 Email: {admin_user.email}")
        print(f"🔑 Password: admin1234")
        print(f"👤 Nombre: {admin_user.nombre} {admin_user.apellido}")
        print(f"🔑 Tipo: {admin_user.tipo_usuario}")
        
    except Exception as e:
        print(f"❌ Error creando usuario admin: {e}")

if __name__ == "__main__":
    create_admin_user() 