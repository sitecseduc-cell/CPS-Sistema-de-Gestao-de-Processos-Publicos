import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import { supabase } from '../lib/supabaseClient';
import { useLocation } from 'react-router-dom';
import { Loader, Plus, Layers } from 'lucide-react';
import NewProcessModal from '../components/NewProcessModal';
import { toast } from 'sonner';

// --- CONFIGURAÇÃO KANBAN CANDIDATOS ---
const CANDIDATE_COLUMNS = {
  aguardando_envio: [],
  em_analise: [],
  pendencia: [],
  homologado: []
};

const CANDIDATE_STATUS_MAP = {
  'Classificado': 'aguardando_envio',
  'Em Análise': 'em_analise',
  'Com Pendência': 'pendencia',
  'Aprovado': 'homologado',
  'Homologado': 'homologado'
};

const MINIMAL_CANDIDATE_REVERSE_MAP = {
  'aguardando_envio': 'Classificado',
  'em_analise': 'Em Análise',
  'pendencia': 'Com Pendência',
  'homologado': 'Homologado'
};

// --- CONFIGURAÇÃO KANBAN PROCESSOS ---
const PROCESS_COLUMNS_KEYS = {
  planejamento: [],
  aberto: [],
  analise: [],
  finalizado: []
};

// Mapeamento Fase do Processo -> Coluna
const PROCESS_STATUS_MAP = {
  'Planejamento': 'planejamento',
  'Inscrições Abertas': 'aberto',
  'Em Análise': 'analise',
  'Finalizado': 'finalizado',
  'Homologado': 'finalizado'
};

// Mapeamento Inverso Coluna -> Fase do Processo
const PROCESS_REVERSE_MAP = {
  'planejamento': 'Planejamento',
  'aberto': 'Inscrições Abertas',
  'analise': 'Em Análise',
  'finalizado': 'Finalizado'
};

