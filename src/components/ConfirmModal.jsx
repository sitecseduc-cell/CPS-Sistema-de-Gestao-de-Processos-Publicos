import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Modal de confirmação reutilizável.
 * Substitui window.confirm() em toda a aplicação.
 *
 * Props:
 *  - isOpen: boolean
 *  - onConfirm: () => void
 *  - onCancel: () => void
 *  - title: string (default: 'Confirmar ação')
 *  - message: string
 *  - confirmLabel: string (default: 'Confirmar')
 *  - variant: 'danger' | 'warning' (default: 'danger')
 */
export default function ConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Confirmar ação',
    message = 'Tem certeza que deseja continuar?',
    confirmLabel = 'Confirmar',
    variant = 'danger',
}) {
    if (!isOpen) return null;

    const colorMap = {
        danger: {
            icon: 'bg-red-100 text-red-600',
            btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/30',
        },
        warning: {
            icon: 'bg-amber-100 text-amber-600',
            btn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 shadow-amber-400/30',
        },
    };

    const colors = colorMap[variant] || colorMap.danger;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn"
            onClick={onCancel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20 dark:border-white/10 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5 ${colors.icon}`}>
                    {variant === 'danger' ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-8">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all hover:scale-[1.02] active:scale-95 ${colors.btn}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
