# Diagrama Entidad-Relación (DER)

## Entidades Principales

### Usuario
- id (PK)
- email
- password_hash
- nombre
- apellido
- telefono
- direccion
- rol (cliente/jefe_ventas)
- fecha_registro
- activo

### PaqueteTuristico
- id (PK)
- nombre
- descripcion
- precio
- duracion_dias
- cupo_maximo
- cupo_disponible
- fecha_inicio
- fecha_fin
- destino
- imagen_url
- activo

### Carrito
- id (PK)
- usuario_id (FK)
- fecha_creacion
- estado (activo/comprado/abandonado)

### ItemCarrito
- id (PK)
- carrito_id (FK)
- paquete_id (FK)
- cantidad
- precio_unitario
- subtotal

### Venta
- id (PK)
- usuario_id (FK)
- fecha_venta
- total
- estado (pendiente/confirmada/cancelada)
- metodo_pago
- numero_transaccion

### DetalleVenta
- id (PK)
- venta_id (FK)
- paquete_id (FK)
- cantidad
- precio_unitario
- subtotal

## Relaciones

1. Usuario 1:N Carrito
   - Un usuario puede tener múltiples carritos
   - Un carrito pertenece a un solo usuario

2. Carrito 1:N ItemCarrito
   - Un carrito puede tener múltiples items
   - Un item pertenece a un solo carrito

3. PaqueteTuristico 1:N ItemCarrito
   - Un paquete puede estar en múltiples items de carrito
   - Un item de carrito contiene un solo paquete

4. Usuario 1:N Venta
   - Un usuario puede tener múltiples ventas
   - Una venta pertenece a un solo usuario

5. Venta 1:N DetalleVenta
   - Una venta puede tener múltiples detalles
   - Un detalle pertenece a una sola venta

6. PaqueteTuristico 1:N DetalleVenta
   - Un paquete puede estar en múltiples detalles de venta
   - Un detalle de venta contiene un solo paquete

## Índices

- Usuario: email (único)
- PaqueteTuristico: nombre, destino
- Venta: fecha_venta, estado
- Carrito: usuario_id, estado 