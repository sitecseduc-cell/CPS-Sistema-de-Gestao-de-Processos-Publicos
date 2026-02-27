import { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useDemo } from './DemoContext';
import { DEMO_CREDENTIALS } from '../demo/demoData';

import { User } from '@supabase/supabase-js';
import ImmersiveLoader from '../components/ImmersiveLoader';

// Define types for Profile and Context
type Profile = {
  id: string;
  role: string;
  email: string;
  [key: string]: any; // Allow other fields
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: string;
  isAdmin: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // <--- Storing profile/role
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const demoCtx = useDemo() as any;

  const fetchingUserId = useRef<string | null>(null); // <--- Ref to track in-progress fetches

  // Helper function to get profile with timeout and retry
  const fetchProfile = async (userId: string, retryCount = 0) => {
    // Prevent duplicate fetches for the same user (only checking on initial attempt)
    if (fetchingUserId.current === userId && retryCount === 0) {
      // console.log(`[Auth] ⏳ Profile fetch already in progress for ${userId}, skipping duplicate.`);
      return;
    }

    // Set lock
    if (retryCount === 0) {
      fetchingUserId.current = userId;
    }

    // console.log(`[Auth] 🔍 Fetching profile for user: ${userId} (Attempt ${retryCount + 1})`);

    const abortController = new AbortController();

    try {
      // Create a timeout promise that rejects after 6 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          abortController.abort();
          reject(new Error('Profile fetch timed out'));
        }, 6000)
      );

      // ⚠️ CÓDIGO ANTIGO (Lento / Timeout)
      /* const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .abortSignal(abortController.signal)
        .single();
      */

      // ✅ CÓDIGO NOVO (Instantâneo via RPC)
      // Usamos 'maybeSingle' para evitar erro se o perfil ainda não existir
      const queryPromise = supabase
        .rpc('get_my_profile')
        .abortSignal(abortController.signal);

      // Race them
      const result: any = await Promise.race([queryPromise, timeoutPromise]);

      // O RPC retorna os dados diretamente em 'data', ou null
      // Ajuste para manter compatibilidade com o formato esperado
      const { data, error } = result;

      if (error) {
        console.error('[Auth] ❌ Error fetching profile via RPC:', error);
        setProfile(null);
        return;
      }

      // Se data for null, significa que não achou (equivalente ao erro PGRST116)
      if (data) {
        // console.log('[Auth] ✅ Perfil carregado:', data);
        setProfile(data);
      } else {
        console.warn('[Auth] ⚠️ Perfil não encontrado para este usuário. (Data null)');
        setProfile(null);
      }
    } catch (err: any) {
      // Ignore AbortError if we caused it
      if (abortController.signal.aborted) {
        console.warn("[Auth] ⏱️ Request timed out and was aborted.");
      } else {
        console.error("[Auth] ❌ Unexpected error fetching profile:", err);
      }

      // Retry logic - REDUCED to 1 retry
      if (retryCount < 1) {
        const backoff = 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchProfile(userId, retryCount + 1);
      }

      setProfile((prev) => {
        if (prev && prev.id === userId) {
          console.warn("[Auth] ⚠️ Failed to fetch profile after retries. Keeping previous profile data.");
          return prev;
        }
        console.warn("[Auth] ⚠️ Failed to fetch profile. App will load without profile.");
        return null;
      });
    } finally {
      // Release lock only if this was the root call
      if (retryCount === 0) {
        fetchingUserId.current = null;
      }
    }
  };

  useEffect(() => {
    // Check for hash manually on mount in case event fired before listener
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      if (window.location.pathname !== '/update-password') {
        navigate('/update-password');
      }
    }

    let safetyTimeout: any;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log(`[Auth] 🔄 Auth Event: ${event}`);
      setUser(session?.user ?? null);

      if (session?.user && event !== 'TOKEN_REFRESHED') {
        // Se houver usuário, buscamos o perfil
        // O safetyTimeout aqui deve ser maior que o timeout da busca (agora 6s + retry)
        safetyTimeout = setTimeout(() => {
          console.warn("[Auth] ⚠️ Safety Timeout: Perfil demorou demais (12s). Liberando app.");
          setLoading(false);
        }, 12000); // 12 segundos

        await fetchProfile(session.user.id);

        if (safetyTimeout) clearTimeout(safetyTimeout);
        setLoading(false);


      } else {
        // Se não tem sessão (ex: SIGNED_OUT), limpa perfil e loading
        setProfile(null);
        setLoading(false);
      }

      if (event === 'PASSWORD_RECOVERY') {
        if (window.location.pathname !== '/update-password') {
          navigate('/update-password');
        }
      }
    });

    return () => {
      if (safetyTimeout) clearTimeout(safetyTimeout);
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Interceptar credenciais de homologação
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      demoCtx.enterDemoMode();
      return { user: demoCtx.demoUser };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      if (demoCtx.isDemoMode) {
        demoCtx.exitDemoMode();
        return;
      }
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  // Computed roles — no modo demo, usar perfil demo
  const effectiveUser = demoCtx.isDemoMode ? (demoCtx.demoUser as unknown as User) : user;
  const effectiveProfile = demoCtx.isDemoMode ? demoCtx.demoProfile : profile;
  const role = effectiveProfile?.role || 'servidor';
  const isAdmin = role === 'admin';
  const isManager = role === 'gestor' || role === 'admin';

  if (loading && !demoCtx.isDemoMode) {
    return <ImmersiveLoader />;
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: effectiveUser,
      profile: effectiveProfile,
      role,
      isAdmin,
      isManager,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);