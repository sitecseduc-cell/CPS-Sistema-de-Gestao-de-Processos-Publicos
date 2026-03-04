// src/services/psicologoService.js
// Camada de serviço para o módulo de Convocação e Alocação de Psicólogos.
// Centraliza todas as chamadas ao Supabase, mantendo os componentes UI limpos.

import { supabase } from '../lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// CONVOCAÇÕES — tabela: convocacoes_psicologo
// ─────────────────────────────────────────────────────────────────────────────

/** Busca todas as convocações com filtros opcionais */
export const fetchConvocacoesPsicologo = async ({ search = '', status = '' } = {}) => {
    let query = supabase
        .from('convocacoes_psicologo')
        .select('*')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(
            `candidato_nome.ilike.%${search}%,candidato_cpf.ilike.%${search}%,escola_destino.ilike.%${search}%,municipio.ilike.%${search}%`
        );
    }
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

/** Cria nova convocação */
export const createConvocacaoPsicologo = async (payload) => {
    const { data, error } = await supabase
        .from('convocacoes_psicologo')
        .insert([payload])
        .select()
        .single();
    if (error) throw error;
    return data;
};

/** Atualiza convocação existente */
export const updateConvocacaoPsicologo = async (id, payload) => {
    const { data, error } = await supabase
        .from('convocacoes_psicologo')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

/** Remove convocação */
export const deleteConvocacaoPsicologo = async (id) => {
    const { error } = await supabase
        .from('convocacoes_psicologo')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};

/** Resumo por status */
export const fetchConvocacoesResumo = async () => {
    const { data, error } = await supabase
        .from('convocacoes_psicologo')
        .select('status');
    if (error) throw error;

    const counts = { Pendente: 0, 'Em Análise': 0, Convocado: 0, Empossado: 0, Desistente: 0, Substituído: 0 };
    (data || []).forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    return counts;
};

// ─────────────────────────────────────────────────────────────────────────────
// REGRAS DE ALOCAÇÃO — tabela: regras_alocacao_psicologo
// ─────────────────────────────────────────────────────────────────────────────

/** Busca a regra ativa (mais recente) */
export const fetchRegraAtiva = async () => {
    const { data, error } = await supabase
        .from('regras_alocacao_psicologo')
        .select('*')
        .eq('ativo', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code === 'PGRST116') return null; // sem linhas
    if (error) throw error;
    return data;
};

/** Atualiza os parâmetros da regra ativa */
export const updateRegra = async (id, payload, changedBy = 'Usuário') => {
    const { data, error } = await supabase
        .from('regras_alocacao_psicologo')
        .update({ ...payload, changed_by: changedBy })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

/** Histórico de alterações nas regras */
export const fetchHistoricoRegras = async () => {
    const { data, error } = await supabase
        .from('regras_alocacao_psicologo')
        .select('id, descricao, changed_by, updated_at, total_vagas_disponivel, psic_por_escolas_pequenas, psic_por_alunos_grande')
        .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCOLAS BASE — tabela: escolas_base
// ─────────────────────────────────────────────────────────────────────────────

/** Busca escolas do último import (ou geral) */
export const fetchEscolasBase = async (importId = null) => {
    let query = supabase
        .from('escolas_base')
        .select('*')
        .order('total_alunos', { ascending: false });

    if (importId) query = query.eq('import_id', importId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

/** Insere lote de escolas (resultado do ETL) */
export const insertEscolasBase = async (escolas) => {
    const { data, error } = await supabase
        .from('escolas_base')
        .insert(escolas)
        .select();
    if (error) throw error;
    return data || [];
};

/** Remove todas as escolas de um import */
export const deleteEscolasDoImport = async (importId) => {
    const { error } = await supabase
        .from('escolas_base')
        .delete()
        .eq('import_id', importId);
    if (error) throw error;
    return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// ETL IMPORTS — tabela: etl_imports
// ─────────────────────────────────────────────────────────────────────────────

/** Busca histórico de importações */
export const fetchEtlImports = async () => {
    const { data, error } = await supabase
        .from('etl_imports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
    if (error) throw error;
    return data || [];
};

/** Registra uma nova importação e retorna o ID */
export const createEtlImport = async (payload) => {
    const { data, error } = await supabase
        .from('etl_imports')
        .insert([payload])
        .select()
        .single();
    if (error) throw error;
    return data;
};

/** Busca o import mais recente */
export const fetchUltimoImport = async () => {
    const { data, error } = await supabase
        .from('etl_imports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    return data;
};
