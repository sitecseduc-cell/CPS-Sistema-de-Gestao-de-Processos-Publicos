import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de ambiente
dotenv.config();

// Recriando __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURAÇÃO ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Erro: Variáveis SUPABASE_URL ou SUPABASE_SERVICE_KEY não encontradas no .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ID do Processo (Copie do seu banco de dados, tabela 'processos', coluna 'id')
const PROCESSO_ID = "e3b67efe-b25a-44eb-9e78-8a1190b6b54f";

// --- FUNÇÕES UTILITÁRIAS ---

// Limpa texto: remove espaços extras e converte para maiúsculas
const limparTexto = (texto) => {
    if (!texto) return null;
    const limpo = texto.trim().toUpperCase();
    return limpo === '' ? null : limpo;
};

// Converte data do formato brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD)
const converterData = (dataStr) => {
    if (!dataStr || dataStr.trim() === '') return null;

    // Formato esperado: DD/MM/YYYY
    const partes = dataStr.trim().split('/');
    if (partes.length !== 3) return null;

    const [diaStr, mesStr, anoStr] = partes;
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    // Validação básica
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
    if (mes < 1 || mes > 12) return null;
    if (dia < 1 || dia > 31) return null;
    if (ano < 1900 || ano > 2100) return null;

    // Validação de dias por mês
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Verifica ano bissexto
    if ((ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0) {
        diasPorMes[1] = 29;
    }

    if (dia > diasPorMes[mes - 1]) {
        console.warn(`⚠️  Data inválida ignorada: ${dataStr} (dia ${dia} não existe em mês ${mes})`);
        return null;
    }

    // Retorna no formato ISO: YYYY-MM-DD
    return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
};

// --- FUNÇÕES DE MIGRAÇÃO ---

async function migrarVagas() {
    console.log("🚀 Iniciando migração de VAGAS...");
    const resultados = [];
    const caminhoArquivo = path.join(__dirname, 'vagas.csv');

    if (!fs.existsSync(caminhoArquivo)) {
        console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
        return;
    }

    fs.createReadStream(caminhoArquivo)
        .pipe(csv())
        .on('data', (data) => {
            // Mapeamento CSV -> Banco de Dados (Ajustado para os cabeçalhos reais do CSV)
            const vaga = {
                processo_id: PROCESSO_ID,
                municipio: limparTexto(data['MUNICIPIO']),
                dre: limparTexto(data['DRE']),
                cargo: limparTexto(data['CARGO/FUNÇÃO'] || data['ATIVIDADE']),
                escola_lotacao: limparTexto(data['ÚLTIMA LOTAÇÃO?']),
                status: limparTexto(data['STATUS']) === 'NAO CONTEMPLADO' ? 'disponivel' : 'ocupada',
                data_vacancia: converterData(data['VACANCIA']),
                observacao: limparTexto(data['OBSERVAÇÃO'])
            };

            if (vaga.cargo && vaga.municipio) {
                resultados.push(vaga);
            }
        })
        .on('end', async () => {
            if (resultados.length > 0) {
                // Inserção em lotes (chunks) para não sobrecarregar
                const batchSize = 100;
                for (let i = 0; i < resultados.length; i += batchSize) {
                    const lote = resultados.slice(i, i + batchSize);
                    const { error } = await supabase.from('vagas').insert(lote);

                    if (error) {
                        console.error(`❌ Erro no lote ${i}:`, error.message);
                    } else {
                        console.log(`✅ Lote ${i / batchSize + 1} inserido (${lote.length} vagas).`);
                    }
                }
                console.log(`🏁 Migração de Vagas concluída! Total: ${resultados.length}`);
            } else {
                console.log("⚠️ Nenhuma vaga válida encontrada para inserir.");
            }
        });
}

async function migrarCandidatos() {
    console.log("🚀 Iniciando migração de CANDIDATOS...");
    const resultados = [];
    const caminhoArquivo = path.join(__dirname, 'candidatos.csv');

    if (!fs.existsSync(caminhoArquivo)) {
        console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
        return;
    }

    fs.createReadStream(caminhoArquivo)
        .pipe(csv())
        .on('data', (data) => {
            const candidato = {
                processo_id: PROCESSO_ID,
                nome_completo: limparTexto(data['CANDIDATO']),
                cpf: limparTexto(data['CPF']),
                municipio_inscricao: limparTexto(data['MUNICIPIO']),
                cargo_inscricao: limparTexto(data['CARGO']),
                status_geral: 'contratado'
            };

            if (candidato.nome_completo && candidato.cpf) {
                resultados.push(candidato);
            }
        })
        .on('end', async () => {
            if (resultados.length > 0) {
                const batchSize = 100;
                for (let i = 0; i < resultados.length; i += batchSize) {
                    const lote = resultados.slice(i, i + batchSize);
                    const { error } = await supabase.from('candidatos').insert(lote);

                    if (error) {
                        console.error(`❌ Erro no lote ${i}:`, error.message);
                    } else {
                        console.log(`✅ Lote ${i / batchSize + 1} inserido (${lote.length} candidatos).`);
                    }
                }
                console.log(`🏁 Migração de Candidatos concluída! Total: ${resultados.length}`);
            } else {
                console.log("⚠️ Nenhum candidato válido encontrado.");
            }
        });
}

// --- EXECUÇÃO ---
migrarVagas();
// migrarCandidatos();
