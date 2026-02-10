import React from 'react';
import Icon from './Icon'; // Caminho atualizado

// Cole o FerramentasComponent que estava no App.jsx
const FerramentasComponent = ({ onContactSupport }) => {
  const tools = [
    { name: "Hollides", description: "Analisador de férias para otimizar o planejamento da equipe.", icon: "calendarDays", color: "orange", link: "https://hollides.vercel.app/" },
    { name: "Reader", description: "Leitor de documentos PDF integrado à plataforma.", icon: "fileText", color: "red", link: "https://reader-tau-azure.vercel.app/" },
    { name: "Ticker", description: "Relógio de ponto digital para registro de jornada de trabalho.", icon: "clock", color: "green", link: "https://ticker-ccm.vercel.app/" },
  ];

  const colorClasses = {
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400', button: 'bg-orange-600 hover:bg-orange-700' },
    red: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', button: 'bg-red-600 hover:bg-red-700' },
    green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', button: 'bg-green-600 hover:bg-green-700' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', button: 'bg-blue-600 hover:bg-blue-700' },
  };

  const ToolCard = ({ tool }) => {
    const classes = colorClasses[tool.color] || colorClasses.orange;
    
    if (tool.link) {
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transition-transform transform hover:-translate-y-1">
          <div className={`p-4 rounded-full ${classes.bg} mb-4`}>
            <Icon name={tool.icon} className={`h-8 w-8 ${classes.text}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{tool.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-grow">{tool.description}</p>
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full block mt-auto px-4 py-2 text-sm font-medium text-white ${classes.button} rounded-lg transition`}
          >
            Acessar Ferramenta
          </a>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transition-transform transform hover:-translate-y-1">
        <div className={`p-4 rounded-full ${classes.bg} mb-4`}>
          <Icon name={tool.icon} className={`h-8 w-8 ${classes.text}`} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{tool.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-grow">{tool.description}</p>
        <button
          onClick={tool.action}
          className={`w-full block mt-auto px-4 py-2 text-sm font-medium text-white ${classes.button} rounded-lg transition`}
        >
          Abrir Solicitação
        </button>
      </div>
    );
  };

  const allTools = [
    ...tools,
    { 
      name: "Contatar Suporte", 
      description: "Precisa de ajuda? Abra um ticket para nossa equipe de suporte.", 
      icon: "helpCircle", 
      color: "blue", 
      action: onContactSupport
    }
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Central de Ferramentas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
      </div>
    </div>
  );
};

export default FerramentasComponent;