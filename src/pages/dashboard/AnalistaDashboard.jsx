import React from 'react';
import useFilteredProcesses from '../../hooks/useFilteredProcesses'; // Caminho atualizado
import TabelaProcessosRecentes from '../../components/TabelaProcessosRecentes';
import FerramentasComponent from '../../components/FerramentasComponent';
import SettingsComponent from '../settings/Settings';
import Icon from '../../components/Icon';
import { StatCard, ChartWidget } from '../../components/dashboard/DashboardWidgets';

// Cole o AnalystHomeComponent que estava no App.jsx
const AnalystHomeComponent = () => {
  const faqs = [
    { q: "Como registro um novo processo?", a: "Vá para a aba 'Meus Processos' e clique no botão 'Registrar Novo Processo'. Preencha todos os campos e salve." },
    { q: "Como altero o status de um processo?", a: "Vá para 'Meus Processos', encontre o processo na lista e clique em 'Alterar'. Você poderá modificar o status no modal que se abrirá." },
    { q: "Onde vejo as ferramentas?", a: "Clique na aba 'Ferramentas' no menu lateral para acessar o Hollides, Reader, Ticker e o contato de suporte." },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao SITEC Central</h1>
          <p className="text-indigo-100 text-lg">Seu hub de produtividade e gestão unificada.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Meus Processos" value="12" icon="folder" color="text-blue-600" change="+2" changeType="increase" />
        <StatCard title="Pendentes" value="5" icon="clock" color="text-yellow-600" change="-1" changeType="decrease" />
        <StatCard title="Concluídos" value="45" icon="checkCircle" color="text-green-600" change="+8" changeType="increase" />
        <StatCard title="Produtividade" value="98%" icon="activity" color="text-purple-600" change="+1%" changeType="increase" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartWidget title="Minha Produção" type="area" />
        <ChartWidget title="Status dos Processos" type="bar" />
      </div>
    </div>
  );
};

// Cole o DashboardAnalistaComponent que estava no App.jsx
const DashboardAnalistaComponent = ({ searchQuery = '', activeTab, user, darkMode, toggleDarkMode, processes, onContactSupport, onEditProcess }) => {
  const filteredProcesses = useFilteredProcesses(searchQuery, processes);

  const renderContent = () => {
    switch (activeTab) {
      case 'Início':
        return <AnalystHomeComponent />;
      case 'Meus Processos':
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => onEditProcess(null)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                <Icon name="plus" className="w-5 h-5" />
                Registrar Novo Processo
              </button>
            </div>
            <TabelaProcessosRecentes
              processes={filteredProcesses}
              onEditProcess={onEditProcess}
              userRole={user.role}
            />
          </div>
        );
      case 'Ferramentas':
        return <FerramentasComponent onContactSupport={onContactSupport} />;
      case 'Configurações':
        return <SettingsComponent user={user} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return <AnalystHomeComponent />;
    }
  };
  return <>{renderContent()}</>;
};

export default DashboardAnalistaComponent;