export default function Kanban() {
  const location = useLocation();

  // Se existir processId no state, estamos no modo "Candidatos de um Processo"
  // Caso contrário, estamos no modo "Fluxo de Processos" (Visão Geral)
  const processId = location.state?.processId;
  const processName = location.state?.processName || 'Todos os Processos';

  const isProcessMode = !processId;

  // State genérico para colunas (Candidatos ou Processos)
  const [columns, setColumns] = useState(isProcessMode ? PROCESS_COLUMNS_KEYS : CANDIDATE_COLUMNS);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal de Criação/Edição de Processo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (isProcessMode) {
      fetchProcessos();
    } else {
      fetchCandidates();
    }
  }, [processId, isProcessMode]);

  // --- FETCH PROCESSOS ---
  const fetchProcessos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      organizeProcessColumns(data);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      toast.error('Erro ao carregar fluxo de processos.');
    } finally {
      setLoading(false);
    }
  };

  const organizeProcessColumns = (data) => {
    const newColumns = { planejamento: [], aberto: [], analise: [], finalizado: [] };

    data.forEach(p => {
      // Normaliza status. Se não achar, joga em Planejamento.
      const statusKey = Object.keys(PROCESS_STATUS_MAP).find(k => k.toLowerCase() === (p.fase_atual || '').toLowerCase());
      const targetCol = PROCESS_STATUS_MAP[statusKey] || 'planejamento';

      if (newColumns[targetCol]) {
        newColumns[targetCol].push({
          id: p.id,
          title: p.nome,
          date: `Fase: ${p.fase_atual || 'Planejamento'}`,
          original: p // Mantém dados originais
        });
      }
    });
    setColumns(newColumns);
  };

  // --- FETCH CANDIDATES ---
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let query = supabase.from('candidatos').select('*').order('created_at', { ascending: false });

      if (processName && processName !== 'Todos os Processos') {
        query = query.ilike('processo', `%${processName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      organizeCandidateColumns(data);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeCandidateColumns = (candidates) => {
    const newColumns = { aguardando_envio: [], em_analise: [], pendencia: [], homologado: [] };
    candidates.forEach(c => {
      let colKey = Object.keys(CANDIDATE_STATUS_MAP).find(k => k.toLowerCase() === (c.status || '').toLowerCase());
      let targetCol = CANDIDATE_STATUS_MAP[colKey] || 'aguardando_envio';

      if (newColumns[targetCol]) {
        newColumns[targetCol].push({
          id: c.id,
          title: c.nome,
          date: c.cargo || c.processo,
          original: c
        });
      }
    });
    setColumns(newColumns);
  };

  // --- DRAG AND DROP ---
  const findColumn = (cardId) => Object.keys(columns).find((key) => columns[key].some((item) => item.id === cardId));

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeCardId = active.id;
    const overColumnId = over?.id;

    if (!overColumnId) { setActiveId(null); return; }

    const sourceColumn = findColumn(activeCardId);
    if (sourceColumn === overColumnId) { setActiveId(null); return; }

    // Atualização Otimista
    setColumns((prev) => {
      const sourceItems = [...prev[sourceColumn]];
      const destItems = [...prev[overColumnId]];
      const cardIndex = sourceItems.findIndex(i => i.id === activeCardId);
      const [movedCard] = sourceItems.splice(cardIndex, 1);

      // Atualiza label visual se movido
      if (isProcessMode) {
        movedCard.date = `Fase: ${PROCESS_REVERSE_MAP[overColumnId]}`;
      }

      destItems.push(movedCard);
      return { ...prev, [sourceColumn]: sourceItems, [overColumnId]: destItems };
    });

    setActiveId(null);

    // Persistência
    try {
      if (isProcessMode) {
        const newStatus = PROCESS_REVERSE_MAP[overColumnId];
        await supabase
          .from('processos')
          .update({ fase_atual: newStatus })
          .eq('id', activeCardId);
        toast.success(`Processo movido para ${newStatus}`);
      } else {
        const newStatus = MINIMAL_CANDIDATE_REVERSE_MAP[overColumnId];
        await supabase
          .from('candidatos')
          .update({ status: newStatus })
          .eq('id', activeCardId);
        toast.success(`Candidato atualizado para ${newStatus}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Falha ao salvar alteração.');
      // Reverter (reload simples por segurança)
      if (isProcessMode) fetchProcessos(); else fetchCandidates();
    }
  };

  // --- ACTIONS ---

  const handleEditItem = (item) => {
    if (isProcessMode) {
      setEditingItem(item.original);
      setIsModalOpen(true);
    } else {
      toast.info('Para editar candidato, utilize a página de Controle de Inscritos.');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${item.title}"?`)) return;

    try {
      if (isProcessMode) {
        const { error } = await supabase.from('processos').delete().eq('id', item.id);
        if (error) throw error;
        toast.success('Processo excluído com sucesso.');
        fetchProcessos(); // Refresh list
      } else {
        const { error } = await supabase.from('candidatos').delete().eq('id', item.id);
        if (error) throw error;
        toast.success('Candidato excluído com sucesso.');
        fetchCandidates(); // Refresh list
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item.');
    }
  };

  const handleSaveProcess = async (formData) => {
    try {
      if (editingItem) {
        // UPDATE
        const { error } = await supabase
          .from('processos')
          .update({
            nome: formData.nome,
            descricao: formData.descricao,
            inicio: formData.inicio || null,
            fim: formData.fim || null
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Processo atualizado!');
      } else {
        // CREATE
        const payload = {
          nome: formData.nome,
          descricao: formData.descricao,
          fase_atual: 'Planejamento',
          progresso: 0,
          inicio: formData.inicio || null,
          fim: formData.fim || null
        };

        const { error } = await supabase.from('processos').insert([payload]);
        if (error) throw error;
        toast.success('Processo criado com sucesso!');
      }

      setIsModalOpen(false);
      setEditingItem(null);
      fetchProcessos(); // Recarrega Kanban

    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      toast.error('Erro ao salvar processo.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  }

  const activeItem = activeId ? Object.values(columns).flat().find(i => i.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-140px)] animate-fadeIn flex flex-col relative px-4 md:px-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-600" />
            {isProcessMode ? 'Fluxo de Processos Seletivos' : 'Fluxo de Convocação'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isProcessMode
              ? 'Visualize e gerencie o andamento de todos os editais de forma didática.'
              : <span>Gerenciando candidatos do processo: <strong className="text-indigo-600">{processName}</strong></span>
            }
          </p>
        </div>

        {isProcessMode && (
          <button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>Novo PSS</span>
          </button>
        )}
      </div>

      {/* BOARD */}
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar h-full">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[320px] bg-slate-100/50 rounded-xl p-4 animate-pulse flex flex-col gap-4">
              <div className="h-6 w-1/2 bg-slate-200 rounded"></div>
              <div className="h-32 w-full bg-white rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex overflow-x-auto pb-4 gap-6 custom-scrollbar">
            {isProcessMode ? (
              <>
                <KanbanColumn id="planejamento" title="Planejamento" items={columns.planejamento} colorHeader="bg-slate-200 text-slate-700" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
                <KanbanColumn id="aberto" title="Inscrições Abertas" items={columns.aberto} colorHeader="bg-blue-200 text-blue-800" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
                <KanbanColumn id="analise" title="Em Análise" items={columns.analise} colorHeader="bg-amber-200 text-amber-800" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
                <KanbanColumn id="finalizado" title="Finalizado / Homologado" items={columns.finalizado} colorHeader="bg-emerald-200 text-emerald-800" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
              </>
            ) : (
              <>
                <KanbanColumn id="aguardando_envio" title="Classificados" items={columns.aguardando_envio} colorHeader="bg-slate-200" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
                <KanbanColumn id="em_analise" title="Em Análise" items={columns.em_analise} colorHeader="bg-blue-200" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
                <KanbanColumn id="pendencia" title="Pendência" items={columns.pendencia} colorHeader="bg-orange-200" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
                <KanbanColumn id="homologado" title="Homologado" items={columns.homologado} colorHeader="bg-emerald-200" onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
              </>
            )}
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="opacity-90 rotate-3 scale-105 pointer-events-none">
                <KanbanCard
                  id={activeItem.id}
                  title={activeItem.title}
                  date={activeItem.date}
                  color="border-indigo-500"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* MODAL DE CRIAÇÃO (Apenas modo Processo) */}
      <NewProcessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProcess}
        processoParaEditar={editingItem}
      />

    </div>
  );
}