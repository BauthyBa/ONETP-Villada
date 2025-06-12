from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import engine
from app.models.base import BaseModel
from app.models.usuario import Usuario
from app.models.paquete import PaqueteTuristico
from app.models.carrito import Carrito, ItemCarrito
from app.models.venta import Venta, DetalleVenta
from app.core.security import get_password_hash
from datetime import datetime, timedelta

def init_db() -> None:
    """Initialize database with tables and sample data."""
    # Create all tables
    BaseModel.metadata.create_all(bind=engine)
    
    # Create a session
    db = Session(bind=engine)
    
    try:
        # Check if admin user exists
        admin_user = db.query(Usuario).filter(Usuario.email == "admin@tourpackages.com").first()
        if not admin_user:
            # Create admin user
            admin_user = Usuario(
                email="admin@tourpackages.com",
                hashed_password=get_password_hash("admin123"),
                name="Admin",
                surname="Sistema",
                phone="123456789",
                address="Oficina Central",
                role="jefe_ventas",
                is_active=True
            )
            db.add(admin_user)
        
        # Check if test client exists
        client_user = db.query(Usuario).filter(Usuario.email == "cliente@test.com").first()
        if not client_user:
            # Create test client
            client_user = Usuario(
                email="cliente@test.com",
                hashed_password=get_password_hash("cliente123"),
                name="Juan",
                surname="Pérez",
                phone="987654321",
                address="Calle Falsa 123",
                role="cliente",
                is_active=True
            )
            db.add(client_user)
        
        # Check if sample packages exist
        existing_packages = db.query(PaqueteTuristico).count()
        if existing_packages == 0:
            # Create sample tour packages
            packages = [
                PaqueteTuristico(
                    nombre="Escapada a Bariloche",
                    descripcion="Disfruta de 5 días en la hermosa ciudad de Bariloche con vistas al lago Nahuel Huapi",
                    precio=85000.00,
                    duracion_dias=5,
                    cupo_maximo=20,
                    cupo_disponible=20,
                    fecha_inicio=datetime.now() + timedelta(days=30),
                    fecha_fin=datetime.now() + timedelta(days=35),
                    destino="Bariloche",
                    imagen_url="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500",
                    activo=True
                ),
                PaqueteTuristico(
                    nombre="Aventura en Mendoza",
                    descripcion="Tour de 7 días por las mejores bodegas de Mendoza con degustaciones incluidas",
                    precio=120000.00,
                    duracion_dias=7,
                    cupo_maximo=15,
                    cupo_disponible=15,
                    fecha_inicio=datetime.now() + timedelta(days=45),
                    fecha_fin=datetime.now() + timedelta(days=52),
                    destino="Mendoza",
                    imagen_url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
                    activo=True
                ),
                PaqueteTuristico(
                    nombre="Cataratas del Iguazú",
                    descripcion="Experiencia única de 4 días en las majestuosas Cataratas del Iguazú",
                    precio=95000.00,
                    duracion_dias=4,
                    cupo_maximo=25,
                    cupo_disponible=25,
                    fecha_inicio=datetime.now() + timedelta(days=20),
                    fecha_fin=datetime.now() + timedelta(days=24),
                    destino="Misiones",
                    imagen_url="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
                    activo=True
                ),
                PaqueteTuristico(
                    nombre="Glaciar Perito Moreno",
                    descripcion="Excursión de 6 días al impresionante Glaciar Perito Moreno en El Calafate",
                    precio=150000.00,
                    duracion_dias=6,
                    cupo_maximo=12,
                    cupo_disponible=12,
                    fecha_inicio=datetime.now() + timedelta(days=60),
                    fecha_fin=datetime.now() + timedelta(days=66),
                    destino="El Calafate",
                    imagen_url="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500",
                    activo=True
                ),
                PaqueteTuristico(
                    nombre="Buenos Aires Cultural",
                    descripcion="Recorrido de 3 días por los barrios más emblemáticos de Buenos Aires",
                    precio=65000.00,
                    duracion_dias=3,
                    cupo_maximo=30,
                    cupo_disponible=30,
                    fecha_inicio=datetime.now() + timedelta(days=15),
                    fecha_fin=datetime.now() + timedelta(days=18),
                    destino="Buenos Aires",
                    imagen_url="https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=500",
                    activo=True
                )
            ]
            
            for package in packages:
                db.add(package)
        
        db.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 