import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface DetalleVenta {
  id: number;
  paquete: {
    id: number;
    nombre: string;
    precio: number;
    imagen_url: string;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Venta {
  id: number;
  fecha: string;
  total: number;
  estado: string;
  metodo_pago: string;
  detalles: DetalleVenta[];
}

const Ventas = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await axios.get('/api/v1/ventas/');
      setVentas(response.data);
    } catch (err) {
      setError('Error al cargar las ventas');
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

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {user?.role === 'jefe_ventas' ? 'Todas las Ventas' : 'Mis Compras'}
      </h1>

      {ventas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay ventas para mostrar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ventas.map((venta) => (
            <div
              key={venta.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Venta #{venta.id}
                    </h3>
                    <p className="text-gray-600">
                      {new Date(venta.fecha).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(
                        venta.estado
                      )}`}
                    >
                      {venta.estado}
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ${venta.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-semibold mb-4">Detalles de la compra</h4>
                <div className="space-y-4">
                  {venta.detalles.map((detalle) => (
                    <div
                      key={detalle.id}
                      className="flex items-center space-x-4"
                    >
                      <img
                        src={detalle.paquete.imagen_url}
                        alt={detalle.paquete.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium">
                          {detalle.paquete.nombre}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Cantidad: {detalle.cantidad} x $
                          {detalle.precio_unitario}
                        </p>
                      </div>
                      <span className="font-semibold">
                        ${detalle.subtotal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ventas; 