import { supabase } from '../lib/supabaseClient';

export const fetchProcessos = async ({ signal } = {}) => {
    // Selecione apenas as colunas que aparecem na tabela/lista
    let query = supabase
        .from('processos')
        .select('id, titulo, status, data_inicio, data_fim, vagas_disponiveis')
        .order('created_at', { ascending: false })
        .limit(50); // Hard limit preventivo

    if (signal) {
        query = query.abortSignal(signal);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const createProcesso = async (processoData) => {
    const { data, error } = await supabase
        .from('processos')
        .insert([{
            ...processoData,
            fase_atual: 'Planejamento',
            progresso: 0
        }])
        .select();
    if (error) throw error;
    return data[0];
};

export const updateProcesso = async (id, processoData) => {
    const { data, error } = await supabase
        .from('processos')
        .update(processoData)
        .eq('id', id)
        .select();
    if (error) throw error;
    return data[0];
};

export const deleteProcesso = async (id) => {
    const { error } = await supabase.from('processos').delete().eq('id', id);
    if (error) throw error;
    return true;
};
