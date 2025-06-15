from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.db.session import SessionLocal
from app.core.config import settings
from app import crud, models

security = HTTPBearer()

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(security)
) -> models.Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.usuario.get(db, id=int(user_id))
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(
    current_user: models.Usuario = Depends(get_current_user),
) -> models.Usuario:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_jefe_ventas(
    current_user: models.Usuario = Depends(get_current_user),
) -> models.Usuario:
    if current_user.role != "jefe_ventas":
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_admin(
    current_user: models.Usuario = Depends(get_current_user),
) -> models.Usuario:
    """Check if user has admin privileges (admin or jefe_ventas)"""
    if current_user.role not in ["admin", "jefe_ventas"]:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

# Optional user dependency (for endpoints that work with or without auth)
def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[models.Usuario]:
    if not token:
        return None
    
    try:
        return get_current_user(db, token)
    except HTTPException:
        return None 