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
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
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
    
    setUpdatingItem(itemId);
    try {
      await axios.put(`/api/v1/carritos/items/${itemId}`, {
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
      await axios.delete(`/api/v1/carritos/items/${itemId}`);
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
      await axios.post('/api/v1/carritos/checkout');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg text-gray-600">Cargando carrito...</div>
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

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
            <p className="text-lg text-gray-600 mb-8">
              Explora nuestros paquetes turísticos y agrega los que más te gusten
            </p>
            <button
              onClick={() => navigate('/paquetes')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Ver Paquetes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🛒 Mi Carrito de Compras</h1>
          <p className="text-gray-600 mt-2">Revisa y confirma tu selección de paquetes</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Paquetes Seleccionados ({carrito.items.length})
                </h2>
              </div>

              <div className="divide-y">
                {carrito.items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                          {getDestinoIcon(item.paquete.destino)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.paquete.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            {item.paquete.destino} • {item.paquete.duracion_dias} días
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            ${item.paquete.precio.toLocaleString()} por persona
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1 || updatingItem === item.id}
                            className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium">
                            {updatingItem === item.id ? '⏳' : item.cantidad}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                            disabled={updatingItem === item.id}
                            className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[100px]">
                          <div className="font-semibold text-gray-900">
                            ${item.subtotal.toLocaleString()}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updatingItem === item.id}
                            className="text-red-600 text-sm hover:text-red-800 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({carrito.items.length} paquetes)</span>
                  <span>${carrito.total.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${carrito.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processingCheckout}
                className={`w-full py-3 rounded-lg font-medium ${
                  processingCheckout
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {processingCheckout ? (
                  <>⏳ Procesando...</>
                ) : (
                  <>✅ Confirmar Compra</>
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/paquetes')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ← Seguir agregando paquetes
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-700 text-sm">
                  <span className="font-medium">📋 Nota:</span> Tu compra será registrada como pendiente de entrega.
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