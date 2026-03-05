const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const filepath = path.join(process.cwd(), 'test_data', 'Planilha_Convocacao_1000_Escolas.xlsx');
const workbook = xlsx.readFile(filepath);
const firstSheet = workbook.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

// ─── Regras de Negócio (Espelho do Convocacao.jsx) ───
const normalize = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

let totais = {
    lidas: 0,
    excluidasPorNome: 0,
    excluidasPorMunicipio: 0,
    excluidasPorZeroAlunos: 0,
    validas: 0,
    porNivel: { 1: 0, 2: 0, 3: 0 },
    porPorte: { 'Pequeno Porte': 0, 'Médio Porte (Tipo A)': 0, 'Médio Porte (Tipo B)': 0, 'Grande Porte': 0 },
    demandaGrande: 0,
    escolasParaCompartilhar: 0,
    demandaCompartilhada: 0,
    demandaTotal: 0
};

const excluidasMun = ['belém', 'belem', 'ananindeua', 'santarém', 'santarem', 'marabá', 'maraba', 'abaetetuba', 'barcarena', 'benevides'];

for (const row of rows) {
    totais.lidas++;

    const nome = String(row['Escola']).trim();
    const municipio = String(row['Municipio']).trim();
    const area = String(row['Localizacao']).trim();
    const alunos = Number(row['Total Alunos']) || 0;

    const nomeNorm = normalize(nome);
    const munNorm = normalize(municipio);
    const areaNorm = normalize(area);

    // 1. Exclusão Nome
    if (nomeNorm.includes('indigena') || nomeNorm.includes('quilombola') || nomeNorm.includes('ceeja') || nomeNorm.includes('some') || nomeNorm.includes('antonio carlos')) {
        totais.excluidasPorNome++;
        continue;
    }

    // 2. Exclusão Alunos
    if (alunos === 0) {
        totais.excluidasPorZeroAlunos++;
        continue;
    }

    // NOTA: No código do Convocacao.jsx (linha 391 em diante do processado), os polos metropolitanos SÃO LIDOS 
    // mas na exibição (rankingEscolas linha 150) recebem Nível 3 ("Não Prioritário"). 
    // Então, elas ENTRAM na conta de validas, mas não são prioridade.
    totais.validas++;

    // Ranking Geográfico
    const isMetropole = excluidasMun.some(ex => munNorm === ex);
    let nivel = 2; // Interior Urbano

    if (isMetropole) {
        nivel = 3;
    } else if (areaNorm.includes('rural')) {
        nivel = 1;
    }
    totais.porNivel[nivel]++;

    // Porte
    let porte = 'Pequeno Porte';
    if (alunos > 999) porte = 'Grande Porte';
    else if (alunos > 700) porte = 'Médio Porte (Tipo B)';
    // Tipo A não cai na config atual do gerador, mas mantemos o map

    totais.porPorte[porte]++;

    // Demandas (Regra: 1 p/ 3 menores, 1 p/ 1000 alunos no maior)
    if (porte === 'Grande Porte') {
        const psi = Math.ceil(alunos / 1000);
        totais.demandaGrande += psi;
    } else {
        totais.escolasParaCompartilhar++;
    }
}

totais.demandaCompartilhada = Math.ceil(totais.escolasParaCompartilhar / 3);
totais.demandaTotal = totais.demandaGrande + totais.demandaCompartilhada;

console.log("=== ANÁLISE COMPLETA (SIMULAÇÃO DO MOTOR) ===\n");
console.log(`Total de Linhas no Arquivo: ${totais.lidas}`);
console.log(`\n--- EXCLUSÕES (IGNORADAS PELO SISTEMA) ---`);
console.log(`- Escolas Indígenas/CEEJA/SOME/etc: ${totais.excluidasPorNome}`);
console.log(`- Escolas com 0 Alunos: ${totais.excluidasPorZeroAlunos}`);

console.log(`\n--- DADOS VÁLIDOS ENVIADOS AO MOTOR ---`);
console.log(`Escolas Válidas Processadas: ${totais.validas}`);

console.log(`\n--- RANKING DE PRIORIDADES GEOGRÁFICAS ---`);
console.log(`🥇 Nível 1 - Prioridade Máxima (Zonas Rurais): ${totais.porNivel[1]}`);
console.log(`🥈 Nível 2 - Prioridade Alta (Cidades do Interior): ${totais.porNivel[2]}`);
console.log(`🥉 Nível 3 - Não Prioritário (Polos e Metrópoles): ${totais.porNivel[3]}`);

console.log(`\n--- PORTES (CLASSIFICAÇÃO POR ALUNOS) ---`);
console.log(`- Pequeno Porte (< 700): ${totais.porPorte['Pequeno Porte']}`);
console.log(`- Médio Porte B (701 - 999): ${totais.porPorte['Médio Porte (Tipo B)']}`);
console.log(`- Grande Porte (> 1000): ${totais.porPorte['Grande Porte']}`);

console.log(`\n--- ATRIBUIÇÃO DE PSICÓLOGOS (DEMANDA ESTIMADA) ---`);
console.log(`- Demanda Fixa (Grande Porte - 1 p/ 1000 alunos): ${totais.demandaGrande} psicólogos`);
console.log(`- Demanda Compartilhada (Pequenas/Médias - 1 p/ 3 escolas): ${totais.demandaCompartilhada} psicólogos`);
console.log(`> TOTAL DA DEMANDA ESTIMADA: ${totais.demandaTotal} psicólogos necessários.`);
