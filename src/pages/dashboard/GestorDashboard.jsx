import React, { useState, useMemo } from 'react';
import useFilteredProcesses from '../../hooks/useFilteredProcesses';
import TabelaProcessosRecentes from '../../components/TabelaProcessosRecentes';
import FerramentasComponent from '../../components/FerramentasComponent';
import SettingsComponent from '../settings/Settings';
import PlaceholderComponent from '../../components/PlaceholderComponent';
import Icon from '../../components/Icon';

import { StatCard, ChartWidget } from '../../components/dashboard/DashboardWidgets';

// Cole o DashboardGestorComponent que estava no App.jsx
const DashboardGestorComponent = ({ searchQuery = '', activeTab, user, darkMode, toggleDarkMode, processes, onContactSupport, onEditProcess }) => {
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const filteredProcesses = useFilteredProcesses(searchQuery, processes);

  const stats = useMemo(() => {
    const total = processes.length;
    const aprovados = processes.filter(p => p.status === 'Aprovado').length;
    const emAnalise = processes.filter(p => p.status === 'Em Análise').length;
    const taxaAprovacao = total === 0 ? 0 : (aprovados / total) * 100;

    return {
      total,
      aprovados,
      emAnalise,
      taxaAprovacao: taxaAprovacao.toFixed(1) + '%'
    };
  }, [processes]);

  const handleGenerateSummary = () => {
    setIsSummaryLoading(true);
    setSummaryError('');
    setSummary('');
    setTimeout(() => {
      setSummary(`✅ **Resumo Gerencial**\n\n- Total de processos: ${stats.total}\n- ${stats.taxaAprovacao} aprovados.\n- Processos em análise: ${stats.emAnalise}.\n- **Ação recomendada**: Verificar processos pendentes e em análise para garantir o fluxo.`);
      setIsSummaryLoading(false);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Início':
        return (
          <div className="space-y-8 animate-fade-in">
            {/* ... (JSX do 'Início' do gestor) ... */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Visão Geral do Gestor</h2>
              <button
                onClick={handleGenerateSummary}
                disabled={isSummaryLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:bg-purple-400 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
              >
                <Icon name="sparkles" className="w-4 h-4" />
                {isSummaryLoading ? 'Gerando...' : 'Gerar Resumo Inteligente'}
              </button>
            </div>
            {isSummaryLoading && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[150px]">
                {/* ... (JSX do loading) ... */}
              </div>
            )}
            {summaryError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"><p>{summaryError}</p></div>}
            {summary && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-700">
                {/* ... (JSX do summary) ... */}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total de Processos" value={stats.total} icon="folderKanban" color="text-blue-600" change="+12\%" changeType="increase" />
              <StatCard title="Processos Aprovados" value={stats.aprovados} icon="shieldCheck" color="text-green-600" change="+5\%" changeType="increase" />
              <StatCard title="Em Análise" value={stats.emAnalise} icon="clock" color="text-yellow-600" change="-2\%" changeType="decrease" />
              <StatCard title="Taxa de Aprovação" value={stats.taxaAprovacao} icon="pieChart" color="text-purple-600" change="+8\%" changeType="increase" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartWidget title="Processos por Dia" type="area" />
              <ChartWidget title="Conclusão por Dia" type="bar" />
            </div>

            <TabelaProcessosRecentes
              processes={filteredProcesses}
              onEditProcess={onEditProcess}
              userRole={user.role}
            />
          </div>
        );
      case 'Processos':
        return <TabelaProcessosRecentes
          processes={filteredProcesses}
          onEditProcess={onEditProcess}
          userRole={user.role}
        />;
      case 'Relatórios':
        return <PlaceholderComponent title="Relatórios" />;
      case 'Ferramentas':
        return <FerramentasComponent onContactSupport={onContactSupport} />;
      case 'Configurações':
        return <SettingsComponent user={user} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return <PlaceholderComponent title="Página não encontrada" />;
    }
  };
  return <>{renderContent()}</>;
};

export default DashboardGestorComponent;