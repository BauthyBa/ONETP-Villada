import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Venta {
  id: number;
  fecha: string;
  total: number;
  estado: string;
  metodo_pago: string;
  detalles: Array<{
    id: number;
    paquete: {
      nombre: string;
      destino: string;
    };
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
}

interface Carrito {
  id: number;
  items: Array<{
    id: number;
    paquete: {
      nombre: string;
      destino: string;
      precio: number;
    };
    cantidad: number;
    subtotal: number;
  }>;
  total: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [ventasRes, carritoRes] = await Promise.all([
        axios.get('/api/v1/ventas/'),
        axios.get('/api/v1/carritos/activo').catch(() => ({ data: null }))
      ]);

      setVentas(ventasRes.data);
      setCarrito(carritoRes.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalGastado = ventas
    .filter(v => v.estado === 'confirmada')
    .reduce((sum, v) => sum + v.total, 0);

  const viajesRealizados = ventas.filter(v => v.estado === 'confirmada').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Cargando tu dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl">
              🧳
            </div>
            <div>
              <h1 className="text-4xl font-bold">Mi Dashboard</h1>
              <p className="text-xl opacity-90">Bienvenido de vuelta, {user?.name}!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-4xl mr-4">✈️</div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{viajesRealizados}</div>
                <div className="text-gray-600">Viajes Realizados</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-4xl mr-4">💰</div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  ${totalGastado.toLocaleString()}
                </div>
                <div className="text-gray-600">Total Invertido</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-4xl mr-4">🛒</div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {carrito?.items.length || 0}
                </div>
                <div className="text-gray-600">En el Carrito</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/paquetes"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl text-center hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🏞️</div>
              <div className="font-semibold">Explorar Paquetes</div>
            </Link>
            
            <Link
              to="/carrito"
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl text-center hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🛒</div>
              <div className="font-semibold">Ver Carrito</div>
              {carrito && carrito.items.length > 0 && (
                <div className="text-sm opacity-90">
                  {carrito.items.length} items
                </div>
              )}
            </Link>
            
            <Link
              to="/ventas"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="font-semibold">Mis Compras</div>
            </Link>
            
            <Link
              to="/perfil"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl text-center hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">👤</div>
              <div className="font-semibold">Mi Perfil</div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Purchases */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Compras Recientes</h3>
            {ventas.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🛍️</div>
                <p className="text-gray-600 mb-4">Aún no has realizado ninguna compra</p>
                <Link
                  to="/paquetes"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Explorar Paquetes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {ventas.slice(0, 3).map((venta) => (
                  <div key={venta.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">Compra #{venta.id}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(venta.fecha).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ${venta.total.toLocaleString()}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(venta.estado)}`}>
                          {venta.estado}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {venta.detalles.map((detalle, index) => (
                        <div key={detalle.id}>
                          {detalle.paquete.nombre} - {detalle.paquete.destino}
                          {index < venta.detalles.length - 1 && ', '}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {ventas.length > 3 && (
                  <div className="text-center">
                    <Link
                      to="/ventas"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver todas las compras →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Cart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🛒 Carrito Actual</h3>
            {!carrito || carrito.items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
                <Link
                  to="/paquetes"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Agregar Paquetes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {carrito.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{item.paquete.nombre}</div>
                        <div className="text-sm text-gray-600">{item.paquete.destino}</div>
                        <div className="text-sm text-gray-600">
                          Cantidad: {item.cantidad}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">
                          ${item.subtotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-xl text-green-600">
                      ${carrito.total.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    to="/carrito"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold text-center block hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Proceder al Pago
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Travel Tips */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Tips de Viaje</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-semibold mb-2">Mantente Conectado</h4>
              <p className="text-sm text-gray-600">
                Descarga mapas offline y mantén tu teléfono cargado durante los viajes.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎒</div>
              <h4 className="font-semibold mb-2">Empaca Inteligente</h4>
              <p className="text-sm text-gray-600">
                Lleva solo lo esencial y verifica el clima del destino antes de viajar.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📸</div>
              <h4 className="font-semibold mb-2">Captura Momentos</h4>
              <p className="text-sm text-gray-600">
                No olvides tu cámara y crea recuerdos inolvidables de tu aventura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 