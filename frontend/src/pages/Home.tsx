import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              🌎 Tour Packages
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90">
              Olimpíada Nacional de ETP 2025
            </p>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-80">
              Descubre los destinos más increíbles de Argentina con nuestros paquetes turísticos exclusivos. 
              Vive experiencias únicas e inolvidables.
            </p>
            
            {!isAuthenticated ? (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  🎒 Comenzar Aventura
                </Link>
                <Link
                  to="/login"
                  className="inline-block border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
                >
                  Iniciar Sesión
                </Link>
              </div>
            ) : (
              <Link
                to="/paquetes"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                🏞️ Explorar Paquetes
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              ¿Por qué elegir nuestros paquetes?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos experiencias turísticas completas con la mejor calidad y atención personalizada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl mb-4">🏔️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Destinos Únicos</h3>
              <p className="text-gray-600">
                Desde la majestuosa Patagonia hasta las imponentes Cataratas del Iguazú, 
                descubre los lugares más espectaculares de Argentina.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Seguridad Total</h3>
              <p className="text-gray-600">
                Viaja con tranquilidad. Todos nuestros paquetes incluyen seguros de viaje 
                y asistencia 24/7 durante tu estadía.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Experiencias Premium</h3>
              <p className="text-gray-600">
                Alojamientos de primera calidad, gastronomía local excepcional 
                y actividades exclusivas en cada destino.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Preview */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Destinos Destacados
            </h2>
            <p className="text-xl text-gray-600">
              Los lugares más hermosos de Argentina te esperan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative overflow-hidden rounded-2xl shadow-lg group">
              <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">🏔️</div>
                  <h3 className="text-2xl font-bold">Bariloche</h3>
                  <p className="opacity-90">Lagos y montañas</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>

            <div className="relative overflow-hidden rounded-2xl shadow-lg group">
              <div className="h-64 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">🍷</div>
                  <h3 className="text-2xl font-bold">Mendoza</h3>
                  <p className="opacity-90">Vinos y cordillera</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>

            <div className="relative overflow-hidden rounded-2xl shadow-lg group">
              <div className="h-64 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">💧</div>
                  <h3 className="text-2xl font-bold">Iguazú</h3>
                  <p className="opacity-90">Cataratas majestuosas</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            No esperes más. Reserva ahora y vive experiencias que recordarás para toda la vida.
          </p>
          
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🚀 Empezar Ahora
            </Link>
          ) : (
            <Link
              to="/paquetes"
              className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🎯 Ver Todos los Paquetes
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Tour Packages</h3>
            <p className="text-gray-400 mb-4">
              Olimpíada Nacional de ETP 2025 - Sistema de Gestión de Paquetes Turísticos
            </p>
            <div className="flex justify-center space-x-6 text-3xl">
              <span>🌎</span>
              <span>✈️</span>
              <span>🏨</span>
              <span>🎒</span>
              <span>📸</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 