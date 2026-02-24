import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import {
  Upload, FileUp, CheckCircle, ExternalLink, Sparkles, UserPlus, FileSpreadsheet, AlertTriangle, ArrowRight, UserCheck
} from 'lucide-react';

export default function VagasEspeciais() {
  const [file, setFile] = useState(null);
  const [analisando, setAnalisando] = useState(false);
  const [linkForms, setLinkForms] = useState('');

  // Estados para dados reais
  const [vagasLivres, setVagasLivres] = useState([]);
  const [candidatosCSV, setCandidatosCSV] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingDados, setLoadingDados] = useState(false);

  useEffect(() => {
    buscarVagasLivres();
  }, []);

  const buscarVagasLivres = async () => {
    setLoadingDados(true);
    try {
      // Busca apenas vagas 'VAGO' ou 'LIVRE'
      const { data, error } = await supabase
        .from('controle_vagas')
        .select('*')
        .in('status', ['VAGO', 'LIVRE'])
        .order('municipio', { ascending: true });

      if (error) throw error;
      setVagasLivres(data || []);
    } catch (error) {
      console.error('Erro ao buscar vagas livres:', error);
      toast.error('Não foi possível carregar as vagas livres.');
    } finally {
      setLoadingDados(false);
    }
  };

  const processarMatches = (candidatos) => {
    // Basic AI Matching Algorithm
    const novosMatches = [];
    const vagasDisponiveis = [...vagasLivres];
    const candUtilizados = new Set();

    candidatos.forEach(cand => {
      // Normaliza as chaves do CSV para suportar cabeçalhos variados
      const candNome = cand.Nome || cand.nome || cand.CANDIDATO || cand.candidato || '';
      const candCargo = cand.Cargo || cand.cargo || cand.FUNCAO || cand.funcao || '';
      const candCity = cand.Municipio || cand.municipio || cand.Localidade || cand.localidade || cand.CIDADE || '';

      if (!candNome || !candCargo) return; // Ignora linhas vazias

      // Procura a melhor vaga livre para ele
      let melhorVagaIndex = -1;
      let melhorScore = 0;

      for (let i = 0; i < vagasDisponiveis.length; i++) {
        const vaga = vagasDisponiveis[i];
        let score = 0;

        // Verifica compatibilidade de Cargo (Alta restrição)
        if (vaga.cargo_funcao?.toLowerCase().includes(candCargo.toLowerCase()) ||
          candCargo.toLowerCase().includes(vaga.cargo_funcao?.toLowerCase())) {
          score += 50;
        } else {
          continue; // Pula se o cargo for muito diferente
        }

        // Verifica compatibilidade de Localidade (Bônus Alto)
        if (vaga.municipio?.toLowerCase() === candCity.toLowerCase() ||
          candCity.toLowerCase().includes(vaga.municipio?.toLowerCase())) {
          score += 50;
        } else if (vaga.dre?.toLowerCase().includes(candCity.toLowerCase())) {
          score += 30; // Pontuação parcial se for na mesma regional
        }

        if (score > melhorScore) {
          melhorScore = score;
          melhorVagaIndex = i;
        }
      }

      // Se achou um match acima de 50
      if (melhorVagaIndex !== -1 && melhorScore > 0) {
        const vagaSelecionada = vagasDisponiveis[melhorVagaIndex];

        novosMatches.push({
          id: `${vagaSelecionada.id}-${candNome}`,
          vaga: vagaSelecionada,
          candidato: { nome: candNome, cargo: candCargo, municipio: candCity },
          score: melhorScore
        });

        // Remove a vaga da lista de livres para este cálculo
        vagasDisponiveis.splice(melhorVagaIndex, 1);
        candUtilizados.add(candNome);
      }
    });

    setMatches(novosMatches);
    setCandidatosCSV(candidatos.filter(c => !candUtilizados.has(c.Nome || c.nome)));
    setAnalisando(false);
    toast.success(`${novosMatches.length} cruzamentos (Matches) encontrados!`, { duration: 4000 });
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setAnalisando(true);
    setMatches([]);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const dados = results.data;
        processarMatches(dados);
      },
      error: function (error) {
        console.error("Erro no Papa Parse:", error);
        toast.error("Falha ao ler o arquivo CSV. Verifique a formatação do arquivo.");
        setAnalisando(false);
      }
    });
  };

  const handleAprovarMatch = async (match) => {
    const confirm = window.confirm(`Alocar "${match.candidato.nome}" na vaga de ${match.vaga.cargo_funcao} (${match.vaga.municipio})?`);
    if (!confirm) return;

    try {
      // 1. Atualizar Vaga no BD
      const { error: errorVaga } = await supabase
        .from('controle_vagas')
        .update({
          status: 'OCUPADO',
          atendido_candidato: match.candidato.nome,
          observacao: `Alocado via CSV Inteligente - Match ${match.score}%`
        })
        .eq('id', match.vaga.id);

      if (errorVaga) throw errorVaga;

      toast.success(`${match.candidato.nome} alocado com sucesso!`);

      // Remove o match da tela
      setMatches(prev => prev.filter(m => m.id !== match.id));
      buscarVagasLivres(); // Atualiza contador de vagas
    } catch (error) {
      toast.error('Erro ao alocar candidato na vaga.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">

      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">
            Recrutamento Inteligente 🎯
          </h1>
          <p className="text-slate-500 mt-1">Convocação especial cruzando CSV de classificados com Vagas Livres.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Link do Google Forms (Opcional)..."
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
            value={linkForms}
            onChange={(e) => setLinkForms(e.target.value)}
          />
          <a
            href={linkForms || "#"}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-white transition-all ${linkForms ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg shadow-purple-500/20' : 'bg-slate-300 cursor-not-allowed opacity-50'}`}
          >
            <ExternalLink size={18} /> Abrir
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Upload de CSV */}
        <div className="col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 border-dashed text-center flex flex-col justify-center h-full min-h-[300px] hover:border-purple-300 transition-colors group">
          <div className="mx-auto w-16 h-16 bg-purple-50 group-hover:bg-purple-100 transition-colors rounded-full flex items-center justify-center text-purple-600 mb-4">
            {analisando ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div> : <FileSpreadsheet size={32} />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Base de Candidatos</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Faça upload do CSV com os candidatos (Nome, Cargo, Municipio).
          </p>
          <label className="inline-flex items-center justify-center cursor-pointer px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl active:scale-95">
            <Upload size={18} className="mr-2" /> {analisando ? 'Lendo...' : 'Selecionar .CSV'}
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={analisando} />
          </label>
          {file && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-100">
              <CheckCircle size={14} /> {file.name}
            </div>
          )}
        </div>

        {/* Step 2: Stats Vagas Livres */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Sparkles size={250} />
          </div>

          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2 mb-2 z-10">
            <CheckCircle size={20} className="text-purple-600" /> Resumo do Sistema
          </h2>
          <p className="text-indigo-600 text-sm max-w-md z-10 mb-6">
            O algoritmo verifica as vagas cadastradas com status VAGO ou LIVRE na Secretaria e cruza com a planilha.
          </p>

          <div className="grid grid-cols-2 gap-4 z-10">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><CheckCircle size={24} /></div>
              <div>
                <div className="text-2xl font-black text-slate-800">{loadingDados ? '...' : vagasLivres.length}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vagas Livres Cadastradas</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><UserCheck size={24} /></div>
              <div>
                <div className="text-2xl font-black text-slate-800">{matches.length}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matches Perfeitos (CSV)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sugestões de Match (IA) - Somente exibe se tiver arquivo e houver array de matches */}
      {file && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Sugestões de Alocação</h2>
              <p className="text-slate-500 text-sm">Candidatos compatíveis encontrados na sua planilha para ocupar as vagas livres.</p>
            </div>
          </div>

          {matches.length === 0 && !analisando ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center">
              <AlertTriangle size={48} className="text-slate-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Nenhum Match Encontrado</h3>
              <p className="text-slate-500 max-w-sm">Os candidatos do CSV não possuem Cargo ou Município compatíveis com as vagas livres atuais do sistema.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map(match => (
                <div key={match.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center group">

                  {/* Info da Vaga */}
                  <div className="flex-1 w-full relative">
                    <div className="absolute -top-3 -left-2 bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-sm border border-indigo-200">Vaga Livre</div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-full pt-6">
                      <h4 className="font-bold text-slate-800">{match.vaga.cargo_funcao || match.vaga.cargo}</h4>
                      <div className="text-xs text-slate-500 mt-1 flex gap-2">
                        <span className="bg-white border px-2 py-0.5 rounded">{match.vaga.municipio}</span>
                        <span className="bg-white border px-2 py-0.5 rounded">Mat: {match.vaga.matvin || 'S/N'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seta Visual + Score */}
                  <div className="hidden md:flex flex-col items-center justify-center px-4 w-28 shrink-0 relative">
                    <ArrowRight size={24} className="text-slate-300 group-hover:text-purple-400 transition-colors" />
                    <div className={`absolute top-8 px-2 py-1 rounded text-xs font-black shadow-sm border
                        ${match.score >= 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        match.score >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}
                     `}>
                      {match.score >= 100 ? '100% MATCH' : `${match.score}% MATCH`}
                    </div>
                  </div>

                  {/* Info do Candidato (CSV) */}
                  <div className="flex-1 w-full relative">
                    <div className="absolute -top-3 -left-2 bg-purple-100 text-purple-700 text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-sm border border-purple-200">Candidato CSV</div>
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 h-full pt-6 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-purple-900">{match.candidato.nome}</h4>
                        <div className="text-xs text-purple-600 mt-1 flex gap-2 opacity-80">
                          <span className="bg-white/60 border border-purple-100 px-2 py-0.5 rounded">{match.candidato.cargo}</span>
                          <span className="bg-white/60 border border-purple-100 px-2 py-0.5 rounded">{match.candidato.municipio}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="w-full md:w-auto flex justify-center mt-2 md:mt-0 px-2 shrink-0">
                    <button
                      onClick={() => handleAprovarMatch(match)}
                      className="w-full flex justify-center items-center gap-2 px-6 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                    >
                      <UserPlus size={18} /> Alocar
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}