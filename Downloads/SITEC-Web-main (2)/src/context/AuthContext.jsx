import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn("AuthContext: Force stopping loading due to timeout");
      setIsLoadingAuth(false);
    }, 8000);

    // Função para verificar sessão
    const checkSession = async () => {
      console.log("AuthContext: Starting session check...");
      try {
        console.log("AuthContext: Calling supabase.auth.getSession()...");
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("AuthContext: getSession result:", { session, error });

        if (error) {
          console.error("AuthContext: Error checking session", error);
          clearTimeout(timeoutId);
          setIsLoadingAuth(false);
          return;
        }

        if (session?.user) {
          console.log("AuthContext: Session found for user:", session.user.id);
          await loadUserData(session.user.id);
          console.log("AuthContext: User data loaded successfully");
          clearTimeout(timeoutId);
        } else {
          console.log("AuthContext: No session found");
          clearTimeout(timeoutId);
          setIsLoadingAuth(false);
        }
      } catch (err) {
        console.error("AuthContext: Unexpected error checking session", err);
        clearTimeout(timeoutId);
        setIsLoadingAuth(false);
      }
    };

    checkSession();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth change", event);
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const loadUserData = async (userId) => {
    console.log(`AuthContext: loadUserData called for ${userId}`);
    try {
      console.log("AuthContext: Querying public.users table...");
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log("AuthContext: Query result:", { userData, error });

      if (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        // Não faz logout aqui para não causar loop infinito em alguns casos,
        // apenas retorna erro para quem chamou (se for login explícito)
        // ou define user como null (se for verificação de sessão)
        return null;
      }

      if (userData) {
        const userObj = {
          uid: userData.id,
          username: userData.full_name,
          role: userData.role,
          sector: userData.sector,
          avatar: userData.avatar || `https://placehold.co/100x100/eeeeee/333333?text=${userData.full_name?.charAt(0) || '?'}`,
          email: userData.email
        };
        setUser(userObj);
        return userObj;
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.user) {
        let userProfile = await loadUserData(data.session.user.id);

        // Se não encontrar perfil, tenta criar automaticamente (Self-healing)
        if (!userProfile) {
          console.log("Perfil não encontrado. Tentando criar automaticamente...");
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.session.user.id,
              email: data.session.user.email,
              full_name: data.session.user.user_metadata?.full_name || 'Usuário',
              role: data.session.user.user_metadata?.role || 'Analista',
              sector: data.session.user.user_metadata?.sector || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) {
            console.error("Erro ao criar perfil automaticamente:", createError);
            await supabase.auth.signOut();
            throw new Error(`Falha ao criar perfil: ${createError.message}. Verifique as permissões do banco (RLS).`);
          }

          // Tenta carregar novamente após criar
          userProfile = await loadUserData(data.session.user.id);
        }

        if (!userProfile) {
          await supabase.auth.signOut();
          throw new Error('Perfil de usuário não encontrado. Contate o suporte.');
        }
        return userProfile;
      }
    } catch (error) {
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    signIn,
    sendPasswordResetEmail,
    resetPassword,
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