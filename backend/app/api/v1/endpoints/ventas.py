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
    if crud.usuario.is_admin(current_user):
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
    if not crud.usuario.is_admin(current_user) and venta.usuario_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Not enough permissions",
        )
    return venta

@router.put("/{venta_id}", response_model=schemas.Venta)
def update_venta(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    venta_in: schemas.VentaUpdate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update sale (only for pending sales and own sales for clients).
    """
    venta = crud.venta.get(db, id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Sale not found",
        )
    
    # Check permissions
    if not crud.usuario.is_admin(current_user) and venta.usuario_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    # Only allow modifications to pending sales for clients
    if not crud.usuario.is_admin(current_user) and venta.estado != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="Can only modify pending sales",
        )
    
    venta = crud.venta.update(db, db_obj=venta, obj_in=venta_in)
    return venta

@router.put("/{venta_id}/detalles/{detalle_id}", response_model=schemas.ItemVenta)
def update_venta_detail(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    detalle_id: int,
    detalle_in: schemas.ItemVentaUpdate,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update sale detail quantity (only for pending sales).
    """
    venta = crud.venta.get(db, id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Sale not found",
        )
    
    # Check permissions
    if not crud.usuario.is_admin(current_user) and venta.usuario_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    # Only allow modifications to pending sales for clients
    if not crud.usuario.is_admin(current_user) and venta.estado != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="Can only modify pending sales",
        )
    
    detalle = crud.venta.update_detail(db, venta_id=venta_id, detalle_id=detalle_id, detalle_in=detalle_in)
    if not detalle:
        raise HTTPException(
            status_code=404,
            detail="Sale detail not found",
        )
    return detalle

@router.delete("/{venta_id}/detalles/{detalle_id}", response_model=schemas.ItemVenta)
def remove_venta_detail(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    detalle_id: int,
    current_user: models.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove sale detail (only for pending sales).
    """
    venta = crud.venta.get(db, id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Sale not found",
        )
    
    # Check permissions
    if not crud.usuario.is_admin(current_user) and venta.usuario_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    # Only allow modifications to pending sales for clients
    if not crud.usuario.is_admin(current_user) and venta.estado != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="Can only modify pending sales",
        )
    
    detalle = crud.venta.remove_detail(db, venta_id=venta_id, detalle_id=detalle_id)
    if not detalle:
        raise HTTPException(
            status_code=404,
            detail="Sale detail not found",
        )
    return detalle

@router.post("/{venta_id}/confirmar", response_model=schemas.Venta)
def confirmar_venta(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    current_user: models.Usuario = Depends(deps.get_current_admin),
) -> Any:
    """
    Confirm sale (admin only).
    """
    venta = crud.venta.confirmar(db, venta_id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Sale not found or cannot be confirmed",
        )
    return venta

@router.post("/{venta_id}/cancelar", response_model=schemas.Venta)
def cancelar_venta(
    *,
    db: Session = Depends(deps.get_db),
    venta_id: int,
    current_user: models.Usuario = Depends(deps.get_current_admin),
) -> Any:
    """
    Cancel sale and restore package availability (admin only).
    """
    venta = crud.venta.cancelar(db, venta_id=venta_id)
    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Sale not found or cannot be cancelled",
        )
    return venta

@router.post("/test-email")
def test_email(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_admin),
) -> Any:
    """
    Test email functionality by sending a test purchase confirmation.
    """
    # Create test data
    venta_data = {
        'id': 999,
        'fecha': '2024-03-20 15:30',
        'total': 150000.00,
        'metodo_pago': 'Transferencia Bancaria',
        'estado': 'pendiente',
        'detalles': [
            {
                'paquete_nombre': 'Escapada a Bariloche',
                'cantidad': 2,
                'precio_unitario': 75000.00,
                'subtotal': 150000.00
            }
        ]
    }
    
    client_data = {
        'name': 'Bautista',
        'surname': 'Barbero',
        'email': 'barberogaticabautista@gmail.com',
        'phone': '1234567890',
        'address': 'Calle Test 123'
    }
    
    # Send test email
    try:
        email_service.send_purchase_confirmation_client(
            client_email=client_data['email'],
            client_name=f"{client_data['name']} {client_data['surname']}",
            venta_data=venta_data
        )
        return {"message": "Test email sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending test email: {str(e)}"
        ) 