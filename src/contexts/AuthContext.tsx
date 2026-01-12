import { createContext, useState, useEffect, useContext, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import logoSistema from '../assets/brassao.svg';
import { User } from '@supabase/supabase-js';

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

  const fetchingUserId = useRef<string | null>(null); // <--- Ref to track in-progress fetches

  // Helper function to get profile with timeout and retry
  const fetchProfile = async (userId: string, retryCount = 0) => {
    // Prevent duplicate fetches for the same user (only checking on initial attempt)
    if (fetchingUserId.current === userId && retryCount === 0) {
      console.log(`[Auth] ⏳ Profile fetch already in progress for ${userId}, skipping duplicate.`);
      return;
    }

    // Set lock
    if (retryCount === 0) {
      fetchingUserId.current = userId;
    }

    console.log(`[Auth] 🔍 Fetching profile for user: ${userId} (Attempt ${retryCount + 1})`);

    const abortController = new AbortController();

    try {
      // Create a timeout promise that rejects after 60 seconds (extended for slow connections)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          abortController.abort();
          reject(new Error('Profile fetch timed out'));
        }, 60000)
      );

      // The actual supabase query
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .abortSignal(abortController.signal)
        .single();

      // Race them
      const result: any = await Promise.race([queryPromise, timeoutPromise]);

      const { data, error } = result;

      if (error) {
        if (error.code !== 'PGRST116') { // Ignore "Row not found" errors in console
          console.error(`[Auth] ❌ Error fetching profile:`, error);
        }

        // Distinguish between "not found" and other errors
        if (error.code === 'PGRST116') {
          console.warn('[Auth] ⚠️ Profile not found in database - user may need to complete registration');
        } else {
          console.error('[Auth] ❌ Database error - check RLS policies and table permissions');
        }

        setProfile(null);
        return;
      }

      if (data) {
        console.log(`[Auth] ✅ Profile loaded successfully:`, {
          id: data.id,
          role: data.role,
          email: data.email
        });
        setProfile(data);
      } else {
        console.warn('[Auth] ⚠️ No profile data returned');
        setProfile(null);
      }
    } catch (err: any) {
      // Ignore AbortError if we caused it
      if (abortController.signal.aborted) {
        console.warn("[Auth] ⏱️ Request timed out and was aborted.");
      } else {
        console.error("[Auth] ❌ Unexpected error fetching profile:", err);
      }

      // Retry logic for timeouts or network errors
      if (retryCount < 3) { // Try 3 times
        const backoff = (retryCount + 1) * 2000; // 2s, 4s, 6s...
        console.log(`[Auth] ⚠️ Retrying profile fetch in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchProfile(userId, retryCount + 1);
      }

      console.warn("[Auth] ⚠️ Failed to fetch profile after retries. App will load without profile.");
      setProfile(null);
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
      console.log(`[Auth] 🔄 Auth Event: ${event}`);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Se houver usuário, buscamos o perfil
        // O safetyTimeout aqui deve ser maior que o timeout da busca (agora 60s + retries)
        safetyTimeout = setTimeout(() => {
          console.warn("[Auth] ⚠️ Safety Timeout: Perfil demorou demais para carregar (120s). Liberando app.");
          setLoading(false);
        }, 120000); // 120 segundos (2 minutos)

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
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  // Computed roles
  const role = profile?.role || 'servidor'; // Default to 'servidor' if undefined
  const isAdmin = role === 'admin';
  const isManager = role === 'gestor' || role === 'admin';

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <img src={logoSistema} alt="Carregando..." className="h-10 w-auto" />
        </div>
      </div>
    );
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
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