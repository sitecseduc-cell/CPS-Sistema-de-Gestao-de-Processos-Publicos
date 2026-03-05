import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';

const dir = path.join(process.cwd(), 'test_data');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// ─── Configurações Básicas ────────────────────────────────────────────────────────
const MUNICIPIOS_EXCLUIDOS = ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Abaetetuba', 'Barcarena', 'Benevides'];
const MUNICIPIOS_INTERIOR = ['Castanhal', 'Cametá', 'Bragança', 'Tucuruí', 'Paragominas', 'Itaituba', 'Breves', 'Altamira', 'Redenção', 'Oriximiná', 'Tailândia', 'Moju', 'Novo Repartimento', 'Capanema', 'Santa Izabel do Pará'];

const TAGS_EXCLUSAO = ['Indígena', 'Quilombola', 'CEEJA', 'SOME', 'Antonio Carlos'];
const TAGS_COMUNS = ['Estadual', 'Padre', 'Professora', 'Doutor', 'São', 'Santa'];

const DRES = ['DRE 1', 'DRE 2', 'DRE 3', 'DRE 4', 'DRE 5'];

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gerar_nome_escola(tipo) {
    if (tipo === 'excluida') {
        const tag = randomChoice(TAGS_EXCLUSAO);
        const ref = randomChoice(['da Aldeia', 'do Rio', 'Central', 'Nova', 'Esperança']);
        return `Escola ${tag} ${ref} ${randomInt(1, 100)}`;
    } else {
        const tag = randomChoice(TAGS_COMUNS);
        const ref = randomChoice(['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues']);
        return `EEEM ${tag} ${ref} ${randomInt(1, 500)}`;
    }
}

function gerar_planilha(nome_arquivo, num_linhas, prob_exclusao_municipio, prob_exclusao_nome, prob_zero_alunos) {
    const dados = [];

    for (let i = 0; i < num_linhas; i++) {
        const isExclusaoMun = Math.random() < prob_exclusao_municipio;
        const municipio = isExclusaoMun ? randomChoice(MUNICIPIOS_EXCLUIDOS) : randomChoice(MUNICIPIOS_INTERIOR);

        const isExclusaoNome = Math.random() < prob_exclusao_nome;
        const nome = gerar_nome_escola(isExclusaoNome ? 'excluida' : 'comum');

        let alunos = 0;
        if (Math.random() >= prob_zero_alunos) {
            const rand_aluno = Math.random();
            if (rand_aluno < 0.5) alunos = randomInt(50, 700);
            else if (rand_aluno < 0.8) alunos = randomInt(701, 999);
            else alunos = randomInt(1000, 3500);
        }

        const localizacao = randomChoice(['Urbana', 'Rural']);
        const dre = randomChoice(DRES);

        dados.push({
            'Escola': nome,
            'Municipio': municipio,
            'DRE': dre,
            'Localizacao': localizacao,
            'Total Alunos': alunos
        });
    }

    const ws = xlsx.utils.json_to_sheet(dados);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Escolas");

    const caminho = path.join(dir, nome_arquivo);
    xlsx.writeFile(wb, caminho);
    console.log(`Planilha '${nome_arquivo}' gerada com ${num_linhas} registros.`);
}

// ─── Geração das 3 Planilhas ──────────────────────────────────────────────────

// ─── Geração da Planilha Única ──────────────────────────────────────────────────

// Planilha Única: Mistura todos os cenários com ~1000 escolas
gerar_planilha("Planilha_Convocacao_1000_Escolas.xlsx", 1000, 0.15, 0.15, 0.05);

console.log("Processo finalizado!");
