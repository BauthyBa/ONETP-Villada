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

  const handleAddToCart = async (paqueteId: number) => {
    setLoadingAdd(paqueteId);
    try {
      await axios.post('/api/v1/carritos/items', {
        paquete_id: paqueteId,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 Lista de Paquetes Turísticos</h1>
          <p className="text-gray-600 mt-2">Selecciona los paquetes que deseas agregar a tu carrito</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar paquetes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Destination Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
              <select
                value={selectedDestino}
                onChange={(e) => setSelectedDestino(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {uniqueDestinos.map((destino) => (
                  <option key={destino} value={destino}>
                    {destino}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
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
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredPaquetes.length} paquete(s) encontrado(s)
          </p>
        </div>

        {/* Packages List */}
        {filteredPaquetes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron paquetes</h3>
            <p className="text-gray-600 mb-4">Intenta ajustar tus filtros</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paquete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPaquetes.map((paquete) => (
                  <tr key={paquete.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {paquete.nombre}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {paquete.descripcion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center">
                        <span className="mr-2">{getDestinoIcon(paquete.destino)}</span>
                        <span className="text-sm text-gray-900">{paquete.destino}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paquete.duracion_dias} días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${paquete.precio.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        paquete.cupo_disponible > 5 
                          ? 'bg-green-100 text-green-800' 
                          : paquete.cupo_disponible > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {paquete.cupo_disponible} cupos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAddToCart(paquete.id)}
                        disabled={loadingAdd === paquete.id || paquete.cupo_disponible === 0}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          paquete.cupo_disponible === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : loadingAdd === paquete.id
                            ? 'bg-blue-400 text-white cursor-wait'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {loadingAdd === paquete.id ? 'Agregando...' : 
                         paquete.cupo_disponible === 0 ? 'Sin cupo' : 'Agregar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Paquetes; 