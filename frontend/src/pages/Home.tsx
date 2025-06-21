import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Paisaje argentino - Bariloche"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <div className="w-12 h-12 text-blue-300 text-5xl flex items-center justify-center">📍</div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Tour Packages
              </span>
            </h1>

            <div className="mb-6">
              <p className="text-xl md:text-2xl mb-2 text-blue-200 font-semibold">Olimpíada Nacional de ETP 2025</p>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
            </div>

            <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-200">
              Descubre los destinos más increíbles de Argentina con nuestros paquetes turísticos exclusivos.
              <span className="text-blue-300 font-semibold"> Vive experiencias únicas e inolvidables.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    🎒 Comenzar Aventura
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300"
                  >
                    ✨ Iniciar Sesión
                  </Link>
                </>
              ) : (
                <Link
                  to="/paquetes"
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  🏞️ Explorar Paquetes
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div className="text-white/60 text-sm mb-2">Descubre más</div>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Montañas argentinas"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
              <div className="w-8 h-8 text-blue-600 text-3xl flex items-center justify-center">⭐</div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">¿Por qué elegir nuestros paquetes?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos experiencias turísticas completas con la mejor calidad y atención personalizada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 text-blue-600 text-3xl flex items-center justify-center">📍</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Destinos Únicos</h3>
              <p className="text-gray-600 leading-relaxed">
                Desde la majestuosa Patagonia hasta las imponentes Cataratas del Iguazú, descubre los lugares más
                espectaculares de Argentina.
              </p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 text-green-600 text-3xl flex items-center justify-center">🛡️</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Seguridad Total</h3>
              <p className="text-gray-600 leading-relaxed">
                Viaja con tranquilidad. Todos nuestros paquetes incluyen seguros de viaje y asistencia 24/7 durante tu
                estadía.
              </p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 text-purple-600 text-3xl flex items-center justify-center">⭐</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Experiencias Premium</h3>
              <p className="text-gray-600 leading-relaxed">
                Alojamientos de primera calidad, gastronomía local excepcional y actividades exclusivas en cada
                destino.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Paisajes diversos de Argentina"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/85 to-pink-900/90"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Destinos Destacados</h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">Los lugares más hermosos de Argentina te esperan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                name: "Bariloche", 
                description: "Lagos y montañas", 
                image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              },
              { 
                name: "Mendoza", 
                description: "Vinos y cordillera", 
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              },
              { 
                name: "Iguazú", 
                description: "Cataratas majestuosas", 
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              },
              { 
                name: "Buenos Aires", 
                description: "Capital vibrante", 
                image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              },
              { 
                name: "Salta", 
                description: "Norte mágico", 
                image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              },
              { 
                name: "Ushuaia", 
                description: "Fin del mundo", 
                image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              },
            ].map((destination, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-3xl shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-500 bg-white"
              >
                <div className="relative h-64">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-gray-200">{destination.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Aventura en Argentina"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/90 via-purple-600/85 to-indigo-700/90"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              ¿Listo para tu próxima
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                {" "}
                aventura?
              </span>
            </h2>

            <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              No esperes más. Reserva ahora y vive experiencias que recordarás para toda la vida.
            </p>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-full transform hover:scale-110 transition-all duration-300 shadow-2xl inline-block"
              >
                🚀 Empezar Ahora
              </Link>
            ) : (
              <Link
                to="/paquetes"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 px-16 py-8 text-2xl font-bold rounded-full transform hover:scale-110 transition-all duration-300 shadow-2xl inline-block"
              >
                🎯 Ver Todos los Paquetes
              </Link>
            )}

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-2">10+</div>
                <div className="text-gray-200">Destinos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-2">500+</div>
                <div className="text-gray-200">Viajeros felices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-2">24/7</div>
                <div className="text-gray-200">Soporte</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-2">100%</div>
                <div className="text-gray-200">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home; 