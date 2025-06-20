import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

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
  detalles: Array<{
    id: number;
    paquete: {
      nombre: string;
    };
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
}

interface Usuario {
  id: number;
  email: string;
  name: string;
  surname: string;
  phone: string;
  address: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  total_paquetes: number;
  total_ventas: number;
  total_usuarios: number;
  ingresos_totales: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'paquetes' | 'ventas' | 'usuarios'>('dashboard');
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_paquetes: 0,
    total_ventas: 0,
    total_usuarios: 0,
    ingresos_totales: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for creating/editing packages
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Paquete | null>(null);
  const [packageForm, setPackageForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_dias: '',
    cupo_maximo: '',
    fecha_inicio: '',
    fecha_fin: '',
    destino: '',
    imagen_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paquetesRes, ventasRes, usuariosRes] = await Promise.all([
        axios.get('/api/v1/paquetes/'),
        axios.get('/api/v1/ventas/'),
        axios.get('/api/v1/usuarios/')
      ]);

      // Handle different response formats - extract results if needed
      const paquetesData = Array.isArray(paquetesRes.data) ? paquetesRes.data : 
                          (paquetesRes.data?.results || paquetesRes.data?.data || []);
      const ventasData = Array.isArray(ventasRes.data) ? ventasRes.data : 
                        (ventasRes.data?.results || ventasRes.data?.data || []);
      const usuariosData = Array.isArray(usuariosRes.data) ? usuariosRes.data : 
                          (usuariosRes.data?.results || usuariosRes.data?.data || []);

      console.log('Admin - Paquetes response:', paquetesRes.data);
      console.log('Admin - Ventas response:', ventasRes.data);
      console.log('Admin - Usuarios response:', usuariosRes.data);

      setPaquetes(paquetesData);
      setVentas(ventasData);
      setUsuarios(usuariosData);

      // Calculate stats using the processed data
      const ingresos = ventasData
        .filter((v: Venta) => v.estado === 'confirmada')
        .reduce((sum: number, v: Venta) => sum + v.total, 0);

