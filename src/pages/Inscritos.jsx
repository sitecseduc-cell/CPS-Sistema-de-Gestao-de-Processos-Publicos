import React, { useState, useEffect } from 'react';
import {
  Search, ChevronRight, Mail, Phone, Save, Edit,
  User, MapPin, FileText, Clock, FileCheck, Eye,
  Shield, CheckCircle, X, AlertTriangle, Loader, Plus
} from 'lucide-react';
import TableSkeleton from '../components/TableSkeleton';
import CandidateTable from '../components/CandidateTable';
import NewCandidateModal from '../components/NewCandidateModal';
import { Spinner } from '../components/ui/Loading';
import { supabase } from '../lib/supabaseClient';
import { fetchCandidatos } from '../services/candidatos';
import { toast } from 'sonner';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Inscritos() {
  const [inputValue, setInputValue] = useState('');
  const searchTerm = useDebounce(inputValue, 500);
  const [statusFilter, setStatusFilter] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca dados paginados/filtrados no backend
  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * pageSize;
        const data = await fetchCandidatos({
          limit: pageSize,
          offset,
          search: searchTerm,
          status: statusFilter
        });
        setFilteredData(data || []);

        // Busca o total count separadamente para a paginação correta (simplificado)
        let countQuery = supabase.from('candidatos').select('*', { count: 'exact', head: true });
        if (searchTerm) countQuery = countQuery.or(`nome_completo.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,rg.ilike.%${searchTerm}%`);
        if (statusFilter) countQuery = countQuery.eq('status', statusFilter);

        const { count } = await countQuery;
        setTotalCount(count || 0);

      } catch (error) {
        console.error('Erro ao buscar candidatos:', error);
        toast.error('Erro ao buscar candidatos');
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [searchTerm, statusFilter, page]);

  // Reseta a página quando muda a busca ou o filtro
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleAddCandidate = async (newCandidate) => {
    try {
      const { vaga, cpf, telefone, ...restCandidate } = newCandidate;

      // Clean masks
      const cleanCpf = cpf.replace(/\D/g, '');
      const cleanPhone = telefone ? telefone.replace(/\D/g, '') : '';

      const candidateToInsert = {
        ...restCandidate,
        cpf: cleanCpf,
        telefone: cleanPhone,
        vaga: vaga,
        processo: newCandidate.processo || 'Novo Processo Manual',
        localidade: 'A Definir',
        status: 'EM ANÁLISE', // Standardized uppercase
        // perfil: 'Manual',
        // pontuacao: 0.0,
        // documentos: [],
        // historico: [{ data: new Date().toLocaleDateString('pt-BR'), evento: 'Cadastro Manual', usuario: 'Admin' }]
      };

      const { data, error } = await supabase
        .from('candidatos')
        .insert([candidateToInsert])
        .select();

      if (error) {
        console.error('Erro ao cadastrar candidato:', error);
        throw error;
      }
      if (data && data.length > 0) {
        // Recarrega a página 1 para mostrar o novo candidato no topo
        setPage(1);
        setInputValue('');
        setStatusFilter('');
        toast.success('Candidato cadastrado com sucesso!');
      }
    } catch (e) {
      console.error(e);
      // Show actual error to help debugging schema issues
      toast.error(`Erro: ${e.message || e.details || 'Falha ao cadastrar'}`);
    }
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setEditData(candidate);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    const promise = new Promise((resolve) => setTimeout(resolve, 1000));
    toast.promise(promise, {
      loading: 'Salvando alterações...',
      success: () => {
        setFilteredData(prev => prev.map(c => c.id === editData.id ? editData : c));
        setSelectedCandidate(editData);
        setIsSaving(false);
        setIsEditing(false);
        return `Dados de ${editData.nome} salvos!`;
      },
      error: 'Erro ao salvar.'
    });
  };

  const handleStatusChange = (newStatus) => {
    if (window.confirm(`Mudar status para: ${newStatus}?`)) {
      const updated = { ...selectedCandidate, status: newStatus };
      setSelectedCandidate(updated);
      setFilteredData(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.success(`Status alterado para ${newStatus}`);
    }
  };

  if (selectedCandidate) {
    return (
      <div className="animate-fadeIn space-y-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedCandidate(null)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
              <ChevronRight size={20} className="rotate-180 text-slate-600" />
            </button>
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white shadow-md">
              {selectedCandidate.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedCandidate.nome}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">CPF: {selectedCandidate.cpf}</span>
                <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedCandidate.status}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Spinner size={18} className="mr-2" /> : <Save size={18} className="mr-2" />} Salvar
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center shadow-lg shadow-blue-500/20">
                <Edit size={18} className="mr-2" /> Editar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><User size={20} className="mr-2 text-blue-600" /> Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
                  {isEditing ? <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full p-2 border border-blue-300 rounded bg-blue-50" /> : <div className="text-slate-700 font-medium">{selectedCandidate.email}</div>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Telefone</label>
                  {isEditing ? <input type="text" value={editData.telefone} onChange={(e) => setEditData({ ...editData, telefone: e.target.value })} className="w-full p-2 border border-blue-300 rounded bg-blue-50" /> : <div className="text-slate-700 font-medium">{selectedCandidate.telefone}</div>}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Ações de Gestão</h3>
              <div className="flex gap-3">
                <button onClick={() => handleStatusChange('Classificado')} className="flex-1 py-3 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 flex justify-center items-center"><CheckCircle size={18} className="mr-2" /> Aprovar</button>
                <button onClick={() => handleStatusChange('Desclassificado')} className="flex-1 py-3 border border-red-200 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 flex justify-center items-center"><X size={18} className="mr-2" /> Reprovar</button>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Documentos</h3>
              <ul className="space-y-2">
                {selectedCandidate.documentos?.length > 0 ? selectedCandidate.documentos.map((doc, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 cursor-pointer">
                    <span className="flex items-center"><FileCheck size={16} className="mr-2 text-slate-400" /> {doc}</span>
                    <Eye size={16} className="text-slate-300" />
                  </li>
                )) : <p className="text-sm text-slate-400 italic">Nenhum documento anexado.</p>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Inscritos</h2>
            <p className="text-slate-500 text-sm mt-1">
              Gerenciando <strong className="text-slate-800">{totalCount}</strong> candidatos
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                {loading && inputValue !== searchTerm ? <Loader size={20} className="animate-spin text-blue-500" /> : <Search size={20} />}
              </div>
              <input
                type="text"
                placeholder="Nome, e-mail, CPF, RG..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
            >
              <option value="">Status: Todos</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Homologado">Homologado</option>
              <option value="Classificado">Classificado</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Com Pendência">Com Pendência</option>
              <option value="Desclassificado">Desclassificado</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus size={20} className="mr-2 hidden sm:block" /> <span className="whitespace-nowrap">Novo Candidato</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <TableSkeleton rows={10} cols={6} />
            </div>
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
      <NewCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCandidate}
      />
    </div>
  );
}