from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Usuario])
def read_usuarios(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.Usuario = Depends(deps.get_current_admin),
) -> Any:
    """
    Retrieve users.
    """
    usuarios = crud.usuario.get_multi(db, skip=skip, limit=limit)
    return usuarios

@router.post("/", response_model=schemas.Usuario)
def create_usuario(
    *,
    db: Session = Depends(deps.get_db),
    usuario_in: schemas.UsuarioCreate,
) -> Any:
    """
    Create new user.
    """
    usuario = crud.usuario.get_by_email(db, email=usuario_in.email)
    if usuario:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    usuario = crud.usuario.create(db, obj_in=usuario_in)
    return usuario

@router.put("/me", response_model=schemas.Usuario)
def update_usuario_me(
    *,
    db: Session = Depends(deps.get_db),
    usuario_in: schemas.UsuarioUpdate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    usuario = crud.usuario.update(db, db_obj=current_user, obj_in=usuario_in)
    return usuario

@router.get("/me", response_model=schemas.Usuario)
def read_usuario_me(
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/debug")
def debug_permissions(
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Debug endpoint to check permissions.
    """
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_admin": crud.usuario.is_admin(current_user),
        "is_jefe_ventas": crud.usuario.is_jefe_ventas(current_user),
        "role_check": current_user.role in ["admin", "jefe_ventas"]
    }

@router.get("/{usuario_id}", response_model=schemas.Usuario)
def read_usuario_by_id(
    usuario_id: int,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    usuario = crud.usuario.get(db, id=usuario_id)
    if usuario == current_user:
        return usuario
    if not crud.usuario.is_admin(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return usuario

@router.put("/{usuario_id}", response_model=schemas.Usuario)
def update_usuario(
    *,
    db: Session = Depends(deps.get_db),
    usuario_id: int,
    usuario_in: schemas.UsuarioUpdate,
    current_user: models.Usuario = Depends(deps.get_current_admin),
) -> Any:
    """
    Update a user.
    """
    usuario = crud.usuario.get(db, id=usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    usuario = crud.usuario.update(db, db_obj=usuario, obj_in=usuario_in)
    return usuario 