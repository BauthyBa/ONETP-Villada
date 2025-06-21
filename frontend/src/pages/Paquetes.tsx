import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import Footer from '../components/Footer';

interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  cupo_maximo: number;
  cupo_disponible: number;
  fecha_inicio: string;
  fecha_fin: string;
  destino: string;
  imagen_url: string;
  activo: boolean;
  is_active: boolean;
}

const Paquetes = () => {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDestino, setSelectedDestino] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingAdd, setLoadingAdd] = useState<number | null>(null);
  const { showSuccess, showError } = useNotification();

  // Add isLoading state for consistency
  const isLoading = loadingAdd !== null;

  useEffect(() => {
    fetchPaquetes();
  }, []);

  const fetchPaquetes = async () => {
    try {
      setError('');
      const response = await axios.get('/api/v1/paquetes/');
      
      // Ensure we get an array, handle different response formats
      const paquetesData = Array.isArray(response.data) ? response.data : 
                          (response.data?.results || response.data?.data || []);
      
      console.log('Paquetes response:', response.data);
      setPaquetes(paquetesData);
    } catch (err: any) {
      console.error('Error fetching paquetes:', err);
      setError('Error al cargar los paquetes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (paquete: Paquete) => {
    setLoadingAdd(paquete.id);
    try {
      await axios.post('/api/v1/carritos/agregar_item/', {
        paquete_id: paquete.id,
        cantidad: 1,
      });
      showSuccess('¡Paquete agregado al carrito exitosamente! 🛒');
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      showError(err.response?.data?.detail || 'Error al agregar al carrito');
    } finally {
      setLoadingAdd(null);
    }
  };

  // Ensure paquetes is always an array before using map
  const paquetesArray = Array.isArray(paquetes) ? paquetes : [];
  const uniqueDestinos = Array.from(new Set(paquetesArray.map((p) => p.destino)));

  const filteredPaquetes = paquetesArray.filter((paquete) => {
    const matchesDestino = !selectedDestino || paquete.destino === selectedDestino;
    const matchesSearch = !searchTerm || 
      paquete.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paquete.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paquete.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPrice = true;
    if (priceRange) {
      switch (priceRange) {
        case 'low':
          matchesPrice = paquete.precio < 80000;
          break;
        case 'medium':
          matchesPrice = paquete.precio >= 80000 && paquete.precio <= 120000;
          break;
        case 'high':
          matchesPrice = paquete.precio > 120000;
          break;
      }
    }

    // Check both activo and is_active fields for compatibility
    const isActive = paquete.activo ?? paquete.is_active ?? true;
    return matchesDestino && matchesSearch && matchesPrice && isActive;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-lg text-gray-600">Cargando paquetes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchPaquetes}
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
        
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-5xl md:text-6xl mb-4 animate-bounce">🏞️</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Paquetes Turísticos
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Descubre experiencias únicas en los destinos más hermosos de Argentina
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-300 to-purple-300 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 backdrop-blur-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🔍</span>
              Filtros de búsqueda
            </h2>
            <p className="text-gray-600 text-sm">Encuentra el paquete perfecto para ti</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔎 Buscar</label>
              <input
                type="text"
                placeholder="Buscar paquetes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
              />
            </div>

            {/* Destination Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🗺️ Destino</label>
              <select
                value={selectedDestino}
                onChange={(e) => setSelectedDestino(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
              >
                <option value="">Todos los destinos</option>
                {uniqueDestinos.map((destino) => (
                  <option key={destino} value={destino}>
                    {destino}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Precio</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
              >
                <option value="">Todos los precios</option>
                <option value="low">Hasta $80,000</option>
                <option value="medium">$80,000 - $120,000</option>
                <option value="high">Más de $120,000</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedDestino('');
                  setPriceRange('');
                  setSearchTerm('');
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
              >
                🗑️ Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <p className="text-gray-700 font-medium flex items-center">
              <span className="text-xl mr-2">📊</span>
              <span className="text-blue-600 font-bold">{filteredPaquetes.length}</span>
              <span className="ml-1">paquete(s) encontrado(s)</span>
            </p>
          </div>
        </div>

        {/* Packages List */}
        {filteredPaquetes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron paquetes</h3>
            <p className="text-gray-600 mb-4">Intenta ajustar tus filtros</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="lg:hidden space-y-6">
              {filteredPaquetes.map((paquete) => (
                <div key={paquete.id} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-500 border border-gray-100 overflow-hidden">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white relative">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                        {paquete.nombre}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                          🗺️ {paquete.destino}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                          📅 {paquete.duracion_dias} días
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {paquete.descripcion}
                    </p>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Precio por persona</span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">
                            ${parseFloat(paquete.precio.toString()).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">IVA incluido</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(paquete)}
                      disabled={isLoading || paquete.cupo_disponible === 0}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-2"
                    >
                      <span className="text-xl">🛒</span>
                      <span>{isLoading ? 'Agregando...' : 'Agregar al carrito'}</span>
                      <span className="text-xl">✨</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <div className="grid grid-cols-6 gap-4 p-6 font-bold text-lg">
                    <div className="flex items-center">
                      <span className="mr-2">📦</span>Paquete
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🗺️</span>Destino
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>Duración
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">💰</span>Precio
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📝</span>Descripción
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="mr-2">⚡</span>Acción
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {filteredPaquetes.map((paquete, index) => (
                    <div 
                      key={paquete.id} 
                      className={`grid grid-cols-6 gap-4 p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group ${
                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {paquete.nombre}
                      </div>
                      <div className="text-gray-600 flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {paquete.destino}
                        </span>
                      </div>
                      <div className="text-gray-600 flex items-center">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {paquete.duracion_dias} días
                        </span>
                      </div>
                      <div className="font-bold text-green-600 text-lg">
                        ${parseFloat(paquete.precio.toString()).toLocaleString()}
                      </div>
                      <div className="text-gray-600 text-sm leading-relaxed max-w-xs">
                        {paquete.descripcion.length > 100 
                          ? `${paquete.descripcion.substring(0, 100)}...` 
                          : paquete.descripcion
                        }
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleAddToCart(paquete)}
                          disabled={isLoading || paquete.cupo_disponible === 0}
                          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center space-x-2"
                        >
                          <span>🛒</span>
                          <span className="hidden xl:inline">{isLoading ? 'Agregando...' : 'Agregar'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Paquetes; 