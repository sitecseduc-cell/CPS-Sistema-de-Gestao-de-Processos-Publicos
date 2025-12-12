// --- DADOS DO DASHBOARD E PROCESSOS (Mantidos) ---
export const DASHBOARD_DATA = {
  kpis: {
    processos_ativos: 14,
    candidatos_total: 28450,
    vagas_preenchidas: "85%",
    alertas_criticos: 3
  },
  heatmap_dres: [
    { nome: 'DRE Belém', candidatos: 12500, status: 'crítico' },
    { nome: 'DRE Ananindeua', candidatos: 8200, status: 'alto' },
    { nome: 'DRE Castanhal', candidatos: 4500, status: 'medio' },
    { nome: 'DRE Marabá', candidatos: 3100, status: 'medio' },
  ],
  analises_criticas: [
    { id: 1, processo: 'PSS 07/2025', problema: 'Atraso na Análise Documental', setor: 'Comissão Avaliadora', tempo: '2 dias' },
    { id: 2, processo: 'PSS Estagiários', problema: 'Alto índice de recursos', setor: 'Jurídico', tempo: '5 horas' },
  ]
};

export const PROCESSOS_MOCK = [
  { id: 1, nome: 'PSS 07/2025 - PROFESSOR NIVEL SUPERIOR', periodo: '17/11/2025 - 14/12/2025', fase_atual: 'Análise Documental', progresso: 45, permitir_alteracao: false },
  { id: 2, nome: 'PSS Estagiários 06/2025', periodo: '08/09/2025 - 10/09/2025', fase_atual: 'Homologado', progresso: 100, permitir_alteracao: false },
  { id: 3, nome: 'PSS Estagiários-Bolsistas - ARCON 01/2025', periodo: '18/09/2025 - 23/09/2025', fase_atual: 'Recursos', progresso: 80, permitir_alteracao: false },
  { id: 4, nome: 'PSS ESTAGIÁRIOS - 05/2025', periodo: '11/08/2025 - 17/08/2025', fase_atual: 'Encerrado', progresso: 100, permitir_alteracao: false },
  { id: 5, nome: 'PSS SIMPLIFICADO 04/2025 - SECTET', periodo: '28/05/2025 - 08/06/2025', fase_atual: 'Entrevistas', progresso: 60, permitir_alteracao: false }
];

// --- GERADOR DE CANDIDATOS (Para testar paginação) ---
const nomes = ["Carlos", "Ana", "Marcos", "Julia", "Roberto", "Fernanda", "Lucas", "Beatriz", "Pedro", "Mariana"];
const sobrenomes = ["Silva", "Souza", "Costa", "Oliveira", "Pereira", "Lima", "Gomes", "Santos", "Martins", "Ferreira"];
const cargos = ["Professor de Matemática", "Professor de Língua Portuguesa", "Merendeira", "Vigia", "Técnico Administrativo"];
const statusList = ["Classificado", "Desclassificado", "Em Análise", "Cadastro de Reserva"];

export const CANDIDATOS_MOCK = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  nome: `${nomes[i % 10]} ${sobrenomes[i % 10]} ${sobrenomes[(i + 2) % 10]}`,
  cpf: `${100 + i}.***.***-${(i % 90) + 10}`,
  email: `candidato${i}@email.com`,
  telefone: `(91) 98${i}00-0000`,
  processo: `PSS 0${(i % 5) + 1}/2025 - GERAL`,
  cargo: cargos[i % 5],
  localidade: i % 2 === 0 ? 'Belém - Escola A' : 'Ananindeua - Escola B',
  status: statusList[i % 4],
  perfil: 'Ampla Concorrência',
  data_inscricao: '20/11/2025',
  documentos: ['RG', 'Diploma', 'Histórico'],
  historico: [{ data: '20/11/2025', evento: 'Inscrição Realizada', usuario: 'Sistema' }]
}));