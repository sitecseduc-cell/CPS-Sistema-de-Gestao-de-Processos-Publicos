import React from 'react';
import StatusBadge from './ui/StatusBadge';
import Icon from './Icon';

const KanbanCard = ({ process, onEdit }) => {
    return (
        <div
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onEdit(process)}
        >
            <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    #{process.id.substring(0, 8)}
                </span>
                <StatusBadge status={process.status} />
            </div>

            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2" title={process.title}>
                {process.title}
            </h4>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <Icon name="user" className="w-3 h-3" />
                <span className="truncate">{process.solicitante || 'Solicitante Desconhecido'}</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                <span>{process.dataSubmissao}</span>

                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    onClick={(e) => { e.stopPropagation(); onEdit(process); }}
                >
                    <Icon name="edit" className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default KanbanCard;
