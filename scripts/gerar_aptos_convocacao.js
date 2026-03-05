import xlsx from 'xlsx';

// Função auxiliar para gerar um CPF matematicamente válido (para testes de máscara se necessário, mas nosso sistema aceita qualquer 11 digitos)
function randomCpf() {
    const r = (min, max) => Math.floor(Math.random() * (max - min) + min);
    const m = (n) => {
        let rs = n % 11;
        return rs < 2 ? 0 : 11 - rs;
    };
    const c = Array.from({ length: 9 }, () => r(0, 9));
    let d1 = m(c.reduce((t, n, i) => t + n * (10 - i), 0));
    let d2 = m([...c, d1].reduce((t, n, i) => t + n * (11 - i), 0));
    return c.join('') + d1 + d2;
}

const nomes = [
    "Ana Silva", "Bruno Souza", "Carlos Almeida", "Daniela Costa", "Eduardo Pereira",
    "Fernanda Lima", "Gabriel Gomes", "Helena Ribeiro", "Igor Martins", "Juliana Carvalho",
    "Lucas Mendes", "Mariana Araújo", "Nicola Castro", "Olívia Nunes", "Paulo Rocha",
    "Quintino Dias", "Raquel Barbosa", "Samuel Pinto", "Tatiana Farias", "Ulisses Melo"
];

const totalRegistros = 50;
const dados = [];

// Header
dados.push(["CPF_CANDIDATO", "NOME_COMPLETO", "SITUACAO_PSS", "DATA_NASCIMENTO"]);

for (let i = 0; i < totalRegistros; i++) {
    const cpfFormatado = randomCpf().replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    const nome = nomes[Math.floor(Math.random() * nomes.length)] + " " + Math.floor(Math.random() * 100);

    dados.push([
        cpfFormatado,
        nome,
        "Apto PSS",
        `01/01/19${Math.floor(Math.random() * 40) + 60}` // 1960 a 1999
    ]);
}

// Também adiciona 2 CPFs do DEV/DEBUG caso o usuário precise testar com CPFs fáceis:
dados.push(["000.000.000-00", "USUARIO TESTE DEV ZERO", "Apto PSS", "01/01/1990"]);
dados.push(["111.111.111-11", "USUARIO TESTE DEV UM", "Apto PSS", "01/01/1990"]);

// Cria a planilha
const ws = xlsx.utils.aoa_to_sheet(dados);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Aptos Convocacao");

// Salva o arquivo na raiz
const fileName = "Planilha_Aptos_Teste_Convocacao.xlsx";
xlsx.writeFile(wb, fileName);

console.log(`Planilha gerada com sucesso! ${totalRegistros + 2} registros salvos em: ${fileName}`);
