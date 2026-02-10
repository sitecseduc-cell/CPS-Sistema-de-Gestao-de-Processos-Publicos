import React from 'react';

const statusConfig = {
    // Status de Processos
    'Pendente': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
    'Em Análise': { color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
    'Aprovado': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    'Rejeitado': { color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
    'Concluído': { color: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-500' },
    // Prioridades
    'Urgente': { color: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse', dot: 'bg-rose-600' },
    'Alta': { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
    'Normal': { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

export default function StatusBadge({ status, size = 'md' }) {
    const config = statusConfig[status] || statusConfig['Normal'];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses} font-medium shadow-sm`}>
            <span className={`mr-1.5 h-2 w-2 rounded-full ${config.dot}`} aria-hidden="true" />
            {status}
        </span>
    );
}
