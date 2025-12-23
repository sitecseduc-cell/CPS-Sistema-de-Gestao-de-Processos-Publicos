import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import { supabase } from '../lib/supabaseClient'; // Importa o cliente real

// Estrutura vazia inicial
const INITIAL_COLUMNS = {
  planejamento: [],
  publicado: [],
  analise: [],
  homologacao: []
};

export default function Kanban() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [activeId, setActiveId] = useState(null); // ID do card sendo arrastado
  const [loading, setLoading] = useState(true);

  // 1. BUSCAR DADOS DO SUPABASE AO CARREGAR
  useEffect(() => {
    fetchKanbanCards();
  }, []);

  const fetchKanbanCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kanban_cards')
        .select('*');

      if (error) throw error;

      // Organiza os dados nas colunas corretas
      const newColumns = {
        planejamento: [],
        publicado: [],
        analise: [],
        homologacao: []
      };

      data.forEach(card => {
        // Se o status do card existir nas nossas colunas, adiciona ele lá
        if (newColumns[card.status]) {
          newColumns[card.status].push(card);
        } else {
          // Fallback: se não tiver status ou for inválido, joga para planejamento
          newColumns.planejamento.push(card);
        }
      });

      setColumns(newColumns);
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Descobre em qual coluna um card está
  const findColumn = (cardId) => {
    return Object.keys(columns).find((key) =>
      columns[key].some((item) => item.id === cardId)
    );
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // 2. LÓGICA DE PERSISTÊNCIA AO SOLTAR O CARD
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeCardId = active.id;
    const overColumnId = over?.id;

    // Cancelar se soltou fora ou no mesmo lugar
    if (!overColumnId) {
      setActiveId(null);
      return;
    }

    const sourceColumn = findColumn(activeCardId);
    if (sourceColumn === overColumnId) {
      setActiveId(null);
      return;
    }

    // --- OPTIMISTIC UPDATE (Atualiza visualmente antes do banco) ---
    const oldColumns = JSON.parse(JSON.stringify(columns)); // Backup para rollback

    setColumns((prev) => {
      const sourceItems = [...prev[sourceColumn]];
      const destItems = [...prev[overColumnId]];

      const cardIndex = sourceItems.findIndex(i => i.id === activeCardId);
      const [movedCard] = sourceItems.splice(cardIndex, 1);

      // Atualiza o objeto do card movido com o novo status
      const updatedCard = { ...movedCard, status: overColumnId };
      destItems.push(updatedCard);

      return {
        ...prev,
        [sourceColumn]: sourceItems,
        [overColumnId]: destItems,
      };
    });

    setActiveId(null);

    // --- ATUALIZAÇÃO NO SUPABASE ---
    try {
      const { error } = await supabase
        .from('kanban_cards')
        .update({ status: overColumnId })
        .eq('id', activeCardId);

      if (error) throw error;
      console.log(`Card ${activeCardId} movido para ${overColumnId} com sucesso.`);

    } catch (error) {
      console.error('Erro ao mover card no banco:', error);
      alert('Erro ao salvar alteração. Revertendo...');
      setColumns(oldColumns); // Rollback visual se der erro
    }
  };

  const activeItem = activeId ? Object.values(columns).flat().find(i => i.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-140px)] animate-fadeIn flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fluxo de Trabalho</h2>
          <p className="text-slate-500 text-sm">Gerencie o progresso dos processos seletivos.</p>
        </div>
        {/* Botão temporário para popular dados iniciais se a tabela estiver vazia */}
        <button
          onClick={async () => {
            await supabase.from('kanban_cards').insert([
              { title: 'PSS Matemática 2025', date: '20/12/2025', status: 'planejamento' },
              { title: 'PSS Merendeiras', date: '10/12/2025', status: 'publicado' },
              { title: 'Psicólogos Escolares', date: '30/11/2025', status: 'homologacao' }
            ]);
            fetchKanbanCards();
          }}
          className="text-xs text-blue-500 underline hover:text-blue-700"
        >
          Criar Dados de Teste
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-x-auto pb-4 custom-scrollbar">
            <KanbanColumn id="planejamento" title="Planejamento" items={columns.planejamento} colorHeader="bg-slate-200" />
            <KanbanColumn id="publicado" title="Edital Publicado" items={columns.publicado} colorHeader="bg-blue-200" />
            <KanbanColumn id="analise" title="Em Análise" items={columns.analise} colorHeader="bg-indigo-200" />
            <KanbanColumn id="homologacao" title="Homologado" items={columns.homologacao} colorHeader="bg-emerald-200" />
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="opacity-90 rotate-3 scale-105 pointer-events-none">
                <KanbanCard id={activeItem.id} title={activeItem.title} date={activeItem.date} color="border-blue-500" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}