const { read, utils } = require('xlsx');

const workbook = read('Escolas_Com_Psicologos_Por_DRE.xlsx', { type: 'file' });
const firstSheet = workbook.SheetNames[0];
const rows = utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

const normalize = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const processado = [];
const excluidas = [];

let totalAlunosIgnorados = 0;

for (const row of rows) {
    const keys = Object.keys(row);
    const getCol = (keyTags) => {
        const k = keys.find(kl => keyTags.some(tag => normalize(kl).includes(tag)));
        return k ? row[k] : null;
    };

    const nome = getCol(['escola', 'unidade', 'nome']);
    const municipio = getCol(['municipio', 'cidade']);
    const alunosVal = getCol(['aluno', 'matricula', 'total']);

    if (!nome || !alunosVal) continue;

    const nomeNorm = normalize(nome);

    let alunos = Number(alunosVal);
    if (isNaN(alunos)) alunos = 0;

    if (
        nomeNorm.includes('indigena') ||
        nomeNorm.includes('quilombola') ||
        nomeNorm.includes('ceeja') ||
        nomeNorm.includes('some') ||
        nomeNorm.includes('antonio carlos')
    ) {
        excluidas.push({
            escola: nome,
            municipio: municipio || 'N/A',
            alunos: alunos,
            motivo: nomeNorm.includes('indigena') ? 'Indígena'
                : nomeNorm.includes('quilombola') ? 'Quilombola'
                    : nomeNorm.includes('ceeja') ? 'CEEJA'
                        : nomeNorm.includes('some') ? 'SOME'
                            : 'Antônio Carlos'
        });
        totalAlunosIgnorados += alunos;
        continue;
    }
}

console.log("ESCOLAS EXCLUÍDAS PELAS REGRAS DE NEGÓCIO:");
console.log("------------------------------------------");
excluidas.forEach((e, i) => {
    console.log(`${i + 1}. ${e.escola} (${e.municipio}) - ${e.alunos} alunos [Motivo: ${e.motivo}]`);
});
console.log("------------------------------------------");
console.log(`Z Total de escolas ignoradas: ${excluidas.length}`);
console.log(`z Total de alunos ignorados: ${totalAlunosIgnorados}`);