      setStats({
        total_paquetes: paquetesData.length,
        total_ventas: ventasData.length,
        total_usuarios: usuariosData.length,
        ingresos_totales: ingresos
      });
    } catch (err: any) {
      setError('Error al cargar los datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const packageData = {
        ...packageForm,
        precio: parseFloat(packageForm.precio),
        duracion_dias: parseInt(packageForm.duracion_dias),
        cupo_maximo: parseInt(packageForm.cupo_maximo),
        fecha_inicio: packageForm.fecha_inicio,
        fecha_fin: packageForm.fecha_fin
      };

      if (editingPackage) {
        await axios.put(`/api/v1/paquetes/${editingPackage.id}`, packageData);
      } else {
        await axios.post('/api/v1/paquetes/', packageData);
      }

      setShowPackageForm(false);
      setEditingPackage(null);
      setPackageForm({
        nombre: '',
        descripcion: '',
        precio: '',
        duracion_dias: '',
        cupo_maximo: '',
        fecha_inicio: '',
        fecha_fin: '',
        destino: '',
        imagen_url: ''
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al guardar el paquete');
    }
  };

  const handleEditPackage = (paquete: Paquete) => {
    setEditingPackage(paquete);
    setPackageForm({
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: paquete.precio.toString(),
      duracion_dias: paquete.duracion_dias.toString(),
      cupo_maximo: paquete.cupo_maximo.toString(),
      fecha_inicio: paquete.fecha_inicio.split('T')[0],
      fecha_fin: paquete.fecha_fin.split('T')[0],
      destino: paquete.destino,
      imagen_url: paquete.imagen_url
    });
    setShowPackageForm(true);
  };

  const handleDeletePackage = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paquete?')) {
      try {
        await axios.delete(`/api/v1/paquetes/${id}`);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Error al eliminar el paquete');
      }
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Cargando panel de administración...</div>
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl">
              👨‍💼
            </div>
            <div>
              <h1 className="text-4xl font-bold">Panel de Administración</h1>
              <p className="text-xl opacity-90">Bienvenido, {user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'paquetes', label: '🏞️ Paquetes', icon: '🏞️' },
              { id: 'ventas', label: '💰 Ventas', icon: '💰' },
              { id: 'usuarios', label: '👥 Usuarios', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-6 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">🏞️</div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{stats.total_paquetes}</div>
                    <div className="text-gray-600">Paquetes Activos</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">💰</div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{stats.total_ventas}</div>
                    <div className="text-gray-600">Ventas Totales</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">👥</div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{stats.total_usuarios}</div>
                    <div className="text-gray-600">Usuarios Registrados</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">💵</div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">
                      ${stats.ingresos_totales.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Ingresos Totales</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Sales */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">💰 Ventas Recientes</h3>
                <div className="space-y-4">
                  {ventas.slice(0, 5).map((venta) => (
                    <div key={venta.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Venta #{venta.id}</div>
                        <div className="text-sm text-gray-600">{venta.usuario.name} {venta.usuario.surname}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${venta.total.toLocaleString()}</div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(venta.estado)}`}>
                          {venta.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Packages */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">🏞️ Paquetes Populares</h3>
                <div className="space-y-4">
                  {paquetes.slice(0, 5).map((paquete) => (
                    <div key={paquete.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{paquete.nombre}</div>
                        <div className="text-sm text-gray-600">{paquete.destino}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">${paquete.precio.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">
                          {paquete.cupo_disponible}/{paquete.cupo_maximo} disponibles
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'paquetes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">🏞️ Gestión de Paquetes</h2>
              <button
                onClick={() => setShowPackageForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                ➕ Nuevo Paquete
              </button>
            </div>

            {/* Package Form Modal */}
            {showPackageForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                  <h3 className="text-2xl font-bold mb-6">
                    {editingPackage ? '✏️ Editar Paquete' : '➕ Nuevo Paquete'}
                  </h3>
                  <form onSubmit={handlePackageSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                        <input
                          type="text"
                          value={packageForm.nombre}
                          onChange={(e) => setPackageForm({...packageForm, nombre: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                        <input
                          type="text"
                          value={packageForm.destino}
                          onChange={(e) => setPackageForm({...packageForm, destino: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                        <input
                          type="number"
                          step="0.01"
                          value={packageForm.precio}
                          onChange={(e) => setPackageForm({...packageForm, precio: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duración (días)</label>
                        <input
                          type="number"
                          value={packageForm.duracion_dias}
                          onChange={(e) => setPackageForm({...packageForm, duracion_dias: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cupo Máximo</label>
                        <input
                          type="number"
                          value={packageForm.cupo_maximo}
                          onChange={(e) => setPackageForm({...packageForm, cupo_maximo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                        <input
                          type="url"
                          value={packageForm.imagen_url}
                          onChange={(e) => setPackageForm({...packageForm, imagen_url: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                        <input
                          type="date"
                          value={packageForm.fecha_inicio}
                          onChange={(e) => setPackageForm({...packageForm, fecha_inicio: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                        <input
                          type="date"
                          value={packageForm.fecha_fin}
                          onChange={(e) => setPackageForm({...packageForm, fecha_fin: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={packageForm.descripcion}
                        onChange={(e) => setPackageForm({...packageForm, descripcion: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPackageForm(false);
                          setEditingPackage(null);
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {editingPackage ? 'Actualizar' : 'Crear'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Packages List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
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
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disponibilidad
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
                    {paquetes.map((paquete) => (
                      <tr key={paquete.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                {paquete.nombre.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{paquete.nombre}</div>
                              <div className="text-sm text-gray-500">{paquete.duracion_dias} días</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {paquete.destino}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${paquete.precio.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {paquete.cupo_disponible}/{paquete.cupo_maximo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            paquete.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {paquete.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditPackage(paquete)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeletePackage(paquete.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'ventas' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">💰 Gestión de Ventas</h2>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Venta
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
                      <tr key={venta.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Venta #{venta.id}</div>
                          <div className="text-sm text-gray-500">{venta.metodo_pago}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {venta.usuario.name} {venta.usuario.surname}
                          </div>
                          <div className="text-sm text-gray-500">{venta.usuario.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(venta.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${venta.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(venta.estado)}`}>
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
                                ✅ Confirmar
                              </button>
                              <button
                                onClick={() => handleCancelarVenta(venta.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                ❌ Cancelar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">👥 Gestión de Usuarios</h2>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                {usuario.name.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {usuario.name} {usuario.surname}
                              </div>
                              <div className="text-sm text-gray-500">{usuario.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usuario.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.role === 'jefe_ventas' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {usuario.role === 'jefe_ventas' ? '👨‍💼 Admin' : '🧳 Cliente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {usuario.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(usuario.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 