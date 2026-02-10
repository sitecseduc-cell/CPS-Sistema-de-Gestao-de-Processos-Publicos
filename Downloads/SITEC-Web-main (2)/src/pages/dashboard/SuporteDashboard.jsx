import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import FerramentasComponent from '../../components/FerramentasComponent';

// Cole o SupportTicketsView que estava no App.jsx
const SupportTicketsView = ({ tickets }) => {
  const getTicketStatusClass = (status) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'Aberto': return `${baseClasses} bg-red-100 text-red-800`;
      case 'Em Andamento': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Fechado': return `${baseClasses} bg-green-100 text-green-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleTicketStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do ticket.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tickets de Suporte</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* ... (conteúdo da tabela) ... */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mensagem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.fromName}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{ticket.message}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getTicketStatusClass(ticket.status)}>{ticket.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {ticket.status !== 'Fechado' && (
                    <button onClick={() => handleTicketStatusChange(ticket.id, 'Fechado')} className="text-red-600 hover:text-red-900">
                      Fechar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Cole o UsersView que estava no App.jsx
const UsersView = ({ users }) => {
  const handleRoleChange = async (id, newRole) => {
    if (window.confirm(`Tem certeza que deseja alterar o perfil deste usuário para ${newRole}?`)) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error("Erro ao atualizar papel:", error);
        alert("Erro ao atualizar permissões do usuário.");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Gerenciamento de Usuários</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* ... (conteúdo da tabela) ... */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Setor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Perfil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.sector}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {user.role !== 'Gestor' && <button onClick={() => handleRoleChange(user.id, 'Gestor')} className="text-blue-600 hover:text-blue-900">Tornar Gestor</button>}
                  {user.role !== 'Analista' && <button onClick={() => handleRoleChange(user.id, 'Analista')} className="text-green-600 hover:text-green-900">Tornar Analista</button>}
                  {user.role !== 'Suporte' && <button onClick={() => handleRoleChange(user.id, 'Suporte')} className="text-yellow-600 hover:text-yellow-900">Tornar Suporte</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Cole o DashboardSuporteComponent que estava no App.jsx
const DashboardSuporteComponent = ({ user, searchQuery = '', activeTab, processes, onContactSupport }) => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          users (
            full_name,
            sector
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar tickets:", error);
      } else {
        const formattedTickets = data.map(ticket => ({
          ...ticket,
          fromName: ticket.users?.full_name || 'Desconhecido',
          fromSector: ticket.users?.sector || 'N/A',
          message: ticket.description
        }));
        setTickets(formattedTickets);
      }
    };

    fetchTickets();

    const channel = supabase
      .channel('public:support_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error("Erro ao buscar usuários:", error);
      } else {
        const formattedUsers = data.map(u => ({
          ...u,
          fullName: u.full_name
        }));
        setUsers(formattedUsers);
      }
    };

    fetchUsers();

    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Tickets':
        return <SupportTicketsView tickets={tickets} />;
      case 'Usuários':
        return <UsersView users={users} />;
      case 'Ferramentas':
        return <FerramentasComponent onContactSupport={onContactSupport} />;
      default:
        return <SupportTicketsView tickets={tickets} />;
    }
  };
  return <>{renderContent()}</>;
};

export default DashboardSuporteComponent;