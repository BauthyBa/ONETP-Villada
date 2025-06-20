import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Tour Packages</h3>
          <p className="text-gray-400 text-sm mb-4">
            Olimpíada Nacional de ETP 2025 - Sistema de Gestión de Paquetes Turísticos
          </p>
          <div className="flex justify-center space-x-4 text-2xl">
            <span>🌎</span>
            <span>✈️</span>
            <span>🏨</span>
            <span>🎒</span>
            <span>📸</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 