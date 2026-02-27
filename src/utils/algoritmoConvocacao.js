// ARQUIVO: src/utils/algoritmoConvocacao.js

const VIZINHOS = {
  'CASTANHAL': ['SANTA IZABEL DO PARA', 'MARITUBA', 'TERRA ALTA', 'SAO FRANCISCO DO PARA', 'CASTANHAL', 'IGARAPE-ACU'],
  'BELEM': ['ANANINDEUA', 'MARITUBA', 'BENEVIDES', 'SANTA BARBARA DO PARA', 'BELEM'],
  'ANANINDEUA': ['BELEM', 'MARITUBA', 'BENEVIDES', 'ANANINDEUA'],
  'DOM ELISEU': ['RONDON DO PARA', 'ULIANOPOLIS', 'ABEL FIGUEIREDO', 'DOM ELISEU'],
  'MELGAÇO': ['BREVES', 'PORTEL', 'BAGRE', 'MELGAÇO'],
  'BREVES': ['MELGAÇO', 'BAGRE', 'CURRALINHO', 'SAO SEBASTIAO DA BOA VISTA', 'BREVES'],
  'PIÇARRA': ['SAO GERALDO DO ARAGUAIA', 'XINGUARA', 'ELDORADO DO CARAJAS', 'PIÇARRA'],
  'MARABA': ['NOVA IPIXUNA', 'ITUPIRANGA', 'SAO DOMINGOS DO ARAGUAIA', 'MARABA']
};

const REGRAS_CARGO = {
  'NATURAIS': ['BIOLOGIA', 'FISICA', 'QUIMICA', 'CIENCIAS', 'NATUREZA'],
  'MATEMATICA': ['MATEMATICA'],
  'HUMANAS': ['HISTORIA', 'GEOGRAFIA', 'SOCIOLOGIA', 'FILOSOFIA', 'HUMANAS', 'ESTUDOS AMAZONICOS'],
  'LINGUAGENS': ['LINGUA PORTUGUESA', 'PORTUGUES', 'INGLES', 'ARTES', 'EDUCACAO FISICA', 'LINGUAGENS'],
  'AGRARIAS': ['AGRARIAS', 'AGRICOLA', 'ZOOTECNIA']
};

const limparTexto = (txt) => String(txt || '').toUpperCase().trim();
const limparCPF = (cpf) => String(cpf || '').replace(/\D/g, '');

const descobrirCidadeVaga = (textoVaga) => {
  const t = limparTexto(textoVaga);
  const cidades = ['DOM ELISEU', 'MELGAÇO', 'PIÇARRA', 'BREVES', 'CASTANHAL', 'ANANINDEUA', 'BELEM', 'MARABA', 'TUCURUI'];
  return cidades.find(c => t.includes(c)) || 'OUTROS';
};

const calcularScoreGeo = (vaga, origem) => {
  if (!origem || origem === 'NAN') return 0;
  if (origem === vaga) return 100;
  if (VIZINHOS[vaga]?.includes(origem)) return 50;
  return 0;
};

const verificarCompatibilidade = (vaga, cargo) => {
  const v = limparTexto(vaga);
  const c = limparTexto(cargo);
  if (!c || c === 'NAN') return { ok: false, motivo: "CARGO NÃO IDENTIFICADO" };

  for (const [area, aceitos] of Object.entries(REGRAS_CARGO)) {
    if (v.includes(area)) {
      const compativel = aceitos.some(aceito => c.includes(aceito));
      return compativel ? { ok: true, motivo: "COMPATÍVEL" } : { ok: false, motivo: `INCOMPATÍVEL (${area} x ${c})` };
    }
  }
  return { ok: true, motivo: "ANÁLISE MANUAL" };
};

