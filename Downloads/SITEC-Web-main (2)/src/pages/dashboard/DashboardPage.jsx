import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useProcesses from '../../hooks/useProcesses';

// Layouts e Modais
import DashboardLayout from '../../layouts/DashboardLayout';
import ProcessModal from '../../components/ProcessModal';
import SupportModal from '../../components/SupportModal';

// Páginas de Conteúdo
import DashboardGestorComponent from './GestorDashboard';
import DashboardAnalistaComponent from './AnalistaDashboard';
import DashboardSuporteComponent from './SuporteDashboard';
import TabelaProcessosRecentes from '../../components/TabelaProcessosRecentes';
import FerramentasComponent from '../../components/FerramentasComponent';
import SettingsComponent from '../settings/Settings';
import PlaceholderComponent from '../../components/PlaceholderComponent';
import AboutSeduc from './AboutSeduc'; // Certifique-se que este arquivo existe
import KanbanBoard from '../../components/KanbanBoard';
import Icon from '../../components/Icon';

const ProcessosRoute = ({ user, processes, handleEditProcess }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciamento de Processos</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title="Lista"
            >
              <Icon name="list" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-all ${viewMode === 'kanban'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title="Kanban"
            >
              <Icon name="grid" className="w-5 h-5" />
            </button>
          </div>

          {user.role !== 'Suporte' && (
            <button
              onClick={() => handleEditProcess(null)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-lg whitespace-nowrap"
            >
              + Novo Processo
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <TabelaProcessosRecentes
          processes={processes}
          onEditProcess={handleEditProcess}
          userRole={user.role}
        />
      ) : (
        <KanbanBoard
          processes={processes}
          onEditProcess={handleEditProcess}
        />
      )}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { processes } = useProcesses(user);

  // Estados dos Modais
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [currentProcess, setCurrentProcess] = useState(null);

  // Handlers
  const handleEditProcess = (process) => {
    setCurrentProcess(process);
    setIsProcessModalOpen(true);
  };

  const handleContactSupport = () => {
    setIsSupportModalOpen(true);
  };

  // Props comuns
  const commonProps = {
    user,
    processes,
    onContactSupport: handleContactSupport,
    onEditProcess: handleEditProcess,
  };

  // Define a Home baseada no cargo
  const RoleBasedHome = () => {
    switch (user.role) {
      case 'Gestor': return <DashboardGestorComponent {...commonProps} activeTab="Início" />;
      case 'Analista': return <DashboardAnalistaComponent {...commonProps} activeTab="Início" />;
      case 'Suporte': return <DashboardSuporteComponent {...commonProps} activeTab="Tickets" />;
      default: return <PlaceholderComponent title="Acesso Negado" />;
    }
  };

  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          {/* Rota Inicial (Visão Geral) */}
          <Route index element={<RoleBasedHome />} />

          {/* Rotas Específicas */}
          <Route path="processos" element={<ProcessosRoute user={user} processes={processes} handleEditProcess={handleEditProcess} />} />

          <Route path="ferramentas" element={<FerramentasComponent onContactSupport={handleContactSupport} />} />
          <Route path="configuracoes" element={<SettingsComponent user={user} />} />
          <Route path="relatorios" element={<PlaceholderComponent title="Relatórios" />} />

          {/* Rota do Easter Egg */}
          <Route path="sobre-seduc" element={<AboutSeduc />} />

          <Route path="usuarios" element={
            user.role === 'Suporte'
              ? <DashboardSuporteComponent {...commonProps} activeTab="Usuários" />
              : <Navigate to="/dashboard" />
          } />
        </Route>
      </Routes>

      {/* Modais Globais */}
      <ProcessModal
        isOpen={isProcessModalOpen}
        setIsOpen={setIsProcessModalOpen}
        process={currentProcess}
        user={user}
      />
      <SupportModal
        isOpen={isSupportModalOpen}
        setIsOpen={setIsSupportModalOpen}
        user={user}
      />
    </>
  );
};

// ESTA LINHA É FUNDAMENTAL PARA CORRIGIR O ERRO
export default DashboardPage;
