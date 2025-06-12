from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Carrito])
def read_carritos(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve shopping carts.
    """
    carritos = crud.carrito.get_by_usuario(
        db, usuario_id=current_user.id, skip=skip, limit=limit
    )
    return carritos

@router.post("/", response_model=schemas.Carrito)
def create_carrito(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new shopping cart.
    """
    # Check if user already has an active cart
    carrito_activo = crud.carrito.get_activo_by_usuario(
        db, usuario_id=current_user.id
    )
    if carrito_activo:
        raise HTTPException(
            status_code=400,
            detail="User already has an active shopping cart",
        )
    carrito = crud.carrito.create_with_usuario(db, usuario_id=current_user.id)
    return carrito

@router.get("/activo", response_model=schemas.Carrito)
def read_carrito_activo(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get active shopping cart.
    """
    carrito = crud.carrito.get_activo_by_usuario(db, usuario_id=current_user.id)
    if not carrito:
        raise HTTPException(
            status_code=404,
            detail="No active shopping cart found",
        )
    return carrito

@router.post("/items", response_model=schemas.ItemCarrito)
def add_item_carrito(
    *,
    db: Session = Depends(deps.get_db),
    item_in: schemas.ItemCarritoCreate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add item to active shopping cart.
    """
    carrito = crud.carrito.get_activo_by_usuario(db, usuario_id=current_user.id)
    if not carrito:
        raise HTTPException(
            status_code=404,
            detail="No active shopping cart found",
        )
    item = crud.carrito.add_item(
        db, carrito_id=carrito.id, item_in=item_in
    )
    if not item:
        raise HTTPException(
            status_code=400,
            detail="Could not add item to cart. Check package availability.",
        )
    return item

@router.put("/items/{item_id}", response_model=schemas.ItemCarrito)
def update_item_carrito(
    *,
    db: Session = Depends(deps.get_db),
    item_id: int,
    item_in: schemas.ItemCarritoUpdate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update item in active shopping cart.
    """
    carrito = crud.carrito.get_activo_by_usuario(db, usuario_id=current_user.id)
    if not carrito:
        raise HTTPException(
            status_code=404,
            detail="No active shopping cart found",
        )
    item = crud.carrito.update_item(
        db, carrito_id=carrito.id, item_id=item_id, item_in=item_in
    )
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found in cart",
        )
    return item

@router.delete("/items/{item_id}", response_model=schemas.ItemCarrito)
def remove_item_carrito(
    *,
    db: Session = Depends(deps.get_db),
    item_id: int,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove item from active shopping cart.
    """
    carrito = crud.carrito.get_activo_by_usuario(db, usuario_id=current_user.id)
    if not carrito:
        raise HTTPException(
            status_code=404,
            detail="No active shopping cart found",
        )
    item = crud.carrito.remove_item(
        db, carrito_id=carrito.id, item_id=item_id
    )
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found in cart",
        )
    return item

@router.get("/total", response_model=float)
def get_carrito_total(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get total amount of active shopping cart.
    """
    carrito = crud.carrito.get_activo_by_usuario(db, usuario_id=current_user.id)
    if not carrito:
        raise HTTPException(
            status_code=404,
            detail="No active shopping cart found",
        )
    return crud.carrito.get_total(db, carrito_id=carrito.id) 