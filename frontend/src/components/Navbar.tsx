import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <span className="text-2xl">🌎</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tour Packages
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  {user?.role === 'admin' ? '👨‍💼 Panel Admin' : '🏠 Dashboard'}
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

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    {user?.role === 'admin' ? '👨‍💼 Panel Admin' : '🏠 Dashboard'}
                  </Link>
                  {user?.role !== 'admin' && (
                    <Link
                      to="/carrito"
                      className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      🛒 Carrito
                    </Link>
                  )}
                  <div className="px-3 py-2 border-t border-gray-200 mt-3">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize mb-3">
                      {user?.role === 'admin' ? '👨‍💼 Administrador' : '🧳 Cliente'}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium text-sm"
                    >
                      🚪 Salir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/register');
                      closeMobileMenu();
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    Registrarse
                  </button>
                  <button
                    onClick={() => {
                      navigate('/login');
                      closeMobileMenu();
                    }}
                    className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium mt-2"
                  >
                    🎒 Iniciar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;