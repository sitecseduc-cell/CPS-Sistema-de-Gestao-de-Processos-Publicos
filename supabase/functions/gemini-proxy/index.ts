// supabase/functions/gemini-proxy/index.ts
// Edge Function que faz proxy seguro das chamadas ao Gemini.
// A chave da API fica armazenada nas variáveis de ambiente do servidor Supabase
// e NUNCA é exposta no bundle do frontend.
//
// Deploy: supabase functions deploy gemini-proxy
// Env:    supabase secrets set GEMINI_API_KEY=<sua_chave>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const MODEL_NAME = 'gemini-1.5-flash'; // Versão fixa — não usar 'latest' em produção
const GEMINI_API_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY não configurada nas variáveis de ambiente do servidor.');
    }

    const response = await fetch(`${GEMINI_API_BASE}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error: ${response.status} — ${err}`);
    }

    const json = await response.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function cleanJson(text: string): unknown {
    text = text.replace(/```json/g, '').replace(/```/g, '');
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) text = text.substring(first, last + 1);
    return JSON.parse(text);
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { action, payload } = await req.json();

        let result: unknown;

        if (action === 'analyzeEditalDeep') {
            const { editalText } = payload;
            const prompt = `
ATUE COMO UM ESPECIALISTA EM CONCURSOS E PROCESSOS SELETIVOS PÚBLICOS.
Analise o seguinte Edital Completo e extraia informações estratégicas.

TEXTO DO EDITAL:
${editalText.substring(0, 30000)}

RETORNE APENAS UM JSON VÁLIDO (SEM MARKDOWN, SEM EXPLICAÇÕES) COM ESTA ESTRUTURA:
{
    "dados_basicos": {
        "nome": "Nome do PSS",
        "resumo": "Resumo executivo de 2 parágrafos",
        "banca": "Nome da banca ou Comissão",
        "receita_estimada": "Valor ou 'Não informado'",
        "vagas_total": "Número ou 'CR'"
    },
    "datas_importantes": [
        { "evento": "Início Inscrição", "data": "YYYY-MM-DD" },
        { "evento": "Fim Inscrição", "data": "YYYY-MM-DD" },
        { "evento": "Prova/Análise", "data": "YYYY-MM-DD" },
        { "evento": "Resultado Final", "data": "YYYY-MM-DD" }
    ],
    "requisitos_principais": ["Requisito 1", "Requisito 2"],
    "cargos": [
        { "nome": "Cargo A", "vagas": "X", "salario": "R$ 0,00" }
    ],
    "pontos_atencao": ["Item polêmico 1", "Risco de prazo 2"],
    "sugestoes_ia": ["Ideia para melhorar divulgação", "Dica para etapa de análise"]
}`;
            const text = await callGemini(prompt);
            result = cleanJson(text);

        } else if (action === 'chat') {
            const { message, systemContext } = payload;
            const prompt = `
Você é o Assistente Virtual do CPS (Sistema de Gestão de Processos Seletivos do Pará).
Sua missão é ajudar candidatos e servidores.

CONTEXTO DO SISTEMA (Dados em Tempo Real):
${systemContext || ''}

INSTRUÇÕES:
1. Responda apenas com base no contexto fornecido ou conhecimentos gerais sobre processos seletivos públicos.
2. Seja cordial, direto e profissional.
3. Use Markdown para formatar a resposta (negrito, listas).

USUÁRIO: ${message}
RESPOSTA:`;
            result = await callGemini(prompt);

        } else if (action === 'chatDocument') {
            const { message, documentText, history } = payload;
            const historyStr = (history || []).map((h: { role: string; text: string }) => `${h.role}: ${h.text}`).join('\n');
            const prompt = `
CONTEXTO: Você está analisando um Edital de Processo Seletivo (PDF extraído).
Responda APENAS com base no texto abaixo. Se não estiver no texto, diga que não encontrou.

TRECHO DO DOCUMENTO (Primeiros 30k caracteres):
${documentText.substring(0, 30000)}

HISTÓRICO DA CONVERSA:
${historyStr}

USUÁRIO: ${message}
RESPOSTA (Seja direto e cite a seção do edital se possível):`;
            result = await callGemini(prompt);

        } else if (action === 'generateConvocationSuggestion') {
            const { vagasDisponiveis, listaCandidatos } = payload;
            const vagasSimples = vagasDisponiveis.map((v: Record<string, string>) => ({
                id: v.id, cargo: v.cargo_funcao || v.cargo, cidade: v.municipio, dre: v.dre,
            }));
            const candidatosSimples = listaCandidatos.map((c: Record<string, string>) => ({
                id: c.id, nome: c.nome, cargo: c.cargo_pretendido || c.cargo,
                cidade: c.localidade || c.cidade, pontuacao: c.pontuacao || 'N/A', status: c.status,
            }));

            const prompt = `
ATUE COMO UM GESTOR DE RH PÚBLICO.
Seu objetivo é preencher as vagas abertas convocando os melhores candidatos disponíveis.

REGRAS:
1. O cargo do candidato DEVE ser compatível com a vaga.
2. A cidade/localidade DEVE ser compatível (ou próxima).
3. Priorize candidatos com status 'Classificado'.
4. Se tiver pontuação, priorize a maior.

LISTA DE VAGAS ABERTAS:
${JSON.stringify(vagasSimples)}

LISTA DE CANDIDATOS:
${JSON.stringify(candidatosSimples)}

RETORNE UM JSON COM ESTA ESTRUTURA EXATA (SEM MARKDOWN):
{
    "sugestoes": [
        {
            "vaga_id": "ID da vaga",
            "candidato_id": "ID do candidato escolhido",
            "motivo": "Explicação curta",
            "match_score": 0
        }
    ],
    "sem_candidato": ["ID das vagas que sobraram"]
}`;
            const text = await callGemini(prompt);
            result = cleanJson(text);

        } else {
            return new Response(JSON.stringify({ error: `Ação desconhecida: ${action}` }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro interno';
        console.error('[gemini-proxy] ❌', message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
