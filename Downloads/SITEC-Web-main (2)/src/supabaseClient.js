// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO CRÍTICO: Supabase URL e Anon Key estão faltando!');
    console.error('Lido VITE_SUPABASE_URL:', supabaseUrl);
    console.error('Lido VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
    // Não lançar erro para não quebrar a tela branca totalmente, apenas alertar
    alert('ERRO DE CONFIGURAÇÃO: Verifique o console (F12) para mais detalhes. Credenciais do Supabase não encontradas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