export function executarAnalise(dadosFormulario, dadosBaseMestra) {
  const PRAZO_LIMITE = new Date("2025-12-09T23:59:59");
  
  // Mapear Base Mestra
  const mapaMestra = {};
  dadosBaseMestra.forEach(row => {
    // Tenta pegar CPF de várias formas para evitar erro
    const cpfRaw = row.cpf || row.CPF || row.Cpf || row['CPF'] || '';
    if (cpfRaw) {
      const cpf = limparCPF(cpfRaw);
      mapaMestra[cpf] = {
        municipio: row.municipio || row.MUNICIPIO || row['municipio'] || '',
        cargo: row.cargo || row.CARGO || row['cargo'] || '',
        pontuacao: parseFloat((row.pontuacao_total || row.PONTUACAO || '0').toString().replace(',', '.')),
        rank: parseInt(row.rank || row.RANK || '9999')
      };
    }
  });

  // Processar Inscrições
  let resultados = dadosFormulario.map(inscricao => {
    const cpfRaw = inscricao.CPF || inscricao.cpf || '';
    const cpf = limparCPF(cpfRaw);
    const dadosOriginais = mapaMestra[cpf];
    
    // Tratamento de data seguro
    let dataEnvio = new Date();
    try {
      const dataStr = inscricao['Carimbo de data/hora'] || inscricao['Timestamp'] || new Date().toISOString();
      dataEnvio = new Date(dataStr);
    } catch (e) {
      console.warn("Erro data:", e);
    }
    
    let candidato = {
      ...inscricao,
      NOME: inscricao['Nome do candidato'] || inscricao['NOME'] || 'DESCONHECIDO',
      CPF_FORMATADO: cpfRaw,
      VAGA: inscricao['Vaga que deseja concorrer'] || inscricao['VAGA'] || 'NÃO INFORMADA',
      STATUS_FINAL: 'EM ANÁLISE', // Status temporário
      STATUS_INTERNO: 'CLASSIFICADO',
      MOTIVO: '',
      SCORE_GEO: 0,
      PONTUACAO_OFICIAL: 0,
      MUNICIPIO_ORIGEM: 'N/A',
      DT_ENVIO: dataEnvio
    };

    if (dataEnvio > PRAZO_LIMITE) {
      candidato.STATUS_INTERNO = 'DESCLASSIFICADO';
      candidato.MOTIVO = 'FORA DO PRAZO';
    } else if (!dadosOriginais) {
      candidato.STATUS_INTERNO = 'DESCLASSIFICADO';
      candidato.MOTIVO = 'SEM NOTA/BASE';
    } else {
      candidato.MUNICIPIO_ORIGEM = limparTexto(dadosOriginais.municipio);
      candidato.CARGO_ORIGEM = limparTexto(dadosOriginais.cargo);
      candidato.PONTUACAO_OFICIAL = dadosOriginais.pontuacao;
      candidato.CLASSIFICACAO_OFICIAL = dadosOriginais.rank;
      
      const analiseCargo = verificarCompatibilidade(candidato.VAGA, candidato.CARGO_ORIGEM);
      if (!analiseCargo.ok) {
        candidato.STATUS_INTERNO = 'DESCLASSIFICADO';
        candidato.MOTIVO = analiseCargo.motivo;
      }
      const cidadeAlvo = descobrirCidadeVaga(candidato.VAGA);
      candidato.CIDADE_ALVO = cidadeAlvo;
      candidato.SCORE_GEO = calcularScoreGeo(cidadeAlvo, candidato.MUNICIPIO_ORIGEM);
    }
    return candidato;
  });

  // Ranking
  const classificados = resultados.filter(c => c.STATUS_INTERNO === 'CLASSIFICADO');
  classificados.sort((a, b) => {
    if (a.VAGA !== b.VAGA) return a.VAGA.localeCompare(b.VAGA);
    if (b.SCORE_GEO !== a.SCORE_GEO) return b.SCORE_GEO - a.SCORE_GEO;
    if (b.PONTUACAO_OFICIAL !== a.PONTUACAO_OFICIAL) return b.PONTUACAO_OFICIAL - a.PONTUACAO_OFICIAL;
    return a.CLASSIFICACAO_OFICIAL - b.CLASSIFICACAO_OFICIAL;
  });

  // Atribuir Status
  const contagemVaga = {};
  classificados.forEach(c => {
    if (!contagemVaga[c.VAGA]) contagemVaga[c.VAGA] = 0;
    contagemVaga[c.VAGA]++;
    c.COLOCACAO = contagemVaga[c.VAGA];
    c.STATUS_FINAL = c.COLOCACAO === 1 ? 'HABILITADO' : 'POSSÍVEL CHANCE';
  });

  const desclassificados = resultados.filter(c => c.STATUS_INTERNO !== 'CLASSIFICADO').map(c => ({
    ...c, COLOCACAO: '-', STATUS_FINAL: 'DESABILITADO'
  }));
  return [...classificados, ...desclassificados];
}