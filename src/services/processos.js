import { supabase } from '../lib/supabaseClient';

export const fetchProcessos = async ({ signal } = {}) => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
        const stored = localStorage.getItem('@sitec_mock_processos_v2');
        if (stored) return JSON.parse(stored);
        const initialMockData = [
            { id: 'p1', nome: 'Processo Seletivo Seduc 2026', fase_atual: 'Inscrições', progresso: 30, inicio: '2026-01-10', fim: '2026-12-30', created_at: new Date().toISOString() },
            { id: 'p2', nome: 'Concurso Público DRE Guarulhos', fase_atual: 'Provas', progresso: 60, inicio: '2026-02-01', fim: '2026-11-01', created_at: new Date().toISOString() }
        ];
        localStorage.setItem('@sitec_mock_processos_v2', JSON.stringify(initialMockData));
        return initialMockData;
    }

    let query = supabase
        .from('processos')
        .select('*') // Select all to ensure we get ai_metadata and others
        .order('created_at', { ascending: false });

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

    if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
        const stored = localStorage.getItem('@sitec_mock_processos_v2');
        let mockData = stored ? JSON.parse(stored) : [];
        const novoProcesso = { id: `mock-proc-${Date.now()}`, ...payload, created_at: new Date().toISOString() };
        mockData = [novoProcesso, ...mockData];
        localStorage.setItem('@sitec_mock_processos_v2', JSON.stringify(mockData));
        return novoProcesso;
    }

    const { data, error } = await supabase
        .from('processos')
        .insert([payload])
        .select();

    if (error) throw error;
    return data[0];
};

export const updateProcesso = async (id, processoData) => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
        const stored = localStorage.getItem('@sitec_mock_processos_v2');
        let mockData = stored ? JSON.parse(stored) : [];
        const index = mockData.findIndex(p => p.id === id);
        if (index !== -1) {
            mockData[index] = { ...mockData[index], ...processoData };
            localStorage.setItem('@sitec_mock_processos_v2', JSON.stringify(mockData));
            return mockData[index];
        }
        return null;
    }

    const { data, error } = await supabase
        .from('processos')
        .update(processoData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
};

export const deleteProcesso = async (id) => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
        const stored = localStorage.getItem('@sitec_mock_processos_v2');
        let mockData = stored ? JSON.parse(stored) : [];
        mockData = mockData.filter(p => p.id !== id);
        localStorage.setItem('@sitec_mock_processos_v2', JSON.stringify(mockData));
        return true;
    }

    const { error } = await supabase.from('processos').delete().eq('id', id);
    if (error) throw error;
    return true;
};
