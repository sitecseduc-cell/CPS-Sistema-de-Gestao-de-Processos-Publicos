import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, Mail, Phone, Save, Edit, 
  User, MapPin, FileText, Clock, FileCheck, Eye 
} from 'lucide-react';
import CandidateTable from '../components/CandidateTable';
import { TableSkeleton, Spinner } from '../components/ui/Loading'; // Importando Skeletons e Spinner
import { CANDIDATOS_MOCK } from '../data/mockData';

export default function Inscritos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true); // Estado de loading inicial
  const [isSaving, setIsSaving] = useState(false); // Estado de salvamento

  // Simula carregamento inicial da página
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredCandidates = CANDIDATOS_MOCK.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm) ||
    c.processo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setEditData(candidate);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simula delay de salvamento no backend
    setTimeout(() => {
      alert(`Dados de ${editData.nome} salvos com sucesso!`);
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  if (selectedCandidate) {
    return (
      <div className="animate-fadeIn space-y-6 pb-10">
        {/* Header do Perfil */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedCandidate(null)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              <ChevronRight size={20} className="rotate-180 text-slate-600"/>
            </button>
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white shadow-md">
              {selectedCandidate.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedCandidate.nome}</h2>
              <p className="text-sm text-slate-500 font-mono">CPF: {selectedCandidate.cpf}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                selectedCandidate.status === 'Classificado' ? 'bg-emerald-100 text-emerald-700' : 
                selectedCandidate.status === 'Desclassificado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedCandidate.status}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50">
                  Cancelar
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Spinner size={18} className="mr-2" /> : <Save size={18} className="mr-2"/>}
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center shadow-lg shadow-blue-500/20">
                <Edit size={18} className="mr-2"/> Editar Dados
              </button>
            )}
          </div>
        </div>

        {/* ... Resto do código do perfil (pode manter o original ou adicionar Skeletons se quiser carregar detalhes separadamente) ... */}
        {/* Para simplificar, assumimos que os detalhes já estavam carregados na lista */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <User size={20} className="mr-2 text-blue-500"/> Dados Cadastrais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">E-mail</label>
                {isEditing ? (
                  <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full p-2 border border-blue-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                ) : (
                  <div className="flex items-center text-slate-800 font-medium p-2 bg-slate-50 rounded-lg border border-transparent"><Mail size={16} className="mr-2 text-slate-400"/> {selectedCandidate.email}</div>
                )}
              </div>
              {/* ... Outros campos (Telefone, Perfil, etc) ... */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Telefone / WhatsApp</label>
                {isEditing ? (
                  <input type="text" value={editData.telefone} onChange={(e) => setEditData({...editData, telefone: e.target.value})} className="w-full p-2 border border-blue-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                ) : (
                  <div className="flex items-center text-slate-800 font-medium p-2 bg-slate-50 rounded-lg border border-transparent"><Phone size={16} className="mr-2 text-slate-400"/> {selectedCandidate.telefone}</div>
                )}
              </div>
              {/* Mantive simplificado para não estender muito, mas o padrão é o mesmo */}
            </div>
          </div>
          {/* ... Coluna de Documentos ... */}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Inscritos</h2>
            <p className="text-slate-500 text-sm mt-1">Pesquise, visualize e gerencie os candidatos.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, CPF ou Processo..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <CandidateTable candidates={filteredCandidates} onSelect={handleSelectCandidate} />
        )}
      </div>
    </div>
  );
}