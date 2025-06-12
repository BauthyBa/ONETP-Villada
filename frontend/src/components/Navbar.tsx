import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🌎</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tour Packages
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  {user?.role === 'admin' ? '👨‍💼 Panel Admin' : '🏠 Dashboard'}
                </Link>
                <Link
                  to="/paquetes"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  🏞️ Paquetes
                </Link>
                {user?.role !== 'admin' && (
                  <Link
                    to="/carrito"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    🛒 Carrito
                  </Link>
                )}
                <div className="flex items-center space-x-3 border-l pl-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role === 'admin' ? '👨‍💼 Administrador' : '🧳 Cliente'}
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium text-sm"
                  >
                    🚪 Salir
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/register')}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  Registrarse
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
                >
                  🎒 Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;