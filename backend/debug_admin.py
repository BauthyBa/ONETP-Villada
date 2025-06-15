#!/usr/bin/env python3

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app import crud

def debug_admin():
    db = SessionLocal()
    
    try:
        # Get admin user
        admin_user = crud.usuario.get_by_email(db, email="admin@tourpackages.com")
        if not admin_user:
            print("❌ No se encontró el usuario admin")
            return
        
        print(f"👤 Usuario: {admin_user.email}")
        print(f"🆔 ID: {admin_user.id}")
        print(f"🔑 Rol: {admin_user.role}")
        print(f"✅ Activo: {admin_user.is_active}")
        print("")
        
        print("🔍 Verificando permisos:")
        print(f"is_jefe_ventas: {crud.usuario.is_jefe_ventas(admin_user)}")
        print(f"is_admin: {crud.usuario.is_admin(admin_user)}")
        print(f"role in ['admin', 'jefe_ventas']: {admin_user.role in ['admin', 'jefe_ventas']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_admin() 