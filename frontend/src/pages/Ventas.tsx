import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface DetalleVenta {
  id: number;
  paquete: {
    id: number;
    nombre: string;
    precio: number;
    destino: string;
    duracion_dias: number;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Venta {
  id: number;
  fecha_venta: string;
  total: number;
  estado: string;
  metodo_pago: string;
  items: DetalleVenta[];
}

const Ventas = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingVenta, setUpdatingVenta] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await axios.get('/api/v1/ventas/');
      
      // Handle different response formats - extract results if needed
      const ventasData = Array.isArray(response.data) ? response.data : 
                        (response.data?.results || response.data?.data || []);
      
      console.log('Ventas response:', response.data);
      setVentas(ventasData);
    } catch (err) {
      console.error('Error fetching ventas:', err);
      setError('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVenta = async (ventaId: number) => {
    if (!window.confirm('¿Estás seguro que deseas cancelar este pedido?')) {
      return;
    }

    setUpdatingVenta(ventaId);
    try {
      await axios.put(`/api/v1/ventas/${ventaId}`, {
        estado: 'cancelada'
      });
      showSuccess('Pedido cancelado exitosamente');
      fetchVentas();
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al cancelar el pedido');
    } finally {
      setUpdatingVenta(null);
    }
  };

  const handleUpdateQuantity = async (ventaId: number, detalleId: number, cantidad: number) => {
    if (cantidad < 1) return;
    
    setUpdatingVenta(ventaId);
    try {
      await axios.put(`/api/v1/ventas/${ventaId}/detalles/${detalleId}`, {
        cantidad: cantidad
      });
      showInfo(`Cantidad actualizada a ${cantidad}`);
      fetchVentas();
      setEditingItem(null);
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al actualizar la cantidad');
    } finally {
      setUpdatingVenta(null);
    }
  };

  const handleRemoveItem = async (ventaId: number, detalleId: number) => {
    if (!window.confirm('¿Deseas eliminar este paquete del pedido?')) {
      return;
    }

    setUpdatingVenta(ventaId);
    try {
      await axios.delete(`/api/v1/ventas/${ventaId}/detalles/${detalleId}`);
      showSuccess('Paquete eliminado del pedido');
      fetchVentas();
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al eliminar el paquete');
    } finally {
      setUpdatingVenta(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'entregada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDestinoIcon = (destino: string) => {
    const icons: { [key: string]: string } = {
      'Bariloche': '🏔️',
      'Mendoza': '🍷',
      'Iguazú': '💧',
      'El Calafate': '🧊',
      'Buenos Aires': '🏛️',
      'Salta': '🌄',
      'Ushuaia': '🐧',
      'Córdoba': '🏞️'
    };
    return icons[destino] || '🌎';
  };

  const canModify = (estado: string) => {
    return estado === 'pendiente';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg text-gray-600">Cargando pedidos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            📋 {user?.role === 'admin' ? 'Todas las Ventas' : 'Mis Pedidos'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'admin' 
              ? 'Gestiona todas las ventas del sistema'
              : 'Revisa, modifica o cancela tus pedidos pendientes'
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {ventas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tienes pedidos</h3>
            <p className="text-gray-600">Cuando realices una compra, aparecerá aquí</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ventas.map((venta) => (
              <div key={venta.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Venta Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{venta.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(venta.fecha_venta).toLocaleDateString()} • 
                        💳 {venta.metodo_pago || 'No especificado'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(venta.estado)}`}>
                        {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ${venta.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Venta Details */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Paquetes incluidos:</h4>
                  <div className="space-y-3">
                    {venta.items.map((detalle) => (
                      <div key={detalle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                            {getDestinoIcon(detalle.paquete.destino)}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{detalle.paquete.nombre}</h5>
                            <p className="text-sm text-gray-600">
                              {detalle.paquete.destino} • {detalle.paquete.duracion_dias} días
                            </p>
                            <p className="text-sm text-blue-600">
                              ${detalle.precio_unitario.toLocaleString()} por persona
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Quantity Controls */}
                          {canModify(venta.estado) && editingItem === detalle.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="1"
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 border rounded text-center"
                              />
                              <button
                                onClick={() => handleUpdateQuantity(venta.id, detalle.id, newQuantity)}
                                disabled={updatingVenta === venta.id}
                                className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingItem(null)}
                                className="bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Cantidad:</span>
                              <span className="font-medium">{detalle.cantidad}</span>
                              {canModify(venta.estado) && (
                                <button
                                  onClick={() => {
                                    setEditingItem(detalle.id);
                                    setNewQuantity(detalle.cantidad);
                                  }}
                                  disabled={updatingVenta === venta.id}
                                  className="text-blue-600 text-sm hover:text-blue-800 disabled:opacity-50"
                                >
                                  ✏️ Editar
                                </button>
                              )}
                            </div>
                          )}

                          {/* Subtotal */}
                          <div className="text-right min-w-[80px]">
                            <div className="font-semibold text-gray-900">
                              ${detalle.subtotal.toLocaleString()}
                            </div>
                            {canModify(venta.estado) && (
                              <button
                                onClick={() => handleRemoveItem(venta.id, detalle.id)}
                                disabled={updatingVenta === venta.id}
                                className="text-red-600 text-sm hover:text-red-800 disabled:opacity-50"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {canModify(venta.estado) && (
                    <div className="mt-4 pt-4 border-t flex justify-end space-x-3">
                      <button
                        onClick={() => handleCancelVenta(venta.id)}
                        disabled={updatingVenta === venta.id}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {updatingVenta === venta.id ? '⏳ Cancelando...' : '❌ Cancelar Pedido'}
                      </button>
                    </div>
                  )}

                  {!canModify(venta.estado) && venta.estado !== 'pendiente' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        {venta.estado === 'cancelada' && '❌ Este pedido ha sido cancelado'}
                        {venta.estado === 'confirmada' && '✅ Este pedido ha sido confirmado y no puede modificarse'}
                        {venta.estado === 'entregada' && '📦 Este pedido ha sido entregado'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ventas; 