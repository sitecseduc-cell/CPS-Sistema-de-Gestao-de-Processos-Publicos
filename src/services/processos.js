import { supabase } from '../lib/supabaseClient';

export const fetchProcessos = async ({ signal, search = '', fase = '' } = {}) => {
    let query = supabase
        .from('processos')
        .select('id, nome, inicio, fim, fase_atual, progresso, ai_metadata, created_at')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.ilike('nome', `%${search}%`);
    }

    if (fase) {
        query = query.eq('fase_atual', fase);
    }

    if (signal) {
        query = query.abortSignal(signal);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const createProcesso = async (processoData) => {
    // Ensure defaults
    const payload = {
        ...processoData,
        fase_atual: processoData.fase_atual || 'Planejamento',
        progresso: processoData.progresso || 0,
        // ai_metadata is optional and passed in processoData if exists
    };

    const { data, error } = await supabase
        .from('processos')
        .insert([payload])
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
