import React, { Fragment, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import Icon from '../components/Icon';
import useKonamiCode from '../hooks/useKonamiCode';

const Sidebar = ({ user, onLogout, isMobileSidebarOpen, setIsMobileSidebarOpen }) => {

  const [isEasterEggUnlocked, setIsEasterEggUnlocked] = useState(() => {
    return localStorage.getItem('sitec_easter_egg') === 'true';
  });

  const konamiSuccess = useKonamiCode();

  useEffect(() => {
    if (konamiSuccess && !isEasterEggUnlocked) {
      setIsEasterEggUnlocked(true);
      localStorage.setItem('sitec_easter_egg', 'true');
      alert("🥚 VOCÊ DESBLOQUEOU UM SEGREDO! 🥚\nConfira o menu lateral...");
    }
  }, [konamiSuccess, isEasterEggUnlocked]);

  const navItems = {
    'Gestor': [
      { icon: 'home', label: 'Visão Geral', path: '/dashboard', end: true },
      { icon: 'folderKanban', label: 'Processos', path: '/dashboard/processos' },
      { icon: 'pieChart', label: 'Relatórios', path: '/dashboard/relatorios' },
      { icon: 'briefcase', label: 'Ferramentas', path: '/dashboard/ferramentas' },
      { icon: 'settings', label: 'Configurações', path: '/dashboard/configuracoes' }
    ],
    'Analista': [
      { icon: 'home', label: 'Visão Geral', path: '/dashboard', end: true },
      { icon: 'folderKanban', label: 'Meus Processos', path: '/dashboard/processos' },
      { icon: 'briefcase', label: 'Ferramentas', path: '/dashboard/ferramentas' },
      { icon: 'settings', label: 'Configurações', path: '/dashboard/configuracoes' }
    ],
    'Suporte': [
      { icon: 'lifeBuoy', label: 'Tickets', path: '/dashboard', end: true },
      { icon: 'users', label: 'Usuários', path: '/dashboard/usuarios' },
      { icon: 'briefcase', label: 'Ferramentas', path: '/dashboard/ferramentas' }
    ]
  };

  let menuItems = navItems[user?.role] || [];

  if (isEasterEggUnlocked) {
    menuItems = [
      ...menuItems,
      {
        icon: 'sparkles',
        label: 'Sobre a SEDUC',
        path: '/dashboard/sobre-seduc',
        special: true
      }
    ];
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className="flex items-center h-24 px-8">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30 mr-3">
          <Icon name="logo" className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">SITEC</h1>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Gestão Pública</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={({ isActive }) => `
              group flex items-center px-5 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300
              ${isActive
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20 translate-x-1'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md'}
              ${item.special ? 'animate-pulse text-purple-500 hover:text-purple-700' : ''} 
            `}
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={item.icon}
                  className={`mr-4 h-5 w-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'text-white scale-110' : (item.special ? 'text-purple-500' : 'text-gray-400 group-hover:text-indigo-500')
                    }`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={() => {
              console.log('Botão de logout clicado');
              if (onLogout) onLogout();
              else console.error('onLogout function not provided!');
            }}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all"
            title="Sair"
          >
            <Icon name="logOut" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col glass-card">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Transition show={isMobileSidebarOpen} as={Fragment}>
        <Dialog onClose={() => setIsMobileSidebarOpen(false)} className="relative z-50 md:hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative w-72 glass-card m-4 rounded-3xl">
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Sidebar;
