import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import Footer from '../components/Footer';

interface ItemCarrito {
  id: number;
  paquete: {
    id: number;
    nombre: string;
    precio: number;
    imagen_url: string;
    destino: string;
    duracion_dias: number;
  };
  cantidad: number;
  subtotal: number;
}

interface CarritoData {
  id: number;
  items: ItemCarrito[];
  total: number;
}

const Carrito = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState<CarritoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    fetchCarrito();
  }, []);

  const fetchCarrito = async () => {
    try {
      const response = await axios.get('/api/v1/carritos/mi_carrito/');
      setCarrito(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCarrito(null);
      } else {
        setError('Error al cargar el carrito');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(itemId);
    try {
      await axios.put(`/api/v1/carrito-items/${itemId}/`, {
        cantidad: newQuantity,
      });
      showInfo(`Cantidad actualizada a ${newQuantity}`);
      fetchCarrito();
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al actualizar la cantidad');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItem(itemId);
    try {
      await axios.delete(`/api/v1/carrito-items/${itemId}/`);
      showSuccess('Paquete eliminado del carrito');
      fetchCarrito();
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al eliminar el item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleCheckout = async () => {
    setProcessingCheckout(true);
    try {
      await axios.post('/api/v1/ventas/confirmar_pago/', {
        metodo_pago: 'efectivo' // Default payment method
      });
      showSuccess('¡Compra registrada exitosamente! 🎉 Tu pedido está pendiente de entrega.');
      navigate('/ventas');
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al procesar la compra');
    } finally {
      setProcessingCheckout(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <div className="text-xl text-gray-600">Cargando tu carrito...</div>
          <div className="text-sm text-gray-500 mt-2">Preparando tus aventuras seleccionadas</div>
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
            onClick={fetchCarrito}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-8xl mb-8 opacity-60">🛒</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Tu carrito está vacío
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              ¡Es hora de llenar tu carrito con experiencias increíbles! 
              Explora nuestros paquetes turísticos y descubre tu próxima aventura.
            </p>
            <button
              onClick={() => navigate('/paquetes')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center space-x-3 mx-auto"
            >
              <span>🏞️</span>
              <span>Descubrir Paquetes</span>
              <span>✨</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-5xl md:text-6xl mb-4 animate-bounce">🛒</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-200 to-blue-200 bg-clip-text text-transparent">
              Mi Carrito de Compras
            </h1>
            <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
              Revisa y confirma tu selección de paquetes para vivir experiencias únicas
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-300 to-blue-300 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="text-3xl mr-3">🎒</span>
                  Paquetes Seleccionados ({carrito.items.length})
                </h2>
                <p className="text-green-100 mt-1">Tus próximas aventuras te esperan</p>
              </div>

              <div className="divide-y divide-gray-100">
                {carrito.items.map((item, index) => (
                  <div key={item.id} className={`p-8 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg">
                          {getDestinoIcon(item.paquete.destino)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{item.paquete.nombre}</h3>
                          <div className="flex flex-wrap gap-3 mb-3">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              📍 {item.paquete.destino}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              📅 {item.paquete.duracion_dias} días
                            </span>
                          </div>
                          <p className="text-lg font-bold text-green-600">
                            ${item.paquete.precio.toLocaleString()} por persona
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-100 rounded-xl p-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1 || updatingItem === item.id}
                            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                          >
                            −
                          </button>
                          <span className="mx-4 text-lg font-bold text-gray-800 min-w-[2rem] text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                            disabled={updatingItem === item.id}
                            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">Subtotal</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${item.subtotal.toLocaleString()}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItem === item.id}
                          className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                        >
                          {updatingItem === item.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <span className="text-lg">🗑️</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 sticky top-6 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="text-3xl mr-3">💳</span>
                  Resumen del Pedido
                </h2>
                <p className="text-purple-100 mt-1">Tu inversión en aventuras</p>
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 flex items-center">
                      <span className="mr-2">📦</span>
                      Subtotal ({carrito.items.length} paquete{carrito.items.length !== 1 ? 's' : ''})
                    </span>
                    <span className="font-semibold text-lg">${carrito.total.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="text-green-700 flex items-center">
                      <span className="mr-2">🎁</span>
                      Descuentos
                    </span>
                    <span className="font-semibold text-green-600">$0</span>
                  </div>
                  
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                      <span className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="mr-2">💰</span>
                        Total Final
                      </span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${carrito.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={processingCheckout}
                  className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                    processingCheckout
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 hover:scale-105 shadow-xl hover:shadow-green-500/25'
                  } text-white flex items-center justify-center space-x-3`}
                >
                  {processingCheckout ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Procesando compra...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Confirmar Compra</span>
                      <span>🚀</span>
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/paquetes')}
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center justify-center space-x-2 mx-auto group"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Seguir agregando paquetes</span>
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-blue-700 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">📋</span>
                        <div>
                          <div className="font-semibold mb-1">Proceso de compra:</div>
                          <div>Tu compra será registrada como pendiente de entrega. Recibirás una confirmación inmediatamente.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-green-700 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">🛡️</span>
                        <div>
                          <div className="font-semibold mb-1">Garantía total:</div>
                          <div>Todos nuestros paquetes incluyen seguro de viaje y asistencia 24/7.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-purple-700 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">⭐</span>
                        <div>
                          <div className="font-semibold mb-1">Experiencia premium:</div>
                          <div>Disfruta de alojamientos de calidad y actividades exclusivas en cada destino.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Carrito; 