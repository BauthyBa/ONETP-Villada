import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';

interface Venta {
  id: number;
  fecha_venta: string;
  total: number | string;
  estado: string;
  metodo_pago: string;
  items: Array<{
    id: number;
    paquete: {
      nombre: string;
      destino: string;
    };
    cantidad: number;
    precio_unitario: number;
    subtotal: number | string;
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
    subtotal: number | string;
  }>;
  total: number | string;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setError(null);
      
      // Fetch ventas with proper error handling
      let ventasData: Venta[] = [];
      try {
        const ventasRes = await axios.get('/api/v1/ventas/');
        // Ensure we get an array, handle different response formats
        ventasData = Array.isArray(ventasRes.data) ? ventasRes.data : 
                    (ventasRes.data?.results || ventasRes.data?.data || []);
        console.log('Ventas response:', ventasRes.data);
      } catch (ventasError) {
        console.error('Error fetching ventas:', ventasError);
        ventasData = [];
      }

      // Fetch carrito with proper error handling
      let carritoData: Carrito | null = null;
      try {
        const carritoRes = await axios.get('/api/v1/carritos/mi_carrito/');
        carritoData = carritoRes.data;
        console.log('Carrito response:', carritoRes.data);
      } catch (carritoError: any) {
        // Don't log 404 errors as they're normal when user has no active cart
        if (carritoError.response?.status !== 404) {
          console.error('Error fetching carrito:', carritoError);
        }
        carritoData = null;
      }

      setVentas(ventasData);
      setCarrito(carritoData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error al cargar los datos del usuario');
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

  // Ensure ventas is always an array before using filter
  const ventasArray = Array.isArray(ventas) ? ventas : [];
  
  const totalGastado = ventasArray
    .filter(v => v.estado === 'confirmada')
    .reduce((sum, v) => sum + parseFloat(v.total.toString()), 0);

  const viajesRealizados = ventasArray.filter(v => v.estado === 'confirmada').length;

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchUserData}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center text-4xl border border-white/20 shadow-2xl">
              🧳
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Mi Dashboard
              </h1>
              <p className="text-xl text-blue-100">
                ¡Bienvenido de vuelta, <span className="font-semibold text-yellow-200">{user?.name}</span>! 🎉
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-300 to-purple-300 mt-4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                  {viajesRealizados}
                </div>
                <div className="text-gray-600 font-medium">Viajes Realizados</div>
                <div className="text-sm text-blue-500 mt-1">¡Sigue explorando! ✈️</div>
              </div>
              <div className="text-5xl group-hover:scale-110 transition-transform">✈️</div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
                  ${totalGastado.toLocaleString()}
                </div>
                <div className="text-gray-600 font-medium">Total Invertido</div>
                <div className="text-sm text-green-500 mt-1">En experiencias únicas 💎</div>
              </div>
              <div className="text-5xl group-hover:scale-110 transition-transform">💰</div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                  {carrito?.items?.length || 0}
                </div>
                <div className="text-gray-600 font-medium">En el Carrito</div>
                <div className="text-sm text-purple-500 mt-1">
                  {carrito?.items?.length ? 'Listos para confirmar 🎯' : 'Agrega paquetes 🛒'}
                </div>
              </div>
              <div className="text-5xl group-hover:scale-110 transition-transform">🛒</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center mb-2">
              <span className="text-4xl mr-3">🚀</span>
              Acciones Rápidas
            </h2>
            <p className="text-gray-600">Navega rápidamente a las secciones más importantes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/paquetes"
              className="group bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏞️</div>
              <div className="font-bold text-lg mb-1">Explorar Paquetes</div>
              <div className="text-blue-100 text-sm">Descubre nuevos destinos</div>
            </Link>

            {carrito && carrito.items && carrito.items.length > 0 && (
              <Link
                to="/carrito"
                className="group bg-gradient-to-br from-green-500 to-blue-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛒</div>
                <div className="font-bold text-lg mb-1">Ver Carrito</div>
                <div className="text-green-100 text-sm">{carrito.items.length} paquete(s)</div>
              </Link>
            )}

