import React, { useState } from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { executarAnalise } from '../utils/algoritmoConvocacao';
import { 
  Upload, FileUp, CheckCircle, Search, FileDown, Eye, X, AlertTriangle 
} from 'lucide-react';

export default function VagasEspeciais() {
  const [dadosForm, setDadosForm] = useState([]);
  const [dadosMestra, setDadosMestra] = useState([]);
  const [resultados, setResultados] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  
  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);

  const handleUpload = (e, setEstado) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true, // Evita linhas vazias que quebram o código
        complete: (results) => setEstado(results.data),
        encoding: "UTF-8"
      });
    }
  };

  const processar = () => {
    if (dadosForm.length === 0 || dadosMestra.length === 0) {
      alert("⚠️ Atenção: Suba os dois arquivos CSV primeiro!");
      return;
    }
    try {
      const analise = executarAnalise(dadosForm, dadosMestra);
      setResultados(analise);
    } catch (error) {
      console.error("Erro ao processar:", error);
      alert("Erro ao processar os dados. Verifique se os arquivos CSV estão corretos.");
    }
  };

  // Filtragem segura
  const resultadosFiltrados = resultados?.filter(cand => {
    if (!termoBusca) return true;
    const busca = termoBusca.toLowerCase();
    const nome = cand.NOME ? cand.NOME.toLowerCase() : '';
    const cpf = cand.CPF_FORMATADO ? String(cand.CPF_FORMATADO) : '';
    const vaga = cand.VAGA ? cand.VAGA.toLowerCase() : '';
    
    return nome.includes(busca) || cpf.includes(busca) || vaga.includes(busca);
  });

  // Gerar PDF
  const gerarPDF = () => {
    if (!resultadosFiltrados || resultadosFiltrados.length === 0) {
      alert("Sem dados para exportar.");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.text("Relatório de Convocação Especial - PSS 03/2024", 14, 15);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Total de Registros: ${resultadosFiltrados.length}`, 14, 27);

      // Tabela
      const tabelaDados = resultadosFiltrados.map(c => [
        c.COLOCACAO,
        c.STATUS_FINAL,
        c.NOME,
        c.VAGA,
        c.PONTUACAO_OFICIAL,
        c.MUNICIPIO_ORIGEM
      ]);

      doc.autoTable({
        head: [['#', 'Status', 'Nome', 'Vaga', 'Nota', 'Origem']],
        body: tabelaDados,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }, // Azul
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });

      doc.save("relatorio_convocacao.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente filtrar menos dados.");
    }
  };

  const abrirDetalhes = (candidato) => {
    setCandidatoSelecionado(candidato);
    setModalAberto(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Convocação Especial 🎯</h1>
          <p className="text-slate-500">Análise de vagas remanescentes (PSS 03/2024)</p>
        </div>
      </div>

      {/* Uploads */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-xl border-2 border-dashed transition-all ${dadosForm.length > 0 ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <FileUp size={20} className="text-slate-400"/> 1. Formulário (Respostas)
            </h3>
            {dadosForm.length > 0 && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">{dadosForm.length} regs</span>}
          </div>
          <input type="file" accept=".csv" onChange={(e) => handleUpload(e, setDadosForm)} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
        </div>

        <div className={`p-5 rounded-xl border-2 border-dashed transition-all ${dadosMestra.length > 0 ? 'border-purple-300 bg-purple-50' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Upload size={20} className="text-slate-400"/> 2. Base Mestra (Original)
            </h3>
            {dadosMestra.length > 0 && <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-bold">{dadosMestra.length} regs</span>}
          </div>
          <input type="file" accept=".csv" onChange={(e) => handleUpload(e, setDadosMestra)} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" />
        </div>
      </div>

      <button onClick={processar} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99]">
        RODAR ANÁLISE COMPLETA
      </button>

      {/* Resultados */}
      {resultados && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Barra de Ferramentas */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Filtrar por nome, vaga ou CPF..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            
            <button onClick={gerarPDF} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <FileDown size={18} /> Exportar PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Candidato</th>
                  <th className="px-6 py-3 text-left">Vaga</th>
                  <th className="px-6 py-3 text-left">Nota</th>
                  <th className="px-6 py-3 text-left">Local</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resultadosFiltrados.map((cand, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${
                    cand.STATUS_FINAL === 'HABILITADO' ? 'bg-green-50/30' : ''
                  }`}>
                    <td className="px-6 py-4 font-bold text-slate-700">{cand.COLOCACAO}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        cand.STATUS_FINAL === 'HABILITADO' ? 'bg-green-100 text-green-700 border-green-200' :
                        cand.STATUS_FINAL === 'DESABILITADO' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {cand.STATUS_FINAL}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{cand.NOME}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={cand.VAGA}>{cand.VAGA}</td>
                    <td className="px-6 py-4 font-mono">{cand.PONTUACAO_OFICIAL}</td>
                    <td className="px-6 py-4">
                      {cand.SCORE_GEO === 100 && <span className="text-green-600 font-bold text-xs">LOCAL</span>}
                      {cand.SCORE_GEO === 50 && <span className="text-blue-600 font-bold text-xs">VIZINHO</span>}
                      {cand.SCORE_GEO === 0 && <span className="text-slate-400 text-xs">DISTANTE</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => abrirDetalhes(cand)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {resultadosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                      Nenhum candidato encontrado com esse filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalAberto && candidatoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg">Detalhes do Candidato</h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-lg border flex items-center gap-3 ${
                candidatoSelecionado.STATUS_FINAL === 'HABILITADO' ? 'bg-green-50 border-green-200 text-green-800' :
                candidatoSelecionado.STATUS_FINAL === 'DESABILITADO' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                {candidatoSelecionado.STATUS_FINAL === 'HABILITADO' && <CheckCircle size={24} />}
                {candidatoSelecionado.STATUS_FINAL === 'DESABILITADO' && <AlertTriangle size={24} />}
                <div>
                  <p className="font-bold text-sm uppercase">{candidatoSelecionado.STATUS_FINAL}</p>
                  <p className="text-xs opacity-90">{candidatoSelecionado.MOTIVO || 'Candidato apto para convocação.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                  <p className="font-medium text-slate-800">{candidatoSelecionado.NOME}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">CPF</label>
                  <p className="font-medium text-slate-800">{candidatoSelecionado.CPF_FORMATADO}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Vaga</label>
                  <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">{candidatoSelecionado.VAGA}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-700 mb-3 text-sm">Dados Originais</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-xs text-slate-400">Pontuação</label>
                    <p className="font-mono font-bold">{candidatoSelecionado.PONTUACAO_OFICIAL}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Origem</label>
                    <p className="font-bold">{candidatoSelecionado.MUNICIPIO_ORIGEM}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Score Geo</label>
                    <p className="font-bold">{candidatoSelecionado.SCORE_GEO}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}