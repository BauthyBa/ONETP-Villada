#!/usr/bin/env python3

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app import crud, schemas

def update_to_admin():
    db = SessionLocal()
    
    try:
        # Get existing admin user
        admin_user = crud.usuario.get_by_email(db, email="admin@tourpackages.com")
        if not admin_user:
            print("❌ No se encontró el usuario admin")
            return
        
        print(f"👤 Usuario encontrado: {admin_user.email}")
        print(f"🔑 Rol actual: {admin_user.role}")
        
        # Update to admin role
        if admin_user.role != "admin":
            admin_user.role = "admin"
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("✅ Rol actualizado a 'admin'")
        else:
            print("✅ El usuario ya tiene rol 'admin'")
        
        print(f"📧 Email: {admin_user.email}")
        print(f"👤 Nombre: {admin_user.name} {admin_user.surname}")
        print(f"🔑 Rol: {admin_user.role}")
        print("🔒 Contraseña: La contraseña anterior sigue siendo válida")
        print("")
        print("✅ Usuario admin listo para usar")
        
    except Exception as e:
        print(f"❌ Error actualizando usuario: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Actualizando usuario a administrador...")
    update_to_admin() 