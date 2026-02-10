import React, { useState, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import Icon from '../components/Icon';
import useNotifications from '../hooks/useNotifications';
import AppLauncher from '../components/AppLauncher';


const NotificationPanel = ({ isOpen, setIsOpen, notifications, user }) => {
  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-0 scale-95 translate-y-2"
      enterTo="transform opacity-100 scale-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="transform opacity-100 scale-100 translate-y-0"
      leaveTo="transform opacity-0 scale-95 translate-y-2"
    >
      <div className="absolute right-0 mt-4 w-96 max-h-[30rem] overflow-y-auto glass-card z-50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">Notificações</h3>
        </div>
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
          Nenhuma notificação nova.
        </div>
      </div>
    </Transition>
  )
};

const Header = ({ user, theme, toggleTheme, searchQuery, setSearchQuery, setIsMobileSidebarOpen }) => {
  const [time, setTime] = useState(new Date());
  const { notifications, unreadCount } = useNotifications(user?.id);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="flex items-center justify-between h-24 px-8 bg-transparent z-20">

      {/* Esquerda: Saudação e Data */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Icon name="menu" className="h-6 w-6" />
        </button>

        <AppLauncher />

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            Olá, <span className="text-indigo-600 dark:text-indigo-400">{user?.username?.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-sm font-medium text-gray-400 capitalize">{formattedDate}</p>
        </div>
      </div>

      {/* Direita: Busca e Ações */}
      <div className="flex items-center gap-4">

        {/* Barra de Busca Estilizada */}
        <div className="hidden md:flex relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Icon name="search" className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </span>
          <input
            type="text"
            className="w-72 pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
            placeholder="Buscar processos, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block"></div>

        {/* Botão Dark Mode */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 transition-all"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-6 w-6" />
        </button>

        {/* Notificações */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationPanelOpen(prev => !prev)}
            className={`p-3 rounded-xl transition-all relative ${isNotificationPanelOpen ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600'}`}
          >
            <Icon name="bell" className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></span>
            )}
          </button>

          <NotificationPanel
            isOpen={isNotificationPanelOpen}
            setIsOpen={setIsNotificationPanelOpen}
            notifications={notifications}
            user={user}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
