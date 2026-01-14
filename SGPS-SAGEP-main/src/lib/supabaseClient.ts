/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

// Configuração do Banco de Dados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cliente de segurança (Mock) para evitar tela branca se falhar a conexão
const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signInWithPassword: () => Promise.reject(new Error("Supabase não configurado")),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({ select: () => ({ data: [], error: null }) })
}

// Exporta o cliente correto
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient