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

export const CANDIDATOS_MOCK = [
  { 
    id: 1, 
    nome: 'CARLOS OLIVEIRA DA SILVA', 
    cpf: '987.654.321-00', 
    email: 'carlos.silva@email.com', 
    telefone: '(91) 98877-6655', 
    processo: 'PSS 07/2025 - PROFESSOR', 
    cargo: 'Professor de Matemática',
    localidade: 'Belém - Escola Estadual A',
    status: 'Classificado',
    perfil: 'Ampla Concorrência',
    data_inscricao: '20/11/2025',
    documentos: ['RG', 'Diploma', 'Histórico', 'Título de Eleitor'],
    historico: [
      { data: '22/11/2025', evento: 'Inscrição Confirmada' },
      { data: '25/11/2025', evento: 'Documentação em Análise' },
      { data: '28/11/2025', evento: 'Documentação Aprovada' }
    ]
  },
  { 
    id: 2, 
    nome: 'ANA BEATRIZ SOUZA', 
    cpf: '123.456.789-11', 
    email: 'ana.bia@email.com', 
    telefone: '(91) 99111-2233', 
    processo: 'PSS Estagiários 06/2025', 
    cargo: 'Estagiário de Pedagogia',
    localidade: 'Ananindeua - Sede',
    status: 'Em Análise',
    perfil: 'PCD',
    data_inscricao: '10/09/2025',
    documentos: ['RG', 'Declaração de Matrícula', 'Laudo Médico'],
    historico: [
      { data: '10/09/2025', evento: 'Inscrição Realizada' }
    ]
  },
  { 
    id: 3, 
    nome: 'MARCOS VINICIUS COSTA', 
    cpf: '456.789.123-44', 
    email: 'marcos.v@email.com', 
    telefone: '(94) 98100-5544', 
    processo: 'PSS 07/2025 - PROFESSOR', 
    cargo: 'Professor de Física',
    localidade: 'Marabá - Escola B',
    status: 'Desclassificado',
    perfil: 'Cotista Racial',
    data_inscricao: '21/11/2025',
    documentos: ['RG', 'Diploma'],
    historico: [
      { data: '21/11/2025', evento: 'Inscrição Realizada' },
      { data: '30/11/2025', evento: 'Documentação Reprovada (Falta de Diploma)' }
    ]
  },
];