from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.paquete import PaqueteTuristico
from app.schemas.paquete import PaqueteCreate, PaqueteUpdate

class CRUDPaquete(CRUDBase[PaqueteTuristico, PaqueteCreate, PaqueteUpdate]):
    def get_by_nombre(self, db: Session, *, nombre: str) -> Optional[PaqueteTuristico]:
        return db.query(PaqueteTuristico).filter(PaqueteTuristico.nombre == nombre).first()

    def get_by_destino(
        self, db: Session, *, destino: str, skip: int = 0, limit: int = 100
    ) -> List[PaqueteTuristico]:
        return (
            db.query(PaqueteTuristico)
            .filter(PaqueteTuristico.destino == destino)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_activos(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[PaqueteTuristico]:
        return (
            db.query(PaqueteTuristico)
            .filter(PaqueteTuristico.activo == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, *, obj_in: PaqueteCreate) -> PaqueteTuristico:
        db_obj = PaqueteTuristico(
            nombre=obj_in.nombre,
            descripcion=obj_in.descripcion,
            precio=obj_in.precio,
            duracion_dias=obj_in.duracion_dias,
            cupo_maximo=obj_in.cupo_maximo,
            cupo_disponible=obj_in.cupo_maximo,  # Initially equal to max capacity
            fecha_inicio=obj_in.fecha_inicio,
            fecha_fin=obj_in.fecha_fin,
            destino=obj_in.destino,
            imagen_url=obj_in.imagen_url,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_cupo(
        self, db: Session, *, db_obj: PaqueteTuristico, cantidad: int
    ) -> PaqueteTuristico:
        db_obj.cupo_disponible -= cantidad
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

paquete = CRUDPaquete(PaqueteTuristico) 