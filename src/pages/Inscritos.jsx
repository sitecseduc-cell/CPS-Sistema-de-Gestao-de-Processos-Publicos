import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, Mail, Phone, Save, Edit, 
  User, MapPin, FileText, Clock, FileCheck, Eye,
  Shield, CheckCircle, X, AlertTriangle, Loader2 
} from 'lucide-react';
import CandidateTable from '../components/CandidateTable';
import { TableSkeleton, Spinner } from '../components/ui/Loading';
import { CANDIDATOS_MOCK } from '../data/mockData';

// Hook personalizado para Debounce (Atraso na digitação)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Inscritos() {
  // Estados de Filtro e Paginação
  const [inputValue, setInputValue] = useState(''); // O que o usuário digita
  const searchTerm = useDebounce(inputValue, 500); // O termo que realmente filtra (após 500ms)
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Efeito para "Buscar no Servidor" (Simulado)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 600));

      // 1. Filtragem (Simula o .ilike do Supabase)
      const allFiltered = CANDIDATOS_MOCK.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.cpf.includes(searchTerm) ||
        c.processo.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setTotalCount(allFiltered.length);

      // 2. Paginação (Simula o .range() do Supabase)
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setFilteredData(allFiltered.slice(start, end));

      setLoading(false);
    };

    fetchData();
  }, [searchTerm, page]); // Roda sempre que a busca ou a página mudam

  // Resetar para página 1 se mudar a busca
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);


  // --- MANIPULADORES (Iguais ao anterior) ---
  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setEditData(candidate);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert(`Dados de ${editData.nome} salvos com sucesso!`);
      setSelectedCandidate(editData);
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleStatusChange = (newStatus) => {
    if(window.confirm(`Confirma alteração de status para: ${newStatus}?`)) {
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
    }
  };

  // --- RENDERIZAÇÃO ---

  // Visão Detalhada (360º) - Mantida a mesma lógica visual
  if (selectedCandidate) {
    return (
      <div className="animate-fadeIn space-y-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedCandidate(null)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
              <ChevronRight size={20} className="rotate-180 text-slate-600"/>
            </button>
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white shadow-md">
              {selectedCandidate.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedCandidate.nome}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-sm text-slate-500 font-mono">CPF: {selectedCandidate.cpf}</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                  selectedCandidate.status === 'Classificado' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>{selectedCandidate.status}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center shadow-lg shadow-emerald-500/20 disabled:opacity-70">
                  {isSaving ? <Spinner size={18} className="mr-2"/> : <Save size={18} className="mr-2"/>} {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center shadow-lg shadow-blue-500/20">
                <Edit size={18} className="mr-2"/> Editar Dados
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Dados Pessoais (Editável) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><User size={20} className="mr-2 text-blue-600"/> Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
                  {isEditing ? (
                    <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full p-2 border border-blue-300 rounded bg-blue-50"/>
                  ) : <div className="text-slate-700 font-medium">{selectedCandidate.email}</div>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Telefone</label>
                  {isEditing ? (
                    <input type="text" value={editData.telefone} onChange={(e) => setEditData({...editData, telefone: e.target.value})} className="w-full p-2 border border-blue-300 rounded bg-blue-50"/>
                  ) : <div className="text-slate-700 font-medium">{selectedCandidate.telefone}</div>}
                </div>
              </div>
            </div>
            
            {/* Card Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Ações de Gestão</h3>
              <div className="flex gap-3">
                <button onClick={() => handleStatusChange('Classificado')} className="flex-1 py-3 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 transition-colors flex justify-center items-center"><CheckCircle size={18} className="mr-2"/> Aprovar</button>
                <button onClick={() => handleStatusChange('Desclassificado')} className="flex-1 py-3 border border-red-200 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-colors flex justify-center items-center"><X size={18} className="mr-2"/> Reprovar</button>
              </div>
            </div>
          </div>

          {/* Lateral */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Documentos</h3>
              <ul className="space-y-2">
                {selectedCandidate.documentos?.map((doc, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 cursor-pointer">
                    <span className="flex items-center"><FileCheck size={16} className="mr-2 text-slate-400"/> {doc}</span>
                    <Eye size={16} className="text-slate-300"/>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visão Lista Principal
  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)]">
        
        {/* Barra de Busca com Debounce */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Inscritos</h2>
            <p className="text-slate-500 text-sm mt-1">
              Gerenciando <strong className="text-slate-800">{totalCount}</strong> candidatos
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {loading && inputValue !== searchTerm ? <Loader2 size={20} className="animate-spin text-blue-500"/> : <Search size={20} />}
            </div>
            <input 
              type="text" 
              placeholder="Buscar por Nome, CPF ou Processo..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela com Loading e Paginação */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <TableSkeleton rows={pageSize} />
          ) : (
            <CandidateTable 
              candidates={filteredData} 
              onSelect={handleSelectCandidate} 
              total={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}