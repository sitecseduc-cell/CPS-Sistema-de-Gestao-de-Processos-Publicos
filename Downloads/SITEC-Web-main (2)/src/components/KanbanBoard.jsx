import React from 'react';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ processes, onEditProcess }) => {
    const columns = [
        { id: 'Pendente', title: 'Pendente', color: 'bg-yellow-500 border-yellow-500' },
        { id: 'Em Análise', title: 'Em Análise', color: 'bg-blue-500 border-blue-500' },
        { id: 'Aprovado', title: 'Aprovado', color: 'bg-emerald-500 border-emerald-500' },
        { id: 'Rejeitado', title: 'Rejeitado', color: 'bg-red-500 border-red-500' },
        { id: 'Concluído', title: 'Concluído', color: 'bg-gray-500 border-gray-500' },
    ];

    const getProcessesByStatus = (status) => {
        return processes.filter(p => p.status === status);
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-280px)] items-start">
            {columns.map(col => {
                const colProcesses = getProcessesByStatus(col.id);
                return (
                    <KanbanColumn
                        key={col.id}
                        title={col.title}
                        count={colProcesses.length}
                        processes={colProcesses}
                        onEditProcess={onEditProcess}
                        color={col.color}
                    />
                );
            })}
        </div>
    );
};

export default KanbanBoard;
