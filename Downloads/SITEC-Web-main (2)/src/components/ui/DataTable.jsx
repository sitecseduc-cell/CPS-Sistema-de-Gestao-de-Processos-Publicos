import React from 'react';
import { TableSkeleton } from './Loading';
import Icon from '../Icon';

export default function DataTable({ columns, data, isLoading, onRowClick, emptyMessage = "Nenhum dado encontrado." }) {
    if (isLoading) {
        return <TableSkeleton rows={5} />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-gray-400 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed">
                <Icon name="inbox" className="w-12 h-12 mb-3 opacity-20" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/80">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {data.map((row, rowIdx) => (
                            <tr
                                key={row.id || rowIdx}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`group transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
