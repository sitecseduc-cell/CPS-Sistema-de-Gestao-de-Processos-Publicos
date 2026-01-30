import React from 'react';
import Icon from './Icon'; // Caminho atualizado

// Cole a função getStatusClass que estava no App.jsx
const getStatusClass = (status) => {
  const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (status) {
    case 'Aprovado': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100`;
    case 'Pendente': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100`;
    case 'Em Análise': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100`;
    case 'Rejeitado': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100`;
    default: return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100`;
  }
};

// Cole o componente TabelaProcessosRecentes que estava no App.jsx
const TabelaProcessosRecentes = ({ processes, onEditProcess, userRole }) => {
  const headerItems = ["ID", "Solicitante", "Status", "Data", "Setor"];
  
  if (userRole === 'Gestor' || userRole === 'Analista') {
    headerItems.push("Ações");
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Consulta de Processos</h2>
      </div>
      
      {(!processes || processes.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Nenhum processo encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {headerItems.map(item => (
                  <th key={item} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {processes.map((process) => (
                <tr key={process.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">{process.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{process.solicitante}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusClass(process.status)}>{process.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{process.dataSubmissao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{process.sector}</td>
                  
                  {(userRole === 'Gestor' || userRole === 'Analista') && (
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <button 
                         onClick={() => onEditProcess(process)}
                         className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                       >
                         <Icon name="edit" className="w-4 h-4" />
                         Alterar
                       </button>
                     </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TabelaProcessosRecentes;