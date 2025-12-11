import React from 'react';
import { Clock, MoreHorizontal } from 'lucide-react';

export default function KanbanColumn({ title, items, color }) {
  const textColor = color.replace('bg-', 'text-').replace('100', '700');

  return (
    <div className="min-w-[280px] bg-slate-100 rounded-xl p-3 flex flex-col h-full mx-2 border border-slate-200">
      <div className={`flex items-center justify-between mb-3 px-3 py-2 ${color} bg-opacity-50 rounded-lg border border-slate-200/50`}>
        <h4 className={`font-bold text-sm ${textColor}`}>{title}</h4>
        <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 shadow-sm">{items.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar px-1">
        {items.map(item => (
          <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${item.delay ? 'border-red-500' : 'border-blue-500'} hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]`}>
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-slate-700 text-sm leading-snug">{item.title}</p>
              <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={16} /></button>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
              <span className={`text-xs flex items-center font-medium ${item.delay ? 'text-red-500 bg-red-50 px-2 py-1 rounded' : 'text-slate-400'}`}>
                <Clock size={12} className="mr-1.5" /> {item.due}
              </span>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600 shadow-sm">
                AS
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}