from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Paquete])
def read_paquetes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve tour packages.
    """
    paquetes = crud.paquete.get_multi(db, skip=skip, limit=limit)
    return paquetes

@router.post("/", response_model=schemas.Paquete)
def create_paquete(
    *,
    db: Session = Depends(deps.get_db),
    paquete_in: schemas.PaqueteCreate,
    current_user: models.Usuario = Depends(deps.get_current_jefe_ventas),
) -> Any:
    """
    Create new tour package.
    """
    paquete = crud.paquete.create(db, obj_in=paquete_in)
    return paquete

@router.put("/{paquete_id}", response_model=schemas.Paquete)
def update_paquete(
    *,
    db: Session = Depends(deps.get_db),
    paquete_id: int,
    paquete_in: schemas.PaqueteUpdate,
    current_user: models.Usuario = Depends(deps.get_current_jefe_ventas),
) -> Any:
    """
    Update a tour package.
    """
    paquete = crud.paquete.get(db, id=paquete_id)
    if not paquete:
        raise HTTPException(
            status_code=404,
            detail="The tour package with this id does not exist in the system",
        )
    paquete = crud.paquete.update(db, db_obj=paquete, obj_in=paquete_in)
    return paquete

@router.get("/activos/", response_model=List[schemas.Paquete])
def read_paquetes_activos(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get active tour packages.
    """
    paquetes = crud.paquete.get_activos(db, skip=skip, limit=limit)
    return paquetes

@router.get("/{paquete_id}", response_model=schemas.Paquete)
def read_paquete(
    *,
    db: Session = Depends(deps.get_db),
    paquete_id: int,
) -> Any:
    """
    Get tour package by ID.
    """
    paquete = crud.paquete.get(db, id=paquete_id)
    if not paquete:
        raise HTTPException(
            status_code=404,
            detail="The tour package with this id does not exist in the system",
        )
    return paquete

@router.get("/destino/{destino}", response_model=List[schemas.Paquete])
def read_paquetes_by_destino(
    *,
    db: Session = Depends(deps.get_db),
    destino: str,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get tour packages by destination.
    """
    paquetes = crud.paquete.get_by_destino(
        db, destino=destino, skip=skip, limit=limit
    )
    return paquetes 