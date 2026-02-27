import { supabase } from '../lib/supabaseClient';

export const planejamentoService = {
    /**
     * Busca todas as vagas do sistema
     * @returns {Promise<Array>} Lista de vagas
     */
    async getVagas() {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
            const stored = localStorage.getItem('@sitec_mock_vagas_planejadas');
            if (stored) return JSON.parse(stored);

            const initialMockData = [
                { id: 'v1', cargo: 'Professor de Educação Básica I', municipio: 'São Paulo', qtd: 10, dre: 'DRE Ipiranga' },
                { id: 'v2', cargo: 'Agente de Apoio', municipio: 'Guarulhos', qtd: 5, dre: 'DRE Guarulhos' },
                { id: 'v3', cargo: 'Diretor de Escola', municipio: 'Campinas', qtd: 2, dre: 'DRE Campinas' }
            ];
            localStorage.setItem('@sitec_mock_vagas_planejadas', JSON.stringify(initialMockData));
            return initialMockData;
        }

        const { data, error } = await supabase
            .from('vagas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar vagas:', error);
            throw error;
        }
        return data || [];
    },

    /**
     * Cria uma nova vaga
     * @param {Object} vaga
     */
    async createVaga(vaga) {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
            const stored = localStorage.getItem('@sitec_mock_vagas_planejadas');
            let mockData = stored ? JSON.parse(stored) : [];
            const novaVaga = { id: `mock-${Date.now()}`, ...vaga, created_at: new Date().toISOString() };
            mockData = [novaVaga, ...mockData];
            localStorage.setItem('@sitec_mock_vagas_planejadas', JSON.stringify(mockData));
            return [novaVaga];
        }

        const { data, error } = await supabase
            .from('vagas')
            .insert([vaga])
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Atualiza uma vaga existente
     * @param {string} id
     * @param {Object} updates
     */
    async updateVaga(id, updates) {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
            const stored = localStorage.getItem('@sitec_mock_vagas_planejadas');
            let mockData = stored ? JSON.parse(stored) : [];
            const index = mockData.findIndex(v => v.id === id);
            if (index !== -1) {
                mockData[index] = { ...mockData[index], ...updates };
                localStorage.setItem('@sitec_mock_vagas_planejadas', JSON.stringify(mockData));
                return [mockData[index]];
            }
            return [];
        }

        const { data, error } = await supabase
            .from('vagas')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Remove uma vaga
     * @param {string} id
     */
    async deleteVaga(id) {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || sessionStorage.getItem('cps_demo_mode') === 'true') {
            const stored = localStorage.getItem('@sitec_mock_vagas_planejadas');
            let mockData = stored ? JSON.parse(stored) : [];
            mockData = mockData.filter(v => v.id !== id);
            localStorage.setItem('@sitec_mock_vagas_planejadas', JSON.stringify(mockData));
            return true;
        }

        const { error } = await supabase
            .from('vagas')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
