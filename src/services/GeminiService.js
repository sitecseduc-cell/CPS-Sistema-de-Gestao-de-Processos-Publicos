// src/services/GeminiService.js
// ⚠️ SEGURANÇA: As chamadas ao Gemini agora passam pela Edge Function 'gemini-proxy'
// hospedada no Supabase. A chave da API NUNCA é exposta no bundle do frontend.
//
// Para configurar:
//   1. supabase functions deploy gemini-proxy
//   2. supabase secrets set GEMINI_API_KEY=<sua_chave>

import { supabase } from '../lib/supabaseClient';

/**
 * Invoca a Edge Function de proxy e retorna os dados ou lança erro.
 * @param {string} action
 * @param {object} payload
 */
async function invokeProxy(action, payload) {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action, payload },
    });

    if (error) {
        console.error(`[GeminiProxy] ❌ Erro na action '${action}':`, error);
        throw new Error(error.message || 'Erro ao comunicar com o servidor de IA.');
    }

    return data?.data;
}

export const GeminiService = {

    /**
     * Análise Profunda do Edital (RAG Zero-Shot)
     * Extrai dados estruturados complexos e insights.
     */
    async analyzeEditalDeep(editalText) {
        return invokeProxy('analyzeEditalDeep', { editalText });
    },

    /**
     * Chat com o Documento
     */
    async chatDocument(message, documentText, history = []) {
        try {
            return await invokeProxy('chatDocument', { message, documentText, history });
        } catch {
            return 'Não consegui ler o documento para responder a isso.';
        }
    },

    /**
     * Mantendo compatibilidade com código antigo (Wrapper para Deep)
     */
    async analyzeEdital(editalText) {
        try {
            const data = await this.analyzeEditalDeep(editalText);

            const cargosStr = data.cargos?.map(c => `- ${c.nome} (${c.vagas} vagas)`).join('\n') || '';
            const desc = `${data.dados_basicos.resumo}\n\nCARGOS:\n${cargosStr}\n\nPONTOS DE ATENÇÃO:\n${data.pontos_atencao.join('\n- ')}`;

            return {
                nome: data.dados_basicos.nome,
                descricao: desc,
                inicio: data.datas_importantes.find(d => d.evento.includes('Início'))?.data || new Date().toISOString().split('T')[0],
                fim: data.datas_importantes.find(d => d.evento.includes('Fim'))?.data || new Date().toISOString().split('T')[0],
                cargos: data.cargos.map(c => c.nome),
                etapas: data.datas_importantes.map(d => d.evento),
                raw_data: data,
            };
        } catch (e) {
            console.error('Fallback de análise por erro:', e);
            return {
                nome: 'Edital Processado (Erro IA)',
                descricao: 'Não foi possível realizar a análise profunda.',
                inicio: new Date().toISOString().split('T')[0],
                fim: new Date().toISOString().split('T')[0],
                cargos: [],
                etapas: [],
            };
        }
    },

    /**
     * Chat interativo com contexto do sistema (Global Chatbot).
     */
    async chat(message, systemContext = '') {
        try {
            return await invokeProxy('chat', { message, systemContext });
        } catch (error) {
            return `Desculpe, tive um problema técnico ao processar sua mensagem. (${error.message || 'Erro desconhecido'})`;
        }
    },

    /**
     * Módulo de Convocação Inteligente
     * Cruza vagas abertas com lista de classificados.
     */
    async generateConvocationSuggestion(vagasDisponiveis, listaCandidatos) {
        return invokeProxy('generateConvocationSuggestion', { vagasDisponiveis, listaCandidatos });
    },
};
