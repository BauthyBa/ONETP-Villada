import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Footer from '../components/Footer';

interface Categoria {
  id: string;
  nombre: string;
}

interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  cupo_maximo: number;
  cupo_disponible: number;
  imagen_url?: string;
  destino?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  is_active: boolean;
  activo: boolean;
  categoria?: Categoria;
}

interface Venta {
  id: number;
  usuario: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  fecha_venta: string;
  total: number | string;
  estado: string;
  metodo_pago: string;
  items: Array<{
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_paquetes: 0,
    total_ventas: 0,
    total_usuarios: 0,
    ingresos_totales: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    imagen_url: '',
    categoria_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paquetesRes, ventasRes, usuariosRes, categoriasRes] = await Promise.all([
        axios.get('/api/v1/paquetes/'),
        axios.get('/api/v1/ventas/'),
        axios.get('/api/v1/usuarios/'),
        axios.get('/api/v1/paquetes/categorias/')
      ]);

      // Handle different response formats - extract results if needed
      const paquetesRaw = Array.isArray(paquetesRes.data) ? paquetesRes.data : 
                          (paquetesRes.data?.results || paquetesRes.data?.data || []);

      console.log('Admin - Paquetes response:', paquetesRes.data);
      console.log('Admin - Ventas response:', ventasRes.data);
      console.log('Admin - Usuarios response:', usuariosRes.data);

      // Map backend keys to frontend expected ones
      const usuariosRaw = Array.isArray(usuariosRes.data) ? usuariosRes.data : 
                          (usuariosRes.data?.results || usuariosRes.data?.data || []);

      const ventasRaw = Array.isArray(ventasRes.data) ? ventasRes.data :
                        (ventasRes.data?.results || ventasRes.data?.data || []);

