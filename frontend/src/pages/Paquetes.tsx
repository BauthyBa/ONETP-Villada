import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

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
}

const Paquetes = () => {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDestino, setSelectedDestino] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchPaquetes();
  }, []);

  const fetchPaquetes = async () => {
    try {
      const response = await axios.get('/api/v1/paquetes/');
      setPaquetes(response.data);
    } catch (err) {
      setError('Error al cargar los paquetes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (paqueteId: number) => {
    try {
      await axios.post('/api/v1/carritos/items', {
        paquete_id: paqueteId,
        cantidad: 1,
      });
      showSuccess('¡Paquete agregado al carrito exitosamente! 🛒');
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Error al agregar al carrito');
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

  const uniqueDestinos = Array.from(new Set(paquetes.map((p) => p.destino)));

  const filteredPaquetes = paquetes.filter((paquete) => {
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

    return matchesDestino && matchesSearch && matchesPrice && paquete.activo;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <div className="text-xl text-gray-600">Cargando paquetes increíbles...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">🏞️ Paquetes Turísticos</h1>
          <p className="text-xl opacity-90">Descubre los destinos más increíbles de Argentina</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🔍 Encuentra tu aventura perfecta</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar paquetes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Destination Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
              <select
                value={selectedDestino}
                onChange={(e) => setSelectedDestino(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los destinos</option>
                {uniqueDestinos.map((destino) => (
                  <option key={destino} value={destino}>
                    {getDestinoIcon(destino)} {destino}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precio</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los precios</option>
                <option value="low">💰 Hasta $80,000</option>
                <option value="medium">💰💰 $80,000 - $120,000</option>
                <option value="high">💰💰💰 Más de $120,000</option>
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
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                🗑️ Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredPaquetes.length} de {paquetes.length} paquetes disponibles
          </p>
        </div>

        {/* Packages Grid */}
        {filteredPaquetes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron paquetes</h3>
            <p className="text-gray-600 mb-6">Intenta ajustar tus filtros para ver más opciones</p>
            <button
              onClick={() => {
                setSelectedDestino('');
                setPriceRange('');
                setSearchTerm('');
              }}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Ver todos los paquetes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPaquetes.map((paquete) => (
              <div
                key={paquete.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Package Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                  {paquete.imagen_url ? (
                    <img
                      src={paquete.imagen_url}
                      alt={paquete.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white">
                      {getDestinoIcon(paquete.destino)}
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {paquete.duracion_dias} días
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {paquete.cupo_disponible} disponibles
                    </span>
                  </div>
                </div>

                {/* Package Content */}
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">{getDestinoIcon(paquete.destino)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{paquete.nombre}</h3>
                      <p className="text-gray-600">{paquete.destino}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{paquete.descripcion}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-4">📅 {new Date(paquete.fecha_inicio).toLocaleDateString()}</span>
                      <span>👥 {paquete.cupo_maximo} personas</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        ${paquete.precio.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">por persona</div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(paquete.id)}
                      disabled={paquete.cupo_disponible === 0}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        paquete.cupo_disponible === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {paquete.cupo_disponible === 0 ? (
                        <>🚫 Sin stock</>
                      ) : (
                        <>🛒 Agregar</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Paquetes; 