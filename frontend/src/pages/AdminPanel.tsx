import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  destino: string;
  stock: number;
  imagen_url: string;
}

interface Venta {
  id: number;
  usuario: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  fecha: string;
  total: number;
  estado: string;
  metodo_pago: string;
}

const AdminPanel = () => {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'paquetes' | 'ventas'>('paquetes');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paquetesRes, ventasRes] = await Promise.all([
        axios.get('/api/v1/paquetes/'),
        axios.get('/api/v1/ventas/'),
      ]);
      setPaquetes(paquetesRes.data);
      setVentas(ventasRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarVenta = async (ventaId: number) => {
    try {
      await axios.post(`/api/v1/ventas/${ventaId}/confirmar`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al confirmar la venta');
    }
  };

  const handleCancelarVenta = async (ventaId: number) => {
    try {
      await axios.post(`/api/v1/ventas/${ventaId}/cancelar`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al cancelar la venta');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('paquetes')}
              className={`${
                activeTab === 'paquetes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Paquetes
            </button>
            <button
              onClick={() => setActiveTab('ventas')}
              className={`${
                activeTab === 'ventas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Ventas
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'paquetes' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paquetes.map((paquete) => (
                <tr key={paquete.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {paquete.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{paquete.destino}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${paquete.precio}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paquete.stock}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{venta.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {venta.usuario.name} {venta.usuario.surname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {venta.usuario.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(venta.fecha).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${venta.total}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        venta.estado === 'confirmada'
                          ? 'bg-green-100 text-green-800'
                          : venta.estado === 'cancelada'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {venta.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {venta.estado === 'pendiente' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleConfirmarVenta(venta.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleCancelarVenta(venta.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 