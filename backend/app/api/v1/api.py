from fastapi import APIRouter

from app.api.v1.endpoints import login, usuarios, paquetes, carritos, ventas, auth

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["usuarios"])
api_router.include_router(paquetes.router, prefix="/paquetes", tags=["paquetes"])
api_router.include_router(carritos.router, prefix="/carritos", tags=["carritos"])
api_router.include_router(ventas.router, prefix="/ventas", tags=["ventas"]) 