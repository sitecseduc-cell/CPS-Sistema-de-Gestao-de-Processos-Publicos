import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

export default function KanbanCard({ id, title, date, color, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Hook que torna o elemento "arrastável"
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { id, title } // Metadados úteis se precisar
  });

  const style = {
    // Move o card visualmente conforme o mouse mexe
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : 1, // Garante que o item arrastado fique por cima
  };

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Evita iniciar drag (se bem que o botão já deve ter stopPropagation, mas só garantindo)
    setShowMenu(!showMenu);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${color} mb-3 group hover:shadow-md transition-all touch-none select-none`}
    >
      <div className="flex justify-between items-start mb-2">
        {/* Listeners apenas no título/corpo para arrastar, não no botão de menu */}
        <div {...listeners} className="flex-1 cursor-grab active:cursor-grabbing">
          <p className="font-semibold text-slate-700 text-sm leading-snug pr-2">{title}</p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="text-slate-300 hover:text-indigo-500 p-1 rounded-md hover:bg-slate-50 transition-colors"
            onPointerDown={(e) => e.stopPropagation()} // Importante para não iniciar o Drag ao clicar no menu
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 animate-fadeIn origin-top-right">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (onEdit) onEdit();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-left"
              >
                <Edit size={14} /> Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (onDelete) onDelete();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div {...listeners} className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 cursor-grab active:cursor-grabbing">
        <span className="text-xs flex items-center font-medium text-slate-400">
          <Calendar size={12} className="mr-1.5" /> {date}
        </span>
      </div>
    </div>
  );
}