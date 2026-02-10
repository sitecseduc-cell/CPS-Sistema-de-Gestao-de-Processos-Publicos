import React from 'react';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ title, count, processes, onEditProcess, color }) => {
    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full">
            <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${color} bg-opacity-10 border border-opacity-20`}>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
                <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    {count}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {processes.map(process => (
                    <KanbanCard
                        key={process.id}
                        process={process}
                        onEdit={onEditProcess}
                    />
                ))}
                {processes.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className="text-sm text-gray-400">Vazio</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
