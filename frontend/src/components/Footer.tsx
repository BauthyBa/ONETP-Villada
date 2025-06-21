import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white py-12 w-full mt-auto relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-4 right-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 px-8">
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🌟 Tour Packages
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-300 text-lg font-medium mb-2">
              Olimpíada Nacional de ETP 2025
            </p>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Sistema de Gestión de Paquetes Turísticos - Descubre experiencias únicas y crea recuerdos inolvidables
            </p>
          </div>
          
          <div className="flex justify-center items-center space-x-6 text-4xl mb-8">
            <div className="group cursor-pointer transform hover:scale-110 transition-all duration-300">
              <span className="drop-shadow-lg group-hover:drop-shadow-2xl">🌎</span>
            </div>
            <div className="group cursor-pointer transform hover:scale-110 transition-all duration-300">
              <span className="drop-shadow-lg group-hover:drop-shadow-2xl">✈️</span>
            </div>
            <div className="group cursor-pointer transform hover:scale-110 transition-all duration-300">
              <span className="drop-shadow-lg group-hover:drop-shadow-2xl">🏨</span>
            </div>
            <div className="group cursor-pointer transform hover:scale-110 transition-all duration-300">
              <span className="drop-shadow-lg group-hover:drop-shadow-2xl">🎒</span>
            </div>
            <div className="group cursor-pointer transform hover:scale-110 transition-all duration-300">
              <span className="drop-shadow-lg group-hover:drop-shadow-2xl">📸</span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2025 Tour Packages. Todos los derechos reservados.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <button className="hover:text-blue-400 transition-colors duration-300 flex items-center space-x-1">
                  <span>📞</span>
                  <span>Contacto</span>
                </button>
                <button className="hover:text-purple-400 transition-colors duration-300 flex items-center space-x-1">
                  <span>ℹ️</span>
                  <span>Acerca de</span>
                </button>
                <button className="hover:text-green-400 transition-colors duration-300 flex items-center space-x-1">
                  <span>🛡️</span>
                  <span>Privacidad</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 