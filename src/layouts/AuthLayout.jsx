import React from 'react';
import Icon from '../components/Icon';

// Recebe as novas props: darkMode e toggleDarkMode
const AuthLayout = ({ title, description, icon, iconColor, children, darkMode, toggleDarkMode }) => (
  // Remove background color to allow global aurora background to show
  <div className="relative flex items-center justify-center min-h-screen p-4 transition-colors duration-300 overflow-hidden">

    {/* --- BOTÃO DE ALTERNAR TEMA (Topo Direito) --- */}
    <div className="absolute top-6 right-6 z-20">
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full glass text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/20 shadow-sm ring-1 ring-gray-900/5 transition-all"
        title={darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
      >
        <Icon name={darkMode ? 'sun' : 'moon'} className="w-6 h-6" />
      </button>
    </div>

    {/* --- NOVA MARCA D'ÁGUA (Usando Background Image) --- */}
    <div
      className="absolute inset-0 z-0 pointer-events-none bg-center bg-no-repeat bg-contain opacity-[0.03] dark:opacity-[0.05] grayscale transform scale-125 transition-opacity duration-300"
      style={{ backgroundImage: "url('/SITECicone.png')" }}
    ></div>


    {/* --- CARD DE LOGIN (Fica na frente, z-10) --- */}
    {/* Substituindo bg-white/95 e shadow-2xl por glass-card para consistência */}
    <div className="relative z-10 glass-card p-8 w-full max-w-md">
      <div className="flex flex-col items-center mb-6">
        <div className={`p-3 rounded-full ${iconColor} bg-opacity-20 backdrop-blur-sm mb-4`}>
          <Icon name={icon} className={`w-10 h-10 ${iconColor.replace('bg-', 'text-')}`} />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white tracking-tight">{title}</h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">{description}</p>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
