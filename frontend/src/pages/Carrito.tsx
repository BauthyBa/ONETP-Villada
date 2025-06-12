import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

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
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    fetchCarrito();
  }, []);

  const fetchCarrito = async () => {
    try {
      const response = await axios.get('/api/v1/carritos/activo');
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
    
    try {
      await axios.put(`/api/v1/carritos/items/${itemId}`, {
        cantidad: newQuantity,
      });
      showInfo(`Cantidad actualizada a ${newQuantity}`);
      fetchCarrito();
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al actualizar la cantidad');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await axios.delete(`/api/v1/carritos/items/${itemId}`);
      showSuccess('Paquete eliminado del carrito');
      fetchCarrito();
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al eliminar el item');
    }
  };

  const handleCheckout = async () => {
    setProcessingCheckout(true);
    try {
      await axios.post('/api/v1/ventas/', {
        metodo_pago: 'tarjeta',
      });
      
      showSuccess('¡Compra realizada exitosamente! 🎉 Recibirás un email de confirmación.');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <div className="text-xl text-gray-600">Cargando tu carrito...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
            <p className="text-xl text-gray-600 mb-8">
              ¡Descubre nuestros increíbles paquetes turísticos y comienza tu aventura!
            </p>
            <button
              onClick={() => navigate('/paquetes')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🌟 Explorar Paquetes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">🛒 Mi Carrito</h1>
          <p className="text-xl opacity-90">Revisa tus paquetes seleccionados</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  📦 Tus Paquetes ({carrito.items.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {carrito.items.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-6">
                      {/* Package Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-3xl">
                          {getDestinoIcon(item.paquete.destino)}
                        </div>
                      </div>

                      {/* Package Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {item.paquete.nombre}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            📍 {item.paquete.destino}
                          </span>
                          <span className="flex items-center">
                            ⏱️ {item.paquete.duracion_dias} días
                          </span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ${item.paquete.precio.toLocaleString()} c/u
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-semibold text-lg">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal and Remove */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800 mb-2">
                          ${item.subtotal.toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          🗑️ Eliminar
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
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                💰 Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({carrito.items.length} paquetes)</span>
                  <span>${carrito.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuentos</span>
                  <span className="text-green-600">-$0</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-blue-600">${carrito.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processingCheckout}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  processingCheckout
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {processingCheckout ? (
                  <>⏳ Procesando...</>
                ) : (
                  <>💳 Proceder al Pago</>
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/paquetes')}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  ← Seguir comprando
                </button>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center text-green-700 text-sm">
                  <span className="mr-2">🔒</span>
                  <span>Compra 100% segura y protegida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito; 