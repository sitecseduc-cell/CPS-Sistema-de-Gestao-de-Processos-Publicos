import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Upload, CheckCircle, FileSpreadsheet, AlertTriangle, UserPlus, MapPin, Target, Trophy, ArrowRight, UserCheck, Eye, X
} from 'lucide-react';

export default function VagasEspeciais() {
  const [file, setFile] = useState(null);
  const [analisando, setAnalisando] = useState(false);

  // Estados dos Dados
  const [vagasLivres, setVagasLivres] = useState([]);
  const [candidatosCSV, setCandidatosCSV] = useState([]);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [loadingDados, setLoadingDados] = useState(false);
  const [gerandoVagas, setGerandoVagas] = useState(false);

  // Estado para Confirmação Bonita
  const [modalConfirmacao, setModalConfirmacao] = useState({ isOpen: false, candidato: null });
  const [isAlocando, setIsAlocando] = useState(false);
  const [vinculoConcluido, setVinculoConcluido] = useState(false);

  // Estado para Visualizar Detalhes do Candidato
  const [modalDetalhes, setModalDetalhes] = useState({ isOpen: false, candidato: null });

  useEffect(() => {
    buscarVagasLivres();
  }, []);

  const buscarVagasLivres = async () => {
    setLoadingDados(true);
    try {
      const { data, error } = await supabase
        .from('controle_vagas')
        .select('*')
        .order('municipio', { ascending: true });

      if (error) throw error;

      // Filtra localmente para garantir case-insensitivity ('VAGO', 'vago', 'LIVRE', 'livre')
      const vagasFiltradas = (data || []).filter(v => {
        const st = v.status?.toUpperCase() || '';
        return st === 'VAGO' || st === 'LIVRE';
      });

      setVagasLivres(vagasFiltradas);
    } catch (error) {
      console.error('Erro ao buscar vagas livres:', error);
      toast.error('Não foi possível carregar as vagas livres.');
    } finally {
      setLoadingDados(false);
    }
  };

  const extrairValorNumerico = (valorStr) => {
    if (!valorStr) return 0;
    // Converte "15,5" ou "15.5" para número
    const num = parseFloat(String(valorStr).replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setAnalisando(true);
    setCandidatosCSV([]);
    setVagaSelecionada(null); // Reseta a vaga visualizada

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const dados = results.data.map(cand => ({
          ...cand,
          // Normaliza as chaves vitais
          nomeNormalizado: cand['NOME COMPLETO'] || cand['Nome'] || cand['nome'] || cand['Nome do Candidato'] || cand['NOME'] || '(Sem Nome Mapeado)',
          cargoNormalizado: cand.CARGO || cand.Cargo || cand.cargo || cand.FUNCAO || cand.Função || '',
          municipioNormalizado: cand.MUNICIPIO || cand.Municipio || cand.municipio || cand.LOCALIDADE || cand.Localidade || '',
          pontuacaoBase: extrairValorNumerico(cand['PONTUAÇÃO'] || cand.Pontuacao || cand.Nota || 0),
          idUnico: Math.random().toString(36).substring(7)
        })).filter(c => c.nomeNormalizado && c.cargoNormalizado); // Remove linhas vazias

        setCandidatosCSV(dados);
        setAnalisando(false);
        toast.success(`Planilha lida com sucesso: ${dados.length} candidatos carregados!`);
      },
      error: function (error) {
        console.error("Erro no Papa Parse:", error);
        toast.error("Falha ao ler o arquivo CSV. Verifique a formatação.");
        setAnalisando(false);
      }
    });
  };

  // Memoiza o ranking para a vaga atualmente selecionada
  const rankingAtual = useMemo(() => {
    if (!vagaSelecionada || candidatosCSV.length === 0) return [];

    const vgCargo = vagaSelecionada.cargo_funcao?.toLowerCase() || vagaSelecionada.cargo?.toLowerCase() || '';
    const vgMunicipio = vagaSelecionada.municipio?.toLowerCase() || '';

    // Extrair palavra-chave do cargo da vaga para cruzar com o CSV (ex: "matematica", "biologia")
    // Se a vaga é "Professor de Matemática", o CSV diz "REGULAR-PROFESSOR-MATEMATICA"
    const isCargoCompativel = (cargoVaga, cargoCand) => {
      if (!cargoVaga || !cargoCand) return false;
      const cv = cargoVaga.toLowerCase();
      const cc = cargoCand.toLowerCase();

      // Tentativa de achar especialidade em comum. 
      // Em uma aplicação de larga escala, um dicionário de equivalência seria ideal.
      const keywords = ['matematica', 'biologia', 'quimica', 'fisica', 'historia', 'geografia', 'portuguesa', 'artes', 'inglesa', 'sociologia', 'filosofia', 'educacao fisica'];

      let keywordEncontrada = null;
      for (const kw of keywords) {
        if (cv.includes(kw) || kw.includes(cv)) { // CV pode ser só a kw
          keywordEncontrada = kw;
          break;
        }
      }

      if (keywordEncontrada) {
        return cc.includes(keywordEncontrada);
      }

      // Fallback para similaridade direta
      return cv.includes(cc) || cc.includes(cv);
    };

    const candidatosAptos = candidatosCSV.map(cand => {
      let isValido = true;
      let percentualMatch = 0;
      let motivos = [];

      // 1. Competência (Cargo Exato) - Vale 30%
      const isComp = isCargoCompativel(vgCargo, cand.cargoNormalizado);
      if (!isComp) {
        motivos.push('⚠️ Aviso: Cargo divergente (-30%)');
      } else {
        percentualMatch += 30; // Bônus de Competência
        motivos.push('🎯 Cargo Compatível (+30%)');
      }

      const candMun = cand.municipioNormalizado.toLowerCase();

      // 2. Localidade (Município e DRE) - Vale 50% / Região 25%
      if (candMun === vgMunicipio || candMun.includes(vgMunicipio) || vgMunicipio.includes(candMun)) {
        percentualMatch += 50;
        motivos.push('📍 Município Exato (+50%)');
      } else if (cand.DRE && vgMunicipio && cand.DRE.toLowerCase().includes(vgMunicipio.split(' ')[0])) {
        percentualMatch += 25;
        motivos.push('🏢 Mesma Região/DRE (+25%)');
      }

      // 3. Nota Base da Prova - Max 20%
      let notaBaseNum = isNaN(cand.pontuacaoBase) ? 0 : Number(cand.pontuacaoBase);
      // Assumindo que a pontuação base máxima é 20 para mapear para 20%
      let pesoNota = (notaBaseNum / 20) * 20;
      if (pesoNota > 20) pesoNota = 20;

      percentualMatch += pesoNota;
      motivos.push(`📝 Nota: ${notaBaseNum} (+${pesoNota.toFixed(0)}%)`);

      percentualMatch = Math.round(percentualMatch);

      // Desclassifica sumariamente se o match for catastrófico (< 20% sem cargo/local)
      if (percentualMatch < 20) {
        isValido = false;
      }

      return {
        ...cand,
        isValido,
        scoreTotal: percentualMatch, // scoreTotal agora representa o percentualMatch
        motivos: motivos.join(' | ')
      };
    }).filter(c => c.isValido);

    // Ordena do maior Score para o menor
    return candidatosAptos.sort((a, b) => b.scoreTotal - a.scoreTotal);

  }, [vagaSelecionada, candidatosCSV]);

  // Prepara os dados pro gráfico do Recharts (Top 5)
  const chartData = useMemo(() => {
    return rankingAtual.slice(0, 5).map((cand, idx) => ({
      name: cand.nomeNormalizado.split(' ').slice(0, 2).join(' '), // Pega só o primeiro e segundo nome pra caber no eixo
      score: cand.scoreTotal,
      notaBase: cand.pontuacaoBase,
      isWinner: idx === 0,
      fullName: cand.nomeNormalizado
    }));
  }, [rankingAtual]);

  const openHomologarModal = (candidato) => {
    if (!vagaSelecionada) return;
    setModalConfirmacao({ isOpen: true, candidato });
  };

  const handleHomologar = async () => {
    const { candidato } = modalConfirmacao;
    if (!candidato || !vagaSelecionada) return;

    setIsAlocando(true);

    try {
      // Atualiza Vaga e FORÇA o retorno do dado pra ver se a RLS barrou
      const { data: updatedRows, error: errorVaga } = await supabase
        .from('controle_vagas')
        .update({
          status: 'OCUPADO',
          atendido_candidato: candidato.nomeNormalizado,
          observacao: `Homologado via CSV (Vagas Especiais) - Match: ${candidato.scoreTotal}%`
        })
        .eq('id', vagaSelecionada.id)
        .select();

      if (errorVaga) throw errorVaga;

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error("A vaga não pôde ser atualizada no banco de dados. Permissão Negada (RLS) ou vaga inexistente.");
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold text-emerald-600">🎉 ALOCAÇÃO CONCLUÍDA!</span>
          <span className="text-slate-700">O candidato <b>{candidato.nomeNormalizado}</b> foi vinculado à vaga com sucesso. Salvo no banco de dados!</span>
        </div>,
        { duration: 6000 }
      );

      // Remove a vaga da lista local
      setVagasLivres(prev => prev.filter(v => v.id !== vagaSelecionada.id));
      setVagaSelecionada(null); // Oculta o dashboard da vaga preenchida

      // Remove o candidato do CSV para ele não ser sugerido em outras vagas
      setCandidatosCSV(prev => prev.filter(c => c.idUnico !== candidato.idUnico));

      setModalConfirmacao({ isOpen: false, candidato: null });
      setVinculoConcluido(true);

      setTimeout(() => {
        setVinculoConcluido(false);
      }, 2500);

    } catch (error) {
      toast.error('Erro ao homologar candidato na vaga. Verifique permissões RLS ou conexão.');
      console.error(error);
    } finally {
      setIsAlocando(false);
    }
  };

  const getTrophyColor = (index) => {
    switch (index) {
      case 0: return 'text-amber-400 bg-amber-50 border-amber-200'; // Ouro
      case 1: return 'text-slate-400 bg-slate-50 border-slate-200'; // Prata
      case 2: return 'text-amber-700 bg-amber-50/50 border-amber-100'; // Bronze
      default: return 'text-indigo-400 bg-indigo-50 border-indigo-100'; // Outros
    }
  };

  const handleGerarVagas = async () => {
    if (candidatosCSV.length === 0) {
      toast.error('Nenhum dado de candidato carregado para gerar vagas.');
      return;
    }

    setGerandoVagas(true);

    try {
      // 1. Extrair combinações únicas de Cargo + Município
      const combinacoesUnicas = new Map();

      candidatosCSV.forEach(cand => {
        const cargo = cand.cargoNormalizado?.trim() || 'VAGA SEM CARGO';
        const mun = cand.municipioNormalizado?.trim() || 'MUNICÍPIO NÃO INFORMADO';

        // Chave única para evitar duplicados no próprio CSV
        const key = `${cargo.toUpperCase()}_${mun.toUpperCase()}`;
        if (!combinacoesUnicas.has(key)) {
          combinacoesUnicas.set(key, { cargo_funcao: cargo, municipio: mun, status: 'VAGO' });
        }
      });

      const vagasParaCriar = Array.from(combinacoesUnicas.values());

      if (vagasParaCriar.length === 0) {
        toast.info("Não há cargos/municípios identificáveis no CSV.");
        setGerandoVagas(false);
        return;
      }

      // 2. Filtrar as que já existem no banco (para não duplicar)
      // Buscamos todas para comparar localmente para evitar múltiplas queries
      const { data: todasVagasBanco, error: errBusca } = await supabase
        .from('controle_vagas')
        .select('cargo_funcao, municipio');

      if (errBusca) throw errBusca;

      const vagasNovas = vagasParaCriar.filter(novaVaga => {
        const jaExiste = todasVagasBanco.some(vagaBanco => {
          const m1 = (vagaBanco.municipio || '').toUpperCase();
          const m2 = novaVaga.municipio.toUpperCase();
          const c1 = (vagaBanco.cargo_funcao || '').toUpperCase();
          const c2 = novaVaga.cargo_funcao.toUpperCase();
          return m1 === m2 && c1 === c2;
        });
        return !jaExiste; // Retorna true só se NÃO existir
      });

      if (vagasNovas.length === 0) {
        toast.info(
          `Foram identificadas ${vagasParaCriar.length} combinações únicas, mas TODAS já estão cadastradas no Controle de Vagas!`,
          { duration: 4000 }
        );
        setGerandoVagas(false);
        return;
      }

      // 3. Inserir no banco de dados em Massa (Batch Insert)
      const payloadFormatado = vagasNovas.map(v => ({
        cargo_funcao: v.cargo_funcao,
        municipio: v.municipio,
        status: 'LIVRE', // Status inicial das vagas de convocação
        observacao: 'Auto-Gerado via Planilha de Vagas Especiais'
      }));

      const { data: insertedData, error: errInsert } = await supabase
        .from('controle_vagas')
        .insert(payloadFormatado)
        .select();

      if (errInsert) throw errInsert;

      toast.success(`SUCESSO! ${insertedData.length} Novas Vagas foram geradas a partir do CSV!`);

      // 4. Recarregar lista da esquerda
      await buscarVagasLivres();

    } catch (error) {
      console.error("Erro ao gerar vagas massivas:", error);
      toast.error("Ocorreu um erro ao tentar auto-gerar as vagas banco.");
    } finally {
      setGerandoVagas(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">

      {/* --- HEADER DO MÓDULO --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 mb-2">
            Análise de Vagas Especiais
          </h1>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Importe a planilha de Formulário preenchida pelos candidatos. O sistema isola os competidores adequados e ranqueia dando <strong className="text-purple-600">prioridade absoluta para a Localidade (Município)</strong> em relação à pontuação da prova.
          </p>
        </div>

        <div className="shrink-0 group">
          <label className={`inline-flex items-center justify-center cursor-pointer px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 border-2 
             ${file ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-slate-800 text-white border-transparent hover:bg-slate-700'}`}>
            {analisando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
            ) : file ? (
              <CheckCircle size={20} className="mr-2 text-indigo-500" />
            ) : (
              <Upload size={20} className="mr-2" />
            )}
            {analisando ? 'Lendo Dados...' : file ? 'Trocar Planilha CSV' : 'Subir Respostas .CSV'}
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={analisando} />
          </label>
        </div>
      </div>

      {!file && !analisando && (
        <div className="bg-slate-50/80 border border-slate-200 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <FileSpreadsheet size={64} className="text-slate-300 mb-6" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">Aguardando Planilha Base</h3>
          <p className="text-slate-500 max-w-sm mb-4">Para começar o ranqueamento, envie o arquivo de respostas do formulário na extensão .CSV.</p>
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl max-w-md text-sm font-medium border border-blue-100 flex items-start gap-3 text-left">
            <span className="text-xl">💡</span>
            <div>
              <strong>Dica Rápida:</strong> Se você for para o "Controle de Vagas" para ver o resultado agora, a planilha será limpa e você precisará enviá-la novamente. <br />
              Sugerimos <strong>Alocar todos os candidatos de uma vez</strong> nesta mesma tela, sem sair daqui, e só depois ir checar a tabela preenchida!
            </div>
          </div>
        </div>
      )}

      {/* --- INTERFACE DO DASHBOARD LADO-A-LADO --- */}
      {file && (
        <div className="flex flex-col xl:flex-row gap-6">

          {/* PAINEL ESQUERDO: LISTA DE VAGAS */}
          <div className="xl:w-1/3 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Target size={18} className="text-indigo-500" /> Vagas Livres Alvo
                </h3>
                <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full">{vagasLivres.length}</span>
              </div>

              <button
                onClick={handleGerarVagas}
                disabled={gerandoVagas || candidatosCSV.length === 0}
                className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm
                  ${gerandoVagas || candidatosCSV.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed hidden'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                  }`}
              >
                {gerandoVagas ? (
                  <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span> Gerando Vagas...</>
                ) : (
                  <><Target size={16} /> Auto-Gerar Vagas Planilha</>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loadingDados && <div className="text-center p-4 text-slate-400 text-sm">Carregando vagas do banco...</div>}

              {vagasLivres.length === 0 && !loadingDados && (
                <div className="text-center p-6 text-slate-400">Nenhuma vaga Livre ou Vaga cadastrada no sistema.</div>
              )}

              {vagasLivres.map(vaga => (
                <div
                  key={vaga.id}
                  onClick={() => setVagaSelecionada(vaga)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-95
                       ${vagaSelecionada?.id === vaga.id
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
                >
                  <div className="font-bold mb-1">{vaga.cargo_funcao || vaga.cargo}</div>
                  <div className={`text-xs flex items-center gap-1 ${vagaSelecionada?.id === vaga.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                    <MapPin size={12} /> {vaga.municipio}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAINEL DIREITO: DASHBOARD E GRÁFICOS */}
          <div className="xl:w-2/3 flex flex-col gap-6">

            {!vagaSelecionada ? (
              <div className="bg-white border border-slate-200 rounded-3xl h-[600px] flex flex-col items-center justify-center text-center p-8 shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
                  <ArrowRight size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Selecione uma Vaga ao Lado</h3>
                <p className="text-slate-500 mt-2 max-w-sm">O sistema cruzará os dados da planilha atual e mostrará o pódio de candidatos ideais para a vaga escolhida, priorizando a localidade.</p>
              </div>
            ) : (
              <>
                {/* Gráfico do Top 5 */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-[320px] flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Compatibilidade (Match %)</h3>
                    <p className="text-slate-500 text-xs">A porcentagem combina Localidade (50%), Cargo (30%) e Nota (20%).</p>
                  </div>

                  {rankingAtual.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                      <AlertTriangle size={32} className="text-amber-500 mb-2" />
                      <p className="text-sm font-bold">Nenhum candidato do CSV tem o Cargo exigido para esta vaga.</p>
                    </div>
                  ) : (
                    <div className="flex-1 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-sm">
                                    <div className="font-bold mb-1">{payload[0].payload.fullName}</div>
                                    <div className="text-emerald-400 font-black">Compatibilidade: {payload[0].value}%</div>
                                    <div className="text-slate-400 text-xs mt-1">Nota Base: {payload[0].payload.notaBase}</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.isWinner ? '#8b5cf6' : '#cbd5e1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Pódio e Detalhes dos Candidatos */}
                {rankingAtual.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[256px]">
                    {rankingAtual.slice(0, 3).map((cand, idx) => (
                      <div key={cand.idUnico} className={`bg-white border rounded-3xl p-5 shadow-sm flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md
                               ${idx === 0 ? 'border-purple-300 ring-2 ring-purple-500/20' : 'border-slate-200'}`}>

                        {idx === 0 && (
                          <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm z-10">
                            Recomendado
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border ${getTrophyColor(idx)} shrink-0`}>
                            {idx === 0 ? <Trophy size={18} /> : `${idx + 1}º`}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-bold truncate ${idx === 0 ? 'text-purple-900' : 'text-slate-800'}`}>
                              {cand.nomeNormalizado}
                            </h4>
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <MapPin size={10} /> {cand.municipioNormalizado}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-xs mb-4 border border-slate-100 overflow-y-auto custom-scrollbar">
                          <div className="text-slate-600 space-y-1">
                            {cand.motivos.split(' | ').map((m, i) => (
                              <div key={i} className="flex gap-1">
                                <span className="shrink-0">{m.includes('Bônus') ? '⭐' : '📝'}</span>
                                <span className={m.includes('Bônus') ? 'font-bold text-emerald-600' : 'text-slate-500'}>{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setModalDetalhes({ isOpen: true, candidato: cand })}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200"
                            title="Ver Respostas Completas"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => openHomologarModal(cand)}
                            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors
                                       ${idx === 0
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-slate-100/50 hover:bg-slate-200 text-slate-600 border border-slate-200'}`}
                          >
                            <UserCheck size={16} /> Alocar Aqui
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ALOCAÇÃO */}
      {modalConfirmacao.isOpen && modalConfirmacao.candidato && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-500 p-6 flex items-center justify-center text-white">
              <div className="bg-white/20 p-4 rounded-full">
                <UserCheck size={48} className="text-white drop-shadow-md" />
              </div>
            </div>

            <div className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-black text-slate-800">Confirmar Alocação?</h2>
              <p className="text-slate-500 leading-relaxed text-sm">
                Você está prestes a alocar <strong>{modalConfirmacao.candidato.nomeNormalizado}</strong> na vaga de <strong>{vagaSelecionada.cargo_funcao}</strong> em <strong className="text-indigo-600">{vagaSelecionada.municipio}</strong>.
              </p>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between text-left">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Compatibilidade</div>
                  <div className="font-black text-emerald-600 text-xl">{modalConfirmacao.candidato.scoreTotal}% Match</div>
                </div>
                <Trophy className="text-emerald-500 opacity-20" size={32} />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setModalConfirmacao({ isOpen: false, candidato: null })}
                  disabled={isAlocando}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleHomologar}
                  disabled={isAlocando}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAlocando ? (
                    <><span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> Salvando...</>
                  ) : (
                    <><CheckCircle size={18} /> Confirmar</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DO CANDIDATO */}
      {modalDetalhes.isOpen && modalDetalhes.candidato && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4 xl:p-0">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal Detalhes */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">
                    {modalDetalhes.candidato.nomeNormalizado}
                  </h2>
                  <p className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                    <MapPin size={12} /> {modalDetalhes.candidato.municipioNormalizado}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalDetalhes({ isOpen: false, candidato: null })}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content List Modal Detalhes */}
            <div className="overflow-y-auto p-6 flex-1 custom-scrollbar bg-slate-50/20">
              <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-800 text-lg">Pontuação de Match: {modalDetalhes.candidato.scoreTotal}%</h3>
                  <p className="text-emerald-600 text-sm">{modalDetalhes.candidato.motivos}</p>
                </div>
                <Trophy size={36} className="text-emerald-500 opacity-50" />
              </div>

              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-slate-400" />
                Respostas Originais do Formulário (CSV)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(modalDetalhes.candidato).map(([key, value]) => {
                  // Pula campos de controle criados pelo nosso sistema (isValido, idUnico, nomeNormalizado etc)
                  if (['isValido', 'idUnico', 'nomeNormalizado', 'cargoNormalizado', 'municipioNormalizado', 'pontuacaoBase', 'scoreTotal', 'motivos'].includes(key)) return null;

                  // Se o valor for vazio, pule
                  if (value === null || value === undefined || value === '') return null;

                  return (
                    <div key={key} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{key}</div>
                      <div className="text-slate-700 font-medium break-words text-sm">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Modal Detalhes */}
            <div className="p-4 border-t border-slate-100 bg-white rounded-b-3xl">
              <button
                onClick={() => setModalDetalhes({ isOpen: false, candidato: null })}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE VÍNCULO CONCLUÍDO */}
      {vinculoConcluido && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-emerald-500/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-white text-center animate-in zoom-in-50 duration-500 ease-out">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center animate-bounce-in">
              <CheckCircle size={64} className="text-white drop-shadow-lg" />
            </div>
            <h2 className="text-4xl font-black drop-shadow-lg">Vínculo Concluído!</h2>
            <p className="text-lg mt-2 drop-shadow-md">Candidato alocado com sucesso.</p>
          </div>
        </div>
      )}
    </div>
  );
}