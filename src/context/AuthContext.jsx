import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        await supabase.auth.signOut();
        setIsLoadingAuth(false);
        return;
      }

      if (userData) {
        setUser({
          uid: userData.id,
          username: userData.full_name,
          role: userData.role,
          sector: userData.sector,
          avatar: userData.avatar || `https://placehold.co/100x100/eeeeee/333333?text=${userData.full_name?.charAt(0) || '?'}`,
          email: userData.email
        });
      }

      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setIsLoadingAuth(false);
    }
  };

  const value = {
    user,
    isLoadingAuth,
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};