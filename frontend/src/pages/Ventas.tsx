import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Footer from '../components/Footer';

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
  precio_unitario: number | string;
  subtotal: number | string;  // Puede ser string del backend
}

interface Venta {
  id: number;
  fecha_venta: string;
  total: number | string;  // Puede ser string del backend
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <div className="text-xl text-gray-600">Cargando tus pedidos...</div>
          <div className="text-sm text-gray-500 mt-2">Preparando tu historial de aventuras</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchVentas}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-5xl md:text-6xl mb-4 animate-bounce">📋</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              {user?.role === 'admin' ? 'Todas las Ventas' : 'Mis Pedidos'}
            </h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto">
              {user?.role === 'admin' 
                ? 'Gestiona todas las ventas del sistema y confirma entregas'
                : 'Revisa, modifica o cancela tus pedidos pendientes'
              }
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-300 to-blue-300 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {ventas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="text-8xl mb-8 opacity-60">📦</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {user?.role === 'admin' ? 'No hay ventas registradas' : 'No tienes pedidos aún'}
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {user?.role === 'admin' 
                ? 'Las ventas aparecerán aquí cuando los usuarios realicen compras'
                : 'Cuando realices una compra, aparecerá aquí para que puedas hacer seguimiento'
              }
            </p>
            {user?.role !== 'admin' && (
              <a
                href="/paquetes"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg inline-flex items-center space-x-2"
              >
                <span>🏞️</span>
                <span>Explorar Paquetes</span>
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {ventas.map((venta) => (
              <div key={venta.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Venta Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                    <div>
                      <h3 className="text-2xl font-bold flex items-center mb-2">
                        <span className="text-3xl mr-3">🎫</span>
                        Pedido #{venta.id}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                          📅 {new Date(venta.fecha_venta).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                          💳 {venta.metodo_pago}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-2">
                        ${parseFloat(venta.total.toString()).toLocaleString()}
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${getEstadoColor(venta.estado)}`}>
                        {venta.estado === 'pendiente' && '⏳ Pendiente'}
                        {venta.estado === 'confirmada' && '✅ Confirmada'}
                        {venta.estado === 'cancelada' && '❌ Cancelada'}
                        {venta.estado === 'entregada' && '🚚 Entregada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Venta Details */}
                <div className="p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-3">🎒</span>
                    Paquetes incluidos
                  </h4>
                  <div className="space-y-4">
                    {venta.items.map((detalle, index) => (
                      <div key={detalle.id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                        index % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-green-50 to-blue-50'
                      }`}>
                        <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg">
                            {getDestinoIcon(detalle.paquete.destino)}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-1">{detalle.paquete.nombre}</h5>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                📍 {detalle.paquete.destino}
                              </span>
                              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                📅 {detalle.paquete.duracion_dias} días
                              </span>
                            </div>
                            <p className="text-green-600 font-bold">
                              ${parseFloat(detalle.precio_unitario.toString()).toLocaleString()} por persona
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
                          {/* Quantity Controls */}
                          {canModify(venta.estado) && editingItem === detalle.id ? (
                            <div className="flex items-center bg-white rounded-xl p-3 shadow-md">
                              <input
                                type="number"
                                min="1"
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                                className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                onClick={() => handleUpdateQuantity(venta.id, detalle.id, newQuantity)}
                                disabled={updatingVenta === venta.id}
                                className="ml-3 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all duration-200 flex items-center space-x-1"
                              >
                                <span>✓</span>
                                <span className="hidden sm:inline">Confirmar</span>
                              </button>
                              <button
                                onClick={() => setEditingItem(null)}
                                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center space-x-1"
                              >
                                <span>✕</span>
                                <span className="hidden sm:inline">Cancelar</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center bg-white rounded-xl p-4 shadow-md">
                              <span className="text-gray-600 mr-3">Cantidad:</span>
                              <span className="text-xl font-bold text-blue-600 mr-3">{detalle.cantidad}</span>
                              {canModify(venta.estado) && (
                                <button
                                  onClick={() => {
                                    setEditingItem(detalle.id);
                                    setNewQuantity(detalle.cantidad);
                                  }}
                                  disabled={updatingVenta === venta.id}
                                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 flex items-center space-x-1"
                                >
                                  <span>✏️</span>
                                  <span className="hidden sm:inline">Editar</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Subtotal */}
                          <div className="text-center bg-white rounded-xl p-4 shadow-md">
                            <div className="text-sm text-gray-500 mb-1">Subtotal</div>
                            <div className="text-2xl font-bold text-green-600">
                              ${parseFloat(detalle.subtotal.toString()).toLocaleString()}
                            </div>
                            {canModify(venta.estado) && (
                              <button
                                onClick={() => handleRemoveItem(venta.id, detalle.id)}
                                disabled={updatingVenta === venta.id}
                                className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all duration-200 text-sm flex items-center space-x-1 mx-auto"
                              >
                                <span>🗑️</span>
                                <span className="hidden sm:inline">Eliminar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {canModify(venta.estado) && (
                    <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-end">
                      <button
                        onClick={() => handleCancelVenta(venta.id)}
                        disabled={updatingVenta === venta.id}
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-700 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-red-500/25 flex items-center space-x-3"
                      >
                        {updatingVenta === venta.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Cancelando...</span>
                          </>
                        ) : (
                          <>
                            <span>❌</span>
                            <span>Cancelar Pedido</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {!canModify(venta.estado) && venta.estado !== 'pendiente' && (
                    <div className="mt-8 pt-6 border-t-2 border-gray-200">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                        <div className="text-center">
                          {venta.estado === 'cancelada' && (
                            <div className="flex items-center justify-center space-x-3 text-red-600">
                              <span className="text-3xl">❌</span>
                              <div>
                                <div className="font-bold text-lg">Pedido Cancelado</div>
                                <div className="text-sm">Este pedido fue cancelado y no puede modificarse</div>
                              </div>
                            </div>
                          )}
                          {venta.estado === 'confirmada' && (
                            <div className="flex items-center justify-center space-x-3 text-green-600">
                              <span className="text-3xl">✅</span>
                              <div>
                                <div className="font-bold text-lg">Pedido Confirmado</div>
                                <div className="text-sm">Tu pedido ha sido confirmado y está en proceso</div>
                              </div>
                            </div>
                          )}
                          {venta.estado === 'entregada' && (
                            <div className="flex items-center justify-center space-x-3 text-blue-600">
                              <span className="text-3xl">🚚</span>
                              <div>
                                <div className="font-bold text-lg">Pedido Entregado</div>
                                <div className="text-sm">¡Disfruta tu experiencia! Esperamos que tengas un viaje increíble</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Ventas; 