            <Link
              to="/ventas"
              className="group bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
              <div className="font-bold text-lg mb-1">Mis Compras</div>
              <div className="text-purple-100 text-sm">Historial completo</div>
            </Link>

            <Link
              to="/perfil"
              className="group bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-2xl hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👤</div>
              <div className="font-bold text-lg mb-1">Mi Perfil</div>
              <div className="text-orange-100 text-sm">Configuración</div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Purchases */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <span className="text-3xl mr-3">📋</span>
                Compras Recientes
              </h3>
              <p className="text-gray-600 text-sm">Tus últimas aventuras reservadas</p>
            </div>
            
            {ventasArray.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">🛍️</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  ¡Tu primera aventura te espera!
                </h4>
                <p className="text-gray-600 mb-6">
                  Aún no has realizado ninguna compra. Descubre destinos increíbles.
                </p>
                <Link
                  to="/paquetes"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  🌟 Explorar Paquetes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {ventasArray.slice(0, 3).map((venta) => (
                  <div key={venta.id} className="group bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                          Compra #{venta.id}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="mr-1">📅</span>
                          {new Date(venta.fecha_venta).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-green-600 mb-2">
                          ${parseFloat(venta.total.toString()).toLocaleString()}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(venta.estado)}`}>
                          {venta.estado === 'confirmada' ? '✅ Confirmada' : 
                           venta.estado === 'pendiente' ? '⏳ Pendiente' : 
                           '❌ Cancelada'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Paquetes incluidos:</div>
                      {venta.items && venta.items.map((item, index) => (
                        <div key={item.id} className="flex items-center text-sm text-gray-600 mb-1">
                          <span className="mr-2">🎒</span>
                          <span className="font-medium">{item.paquete.nombre}</span>
                          <span className="mx-2">•</span>
                          <span>{item.paquete.destino}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {ventasArray.length > 3 && (
                  <div className="text-center pt-4">
                    <Link
                      to="/ventas"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors group"
                    >
                      <span>Ver todas las compras</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Cart */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <span className="text-3xl mr-3">🛒</span>
                Carrito Actual
              </h3>
              <p className="text-gray-600 text-sm">Paquetes listos para confirmar</p>
            </div>
            
            {!carrito || !carrito.items || carrito.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">🛒</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  Tu carrito está vacío
                </h4>
                <p className="text-gray-600 mb-6">
                  Agrega paquetes increíbles y comienza a planear tu próxima aventura.
                </p>
                <Link
                  to="/paquetes"
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  🎯 Agregar Paquetes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {carrito.items.map((item) => (
                  <div key={item.id} className="group bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                          {item.paquete.nombre}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="mr-1">📍</span>
                          {item.paquete.destino}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-green-600 mb-1">
                          ${parseFloat(item.subtotal.toString()).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                          Cantidad: {item.cantidad}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xl font-bold text-gray-800">Total del Carrito:</div>
                    <div className="text-3xl font-bold text-blue-600">
                      ${parseFloat(carrito.total.toString()).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to="/carrito"
                    className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    🚀 Proceder al Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Travel Tips */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
              <span className="text-3xl mr-3">💡</span>
              Tips de Viaje
            </h3>
            <p className="text-gray-600">Consejos útiles para que disfrutes al máximo tus aventuras</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-blue-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📱</div>
              <h4 className="font-bold text-lg mb-3 text-blue-800">Mantente Conectado</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Descarga mapas offline y mantén tu teléfono cargado durante los viajes. La conectividad es clave para una experiencia segura.
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-green-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎒</div>
              <h4 className="font-bold text-lg mb-3 text-green-800">Empaca Inteligente</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                Lleva solo lo esencial y verifica el clima del destino antes de viajar. Menos equipaje, más comodidad.
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-purple-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌟</div>
              <h4 className="font-bold text-lg mb-3 text-purple-800">Vive el Momento</h4>
              <p className="text-sm text-purple-700 leading-relaxed">
                Desconéctate de la rutina y sumérgete completamente en cada experiencia. Los mejores recuerdos se crean así.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard; 