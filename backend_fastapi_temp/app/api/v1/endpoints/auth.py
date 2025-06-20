from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core.security import create_access_token

router = APIRouter()

@router.get("/me", response_model=schemas.Usuario)
def read_users_me(
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=schemas.Usuario)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UsuarioUpdate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    user = crud.usuario.update(db, db_obj=current_user, obj_in=user_in)
    return user 