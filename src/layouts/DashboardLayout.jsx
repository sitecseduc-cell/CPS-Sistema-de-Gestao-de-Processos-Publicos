import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return null;

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Aurora Background with Animated Glow Orbs */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full w-full p-4 gap-4">
        {/* Sidebar with Glassmorphism */}
        <Sidebar
          user={user}
          onLogout={handleLogout}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content Card */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden">
          {/* Header */}
          <Header
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-7xl mx-auto animate-fadeIn pb-10">
              <Outlet context={{ searchQuery }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
