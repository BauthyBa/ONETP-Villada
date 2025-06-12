from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Venta])
def read_ventas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve sales.
    """
    if crud.usuario.is_jefe_ventas(current_user):
        ventas = crud.venta.get_multi(db, skip=skip, limit=limit)
    else:
        ventas = crud.venta.get_by_usuario(
            db, usuario_id=current_user.id, skip=skip, limit=limit
        )
    return ventas

@router.post("/", response_model=schemas.Venta)
def create_venta(
    *,
    db: Session = Depends(deps.get_db),
    venta_in: schemas.VentaCreate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new sale from active cart.
    """
    carrito = crud.carrito.get_activo_by_usuario(db, usuario_id=current_user.id)
    if not carrito:
        raise HTTPException(
            status_code=404,
            detail="No active shopping cart found",
        )
    venta = crud.venta.create_from_carrito(
        db, carrito_id=carrito.id, venta_in=venta_in
    )
    if not venta:
        raise HTTPException(
            status_code=400,
            detail="Could not create sale. Check cart status.",
        )
    return venta

@router.get("/{venta_id}", response_model=schemas.Venta)
def read_venta(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get sale by ID.
    """
    venta = crud.venta.get(db, id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Sale not found",
        )
    if not crud.usuario.is_jefe_ventas(current_user) and venta.usuario_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Not enough permissions",
        )
    return venta

@router.post("/{venta_id}/confirmar", response_model=schemas.Venta)
def confirmar_venta(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    current_user: models.Usuario = Depends(deps.get_current_jefe_ventas),
) -> Any:
    """
    Confirm a sale.
    """
    venta = crud.venta.confirmar(db, venta_id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=400,
            detail="Could not confirm sale. Check sale status.",
        )
    return venta

@router.post("/{venta_id}/cancelar", response_model=schemas.Venta)
def cancelar_venta(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    current_user: models.Usuario = Depends(deps.get_current_jefe_ventas),
) -> Any:
    """
    Cancel a sale.
    """
    venta = crud.venta.cancelar(db, venta_id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=400,
            detail="Could not cancel sale. Check sale status.",
        )
    return venta 