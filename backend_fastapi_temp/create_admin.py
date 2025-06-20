#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app import crud, schemas
from app.core.security import get_password_hash

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin_user = crud.usuario.get_by_email(db, email="admin@tourpackages.com")
        if admin_user:
            print("❌ El usuario admin ya existe")
            print(f"📧 Email: {admin_user.email}")
            print(f"👤 Nombre: {admin_user.name} {admin_user.surname}")
            print(f"🔑 Rol: {admin_user.role}")
            return
        
        # Create admin user
        admin_data = schemas.UsuarioCreate(
            email="admin@tourpackages.com",
            password="admin123",  # Change this password!
            name="Administrador",
            surname="Sistema",
            role="admin",
            phone="1234567890",
            address="Dirección Admin"
        )
        
        admin_user = crud.usuario.create(db, obj_in=admin_data)
        
        print("✅ Usuario administrador creado exitosamente!")
        print(f"📧 Email: {admin_user.email}")
        print(f"👤 Nombre: {admin_user.name} {admin_user.surname}")
        print(f"🔑 Rol: {admin_user.role}")
        print("🔒 Contraseña: admin123")
        print("")
        print("⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
        
    except Exception as e:
        print(f"❌ Error creando usuario admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creando usuario administrador...")
    create_admin_user() 