import React from 'react';
import Icon from './Icon';
import DataTable from './ui/DataTable';
import StatusBadge from './ui/StatusBadge';

const TabelaProcessosRecentes = ({ processes, onEditProcess, userRole }) => {
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'font-mono text-blue-600 dark:text-blue-400 font-medium',
      render: (row) => row.id.substring(0, 8) + '...'
    },
    { header: 'Solicitante', accessor: 'solicitante' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { header: 'Data', accessor: 'dataSubmissao' },
    { header: 'Setor', accessor: 'sector' },
  ];

  if (userRole === 'Gestor' || userRole === 'Analista') {
    columns.push({
      header: 'Ações',
      className: 'text-right',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); onEditProcess(row); }}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 ml-auto"
        >
          <Icon name="edit" className="w-4 h-4" />
          Alterar
        </button>
      )
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Consulta de Processos</h2>
      </div>

      <DataTable
        data={processes}
        columns={columns}
        isLoading={!processes}
        emptyMessage="Nenhum processo encontrado."
      />
    </div>
  );
};

export default TabelaProcessosRecentes;