      const usuariosData: Usuario[] = usuariosRaw.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.nombre || u.name || '',
        surname: u.apellido || u.surname || '',
        phone: u.telefono || u.phone || '',
        address: u.direccion || u.address || '',
        role: u.tipo_usuario || u.role || 'cliente',
        is_active: u.is_active,
        created_at: u.created_at,
      }));

      // Categories
      const categoriasData: Categoria[] = Array.isArray(categoriasRes.data) ? categoriasRes.data : 
                                          (categoriasRes.data?.results || categoriasRes.data?.data || []);
      setCategorias(categoriasData);

      const paquetesData: Paquete[] = paquetesRaw.map((p: any) => ({
        ...p,
        activo: p.is_active ?? p.activo ?? false,
        is_active: p.is_active ?? p.activo ?? false,
      }));

      setPaquetes(paquetesData);
      setVentas(ventasRaw);
      setUsuarios(usuariosData);

      // Calculate stats using the processed data
      const ingresos = ventasRaw
        .filter((v: Venta) => v.estado === 'confirmada')
        .reduce((sum: number, v: Venta) => sum + parseFloat(v.total.toString()), 0);

      setStats({
        total_paquetes: paquetesData.length,
        total_ventas: ventasRaw.length,
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
        nombre: packageForm.nombre,
        descripcion: packageForm.descripcion,
        precio: parseFloat(packageForm.precio),
        duracion_dias: parseInt(packageForm.duracion_dias),
        cupo_maximo: parseInt(packageForm.cupo_maximo),
        destino: packageForm.destino,
        imagen_url: packageForm.imagen_url || '',
        fecha_inicio: packageForm.fecha_inicio,
        fecha_fin: packageForm.fecha_fin,
        categoria_id: packageForm.categoria_id || undefined,
        is_active: true // Default to active for new packages
      };

      if (editingPackage) {
        await axios.put(`/api/v1/paquetes/${editingPackage.id}/`, packageData);
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
        imagen_url: '',
        categoria_id: ''
      });
      fetchData();
    } catch (err: any) {
      console.error('Error saving package:', err);
      alert(err.response?.data?.detail || err.response?.data?.message || 'Error al guardar el paquete');
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
      fecha_inicio: paquete.fecha_inicio ? paquete.fecha_inicio.split('T')[0] : '',
      fecha_fin: paquete.fecha_fin ? paquete.fecha_fin.split('T')[0] : '',
      destino: paquete.destino || '',
      imagen_url: paquete.imagen_url || '',
      categoria_id: paquete.categoria?.id || ''
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

  const handleToggleActive = async (paquete: Paquete) => {
    try {
      // Send complete package data with toggled is_active status
      const updatedPackage = {
        nombre: paquete.nombre,
        descripcion: paquete.descripcion,
        precio: paquete.precio,
        duracion_dias: paquete.duracion_dias,
        cupo_maximo: paquete.cupo_maximo,
        destino: paquete.destino || '',
        imagen_url: paquete.imagen_url || '',
        fecha_inicio: paquete.fecha_inicio || '',
        fecha_fin: paquete.fecha_fin || '',
        categoria_id: paquete.categoria?.id || '',
        is_active: !paquete.is_active
      };
      
      await axios.put(`/api/v1/paquetes/${paquete.id}/`, updatedPackage);
      fetchData();
    } catch (err: any) {
      console.error('Error toggling package status:', err);
      alert(err.response?.data?.detail || 'Error al cambiar el estado');
    }
  };

  const handleConfirmarVenta = async (ventaId: number) => {
    try {
      await axios.post(`/api/v1/ventas/${ventaId}/confirmar_pago_existente/`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al confirmar la venta');
    }
  };

  const handleCancelarVenta = async (ventaId: number) => {
    try {
      await axios.post(`/api/v1/ventas/${ventaId}/cancelar/`);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <div className="text-xl text-gray-600">Cargando panel de administración...</div>
          <div className="text-sm text-gray-500 mt-2">Preparando herramientas de gestión</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchData}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center text-4xl border border-white/20 shadow-2xl">
              👨‍💼
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-xl text-purple-100">
                Bienvenido, <span className="font-semibold text-yellow-200">{user?.name}</span> 👋
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-300 to-pink-300 mt-4 rounded-full mx-auto md:mx-0"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Mobile Menu Button */}
          <div className="md:hidden flex justify-between items-center py-4">
            <h2 className="text-lg font-bold text-gray-800">Navegación</h2>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row md:space-x-2 pb-4 md:pb-0">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'blue' },
                { id: 'paquetes', label: 'Paquetes', icon: '🏞️', color: 'green' },
                { id: 'ventas', label: 'Ventas', icon: '💰', color: 'yellow' },
                { id: 'usuarios', label: 'Usuarios', icon: '👥', color: 'purple' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 py-4 px-6 rounded-t-2xl md:rounded-t-none md:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 mb-2 md:mb-0 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-xl`
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="ml-auto">✨</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                      {stats.total_paquetes}
                    </div>
                    <div className="text-gray-600 font-medium">Paquetes Activos</div>
                    <div className="text-sm text-blue-500 mt-1">Experiencias disponibles 🏞️</div>
                  </div>
                  <div className="text-5xl group-hover:scale-110 transition-transform">🏞️</div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
                      {stats.total_ventas}
                    </div>
                    <div className="text-gray-600 font-medium">Ventas Totales</div>
                    <div className="text-sm text-green-500 mt-1">Transacciones realizadas 💰</div>
                  </div>
                  <div className="text-5xl group-hover:scale-110 transition-transform">💰</div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                      {stats.total_usuarios}
                    </div>
                    <div className="text-gray-600 font-medium">Usuarios Registrados</div>
                    <div className="text-sm text-purple-500 mt-1">Comunidad activa 👥</div>
                  </div>
                  <div className="text-5xl group-hover:scale-110 transition-transform">👥</div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-yellow-600 mb-2 group-hover:scale-110 transition-transform">
                      ${(stats.ingresos_totales || 0).toLocaleString()}
                    </div>
                    <div className="text-gray-600 font-medium">Ingresos Totales</div>
                    <div className="text-sm text-yellow-500 mt-1">Revenue generado 💵</div>
                  </div>
                  <div className="text-5xl group-hover:scale-110 transition-transform">💵</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Sales */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                    <span className="text-3xl mr-3">💰</span>
                    Ventas Recientes
                  </h3>
                  <p className="text-gray-600">Últimas transacciones del sistema</p>
                </div>
                <div className="space-y-4">
                  {ventas.slice(0, 5).map((venta, index) => (
                    <div key={venta.id} className={`group p-4 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                      index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gradient-to-r from-blue-50 to-purple-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                            Venta #{venta.id}
                          </div>
                          <div className="text-gray-600 flex items-center mt-1">
                            <span className="mr-1">👤</span>
                            {venta.usuario.name} {venta.usuario.surname}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-green-600 mb-1">
                            ${parseFloat(venta.total.toString()).toLocaleString()}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(venta.estado)}`}>
                            {venta.estado === 'pendiente' && '⏳ Pendiente'}
                            {venta.estado === 'confirmada' && '✅ Confirmada'}
                            {venta.estado === 'cancelada' && '❌ Cancelada'}
                            {venta.estado === 'entregada' && '🚚 Entregada'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Packages */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                    <span className="text-3xl mr-3">🏞️</span>
                    Paquetes Populares
                  </h3>
                  <p className="text-gray-600">Los destinos más solicitados</p>
                </div>
                <div className="space-y-4">
                  {paquetes.slice(0, 5).map((paquete, index) => (
                    <div key={paquete.id} className={`group p-4 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                      index % 2 === 0 ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                            {paquete.nombre}
                          </div>
                          {paquete.destino && (
                            <div className="text-gray-600 flex items-center mt-1">
                              <span className="mr-1">📍</span>
                              {paquete.destino}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-purple-600 mb-1">
                            ${paquete.precio.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 bg-white/70 px-2 py-1 rounded-full">
                            {paquete.cupo_disponible}/{paquete.cupo_maximo} disponibles
                          </div>
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
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <span className="text-4xl mr-3">🏞️</span>
                  Gestión de Paquetes
                </h2>
                <p className="text-gray-600 mt-1">Administra las experiencias turísticas disponibles</p>
              </div>
              <button
                onClick={() => setShowPackageForm(true)}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-green-500/25 flex items-center space-x-3"
              >
                <span>➕</span>
                <span>Nuevo Paquete</span>
                <span>✨</span>
              </button>
            </div>

            {/* Package Form Modal */}
            {showPackageForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-gray-800 flex items-center justify-center mb-2">
                      <span className="text-4xl mr-3">
                        {editingPackage ? '✏️' : '➕'}
                      </span>
                      {editingPackage ? 'Editar Paquete' : 'Nuevo Paquete'}
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto rounded-full"></div>
                  </div>
                  
                  <form onSubmit={handlePackageSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📝</span>
                        Información Básica
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">🏷️ Nombre del Paquete</label>
                          <input
                            type="text"
                            value={packageForm.nombre}
                            onChange={(e) => setPackageForm({...packageForm, nombre: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            placeholder="Ej: Aventura en Bariloche"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">📍 Destino</label>
                          <input
                            type="text"
                            value={packageForm.destino}
                            onChange={(e) => setPackageForm({...packageForm, destino: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            placeholder="Ej: Bariloche, Argentina"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">📄 Descripción</label>
                        <textarea
                          value={packageForm.descripcion}
                          onChange={(e) => setPackageForm({...packageForm, descripcion: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                          placeholder="Describe la experiencia que ofrece este paquete turístico..."
                          required
                        />
                      </div>
                    </div>

                    {/* Pricing & Capacity */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">💰</span>
                        Precio y Capacidad
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">💵 Precio (ARS)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={packageForm.precio}
                            onChange={(e) => setPackageForm({...packageForm, precio: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            placeholder="150000"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">📅 Duración (días)</label>
                          <input
                            type="number"
                            value={packageForm.duracion_dias}
                            onChange={(e) => setPackageForm({...packageForm, duracion_dias: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            placeholder="7"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">👥 Cupo Máximo</label>
                          <input
                            type="number"
                            value={packageForm.cupo_maximo}
                            onChange={(e) => setPackageForm({...packageForm, cupo_maximo: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            placeholder="20"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dates & Media */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📸</span>
                        Fechas y Multimedia
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">📅 Fecha Inicio</label>
                          <input
                            type="date"
                            value={packageForm.fecha_inicio}
                            onChange={(e) => setPackageForm({...packageForm, fecha_inicio: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">📅 Fecha Fin</label>
                          <input
                            type="date"
                            value={packageForm.fecha_fin}
                            onChange={(e) => setPackageForm({...packageForm, fecha_fin: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">🏷️ Categoría</label>
                          <select
                            value={packageForm.categoria_id}
                            onChange={(e) => setPackageForm({ ...packageForm, categoria_id: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                            required
                          >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">🖼️ URL de Imagen</label>
                        <input
                          type="url"
                          value={packageForm.imagen_url}
                          onChange={(e) => setPackageForm({...packageForm, imagen_url: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4 pt-6 border-t-2 border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPackageForm(false);
                          setEditingPackage(null);
                        }}
                        className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <span>❌</span>
                        <span>Cancelar</span>
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2"
                      >
                        <span>{editingPackage ? '💾' : '✨'}</span>
                        <span>{editingPackage ? 'Actualizar' : 'Crear'} Paquete</span>
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
                          {paquete.destino || '—'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEditPackage(paquete)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeletePackage(paquete.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Eliminar
                          </button>
                          <button
                            onClick={() => handleToggleActive(paquete)}
                            className={`${paquete.activo ? 'text-yellow-600' : 'text-green-600'} hover:underline`}
                          >
                            {paquete.activo ? 'Desactivar' : 'Activar'}
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
                          {new Date(venta.fecha_venta).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${parseFloat(venta.total.toString()).toLocaleString()}
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
      
      <Footer />
    </div>
  );
};

export default AdminDashboard; 