import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
    Bell, MessageCircle, ShieldAlert, CheckCircle2,
    Search, Trash2, Inbox, CheckSquare, Square, Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
    const { user, role } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, audit, chat
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set()); // Para multi-seleção

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user, filter]); // Added filter as a dependency properly? No, filter is client-side usually.

    const fetchNotifications = async () => {
        setLoading(true);
        setSelectedIds(new Set());
        try {
            // Note: Se a tabela system_notifications ainda não existir, isso vai falhar
            // Mas com o script SQL rodado, ela existirá.
            let query = supabase
                .from('system_notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            // Allow filtering by type directly on DB to save bandwidth
            if (filter === 'unread') query = query.eq('is_read', false);
            if (filter === 'audit') query = query.eq('type', 'audit');
            if (filter === 'chat') query = query.eq('type', 'chat');

            const { data, error } = await query;

            if (error) {
                // Se der erro de tabela ("relation does not exist"), caímos no fallback gracioso 
                if (error.code === '42P01') {
                    throw new Error("A tabela system_notifications não existe. Por favor, rode o script SQL no Supabase.");
                }
                throw error;
            }

            setNotifications(data || []);

        } catch (error) {
            console.error("Erro ao carregar notificações", error);
            // Fallback UI case DB isn't ready
            toast.error(error.message || "Erro ao carregar notificações do banco.");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredNotifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
        }
    };

    // Ações de Lote
    const markAsRead = async (idsToMark) => {
        if (!idsToMark || idsToMark.size === 0) return;
        try {
            setLoading(true);
            const idArray = Array.from(idsToMark);
            const { error } = await supabase
                .from('system_notifications')
                .update({ is_read: true })
                .in('id', idArray)
                .eq('user_id', user.id); // Security measure

            if (error) throw error;
            toast.success(`${idArray.length} notificação(ões) marcada(s) como lida(s)`);
            fetchNotifications();
        } catch (error) {
            toast.error("Erro ao marcar como lido");
            setLoading(false);
        }
    };

    const deleteNotifications = async (idsToDelete) => {
        if (!idsToDelete || idsToDelete.size === 0) return;
        if (!window.confirm(`Deseja realmente excluir ${idsToDelete.size === notifications.length ? 'TODAS as' : 'as ' + idsToDelete.size} notificações selecionadas?`)) return;

        try {
            setLoading(true);
            const idArray = Array.from(idsToDelete);
            const { error } = await supabase
                .from('system_notifications')
                .delete()
                .in('id', idArray)
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success(`${idArray.length} notificação(ões) excluída(s)`);
            fetchNotifications();
        } catch (error) {
            toast.error("Erro ao excluir");
            setLoading(false);
        }
    };

    const deleteAllOfUser = async () => {
        if (!window.confirm("Deseja esvaziar sua caixa de notificações completamente?")) return;
        try {
            setLoading(true);
            const { error } = await supabase
                .from('system_notifications')
                .delete()
                .eq('user_id', user.id);
            if (error) throw error;
            toast.success("Todas as notificações foram excluídas.");
            fetchNotifications();
        } catch (error) {
            toast.error("Erro ao limpar notificações");
            setLoading(false);
        }
    };

    // Client side filtering for text search
    const filteredNotifications = notifications.filter(n => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (n.title && n.title.toLowerCase().includes(term)) ||
                (n.description && n.description.toLowerCase().includes(term));
        }
        return true;
    });

    const formatTime = (dateStr) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateStr));
    };

    const isAllSelected = filteredNotifications.length > 0 && selectedIds.size === filteredNotifications.length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Bell className="text-indigo-600" /> Notificações
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Histórico de alertas e mensagens do sistema
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchNotifications}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Atualizar"
                    >
                        <Inbox size={20} />
                    </button>
                </div>
            </div>

            {/* Warning if Empty BD / Needs Setup */}
            {notifications.length === 0 && !loading && searchTerm === '' && filter === 'all' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-xl shadow-sm text-blue-700 dark:text-blue-300 text-sm flex gap-3">
                    <Info size={20} className="shrink-0" />
                    <p>Se você acabou de criar o sistema de notificações, não se esqueça de rodar o script <b>setup_notifications.sql</b> no editor SQL do Supabase. Assim o banco de dados estará pronto para receber logs reais!</p>
                </div>
            )}

            {/* Filters & Actions Bar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">

                {/* Left - Standard Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {['all', 'unread', 'chat', 'audit'].map(f => {
                            if (f === 'audit' && role !== 'admin' && role !== 'gestor') return null;
                            const labels = { all: 'Todas', unread: 'Não Lidas', chat: 'Mensagens', audit: 'Auditoria' };
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                                >
                                    {labels[f]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right - Batch Actions (visible if items selected) */}
                <div className={`flex items-center gap-2 transition-all duration-300 ${selectedIds.size > 0 ? 'opacity-100 scale-100' : 'opacity-50 scale-95 pointer-events-none'}`}>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 line-clamp-1">
                        {selectedIds.size} selecionada(s)
                    </div>
                    <button
                        onClick={() => markAsRead(selectedIds)}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                    >
                        <CheckCircle2 size={14} /> Marcar Lidas
                    </button>
                    <button
                        onClick={() => deleteNotifications(selectedIds)}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                    >
                        <Trash2 size={14} /> Excluir
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px]">

                {/* List Header with Select All & Delete All */}
                <div className="bg-slate-50/80 dark:bg-slate-900/50 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3 px-3">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2">
                            {isAllSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                            <span className="text-xs font-bold text-slate-500 uppercase">Selecionar</span>
                        </button>
                    </div>
                    {notifications.length > 0 && (
                        <button onClick={deleteAllOfUser} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 rounded shadow-sm transition-colors">
                            <Trash2 size={12} /> Limpar Tudo
                        </button>
                    )}
                </div>


                {loading ? (
                    <div className="p-6 space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="h-4 w-4 bg-slate-200 rounded mt-2"></div>
                                <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                                <div className="flex-1 space-y-2 mt-1">
                                    <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                                    <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-slate-300" />
                        </div>
                        <p>Nenhuma notificação encontrada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {filteredNotifications.map((notif) => {
                            const isSelected = selectedIds.has(notif.id);
                            return (
                                <div
                                    key={notif.id}
                                    className={`p-4 transition-colors group flex items-start gap-3 ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' :
                                            notif.is_read ? 'hover:bg-slate-50 dark:hover:bg-slate-700/30' :
                                                'bg-slate-50/50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <button onClick={() => toggleSelection(notif.id)} className="mt-2 text-slate-300 hover:text-indigo-500 transition-colors">
                                        {isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                                    </button>

                                    <div className={`mt-0.5 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'audit'
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                        {notif.type === 'audit' ? <ShieldAlert size={18} /> : <MessageCircle size={18} />}
                                    </div>

                                    <div className="flex-1 min-w-0" onClick={() => !notif.is_read && markAsRead(new Set([notif.id]))}>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className={`font-semibold transition-colors ${notif.is_read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white group-hover:text-indigo-600'}`}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                                {!notif.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                                            </div>
                                        </div>

                                        <p className={`text-sm mt-0.5 mb-2 ${notif.is_read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {notif.description}
                                        </p>

                                        {notif.type === 'audit' && notif.metadata && Object.keys(notif.metadata).length > 0 && (
                                            <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 overflow-hidden truncate">
                                                {JSON.stringify(notif.metadata)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}
