import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, Globe, Hash, CornerDownLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function InternalChat() {
    const { user } = useAuth();
    console.log('InternalChat rendering', user);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('global'); // 'global' or 'users'
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);

    // Initial Load & Subscription
    useEffect(() => {
        if (!isOpen) return;

        // 1. Fetch initial history
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
                    id,
                    content,
                    created_at,
                    sender_id,
                    profiles:sender_id (full_name, avatar_url)
                `)
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) {
                console.error("Erro ao carregar mensagens:", error);
                // Optional message if table is missing
                if (error.code === '42P01') {
                    toast.error("Tabela de chat não encontrada. Execute o SQL de configuração.");
                }
            } else {
                setMessages(data || []);
            }
        };

        fetchMessages();

        // 2. Realtime Subscription
        const channel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    // Fetch the user profile for the new message
                    const fetchNewMsgProfile = async () => {
                        const { data } = await supabase
                            .from('profiles')
                            .select('full_name, avatar_url')
                            .eq('id', payload.new.sender_id)
                            .single();

                        const newMsg = {
                            ...payload.new,
                            profiles: data
                        };
                        setMessages(prev => [...prev, newMsg]);
                    };
                    fetchNewMsgProfile();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const text = newMessage.trim();
        setNewMessage(''); // optimistic clear

        try {
            const { error } = await supabase
                .from('chat_messages')
                .insert({
                    content: text,
                    sender_id: user.id
                });

            if (error) throw error;
        } catch (error) {
            console.error(error);
            toast.error("Erro: " + (error.message || "Falha ao enviar."));
            setNewMessage(text); // restore if failed
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 bg-white dark:bg-slate-800 w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto animate-fadeIn flex flex-col">

                    {/* Header */}
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <MessageCircle size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Chat da Equipe</h3>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tabs (Future Proofing) */}
                    <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'global' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            <Globe size={14} /> Global
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'users' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            disabled // Disabled until Direct Messages are implemented
                            title="Em breve"
                        >
                            <Users size={14} /> Direto
                        </button>
                    </div>

                    {/* Messages Area contains */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                        {activeTab === 'global' ? (
                            <>
                                {messages.length === 0 && (
                                    <div className="text-center py-10 opacity-50">
                                        <Hash className="mx-auto mb-2" />
                                        <p className="text-xs">Nenhuma mensagem ainda.</p>
                                        <p className="text-[10px]">Comece a conversa!</p>
                                    </div>
                                )}

                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    const showName = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {showName && !isMe && (
                                                <span className="text-[10px] text-slate-500 ml-1 mb-1 font-bold">
                                                    {msg.profiles?.full_name || 'Usuário'}
                                                </span>
                                            )}
                                            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm relative group ${isMe
                                                ? 'bg-slate-800 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                                <span className="text-[9px] opacity-50 block text-right mt-1 -mb-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <Users className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Usuários Online</p>
                                <p className="text-xs mt-2">Funcionalidade em desenvolvimento.</p>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>

                </div>
            )}

            {/* Float Button trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg shadow-slate-900/20 transition-all duration-300 flex items-center justify-center border-2 border-white dark:border-slate-800 ${isOpen
                    ? 'bg-slate-700 text-white hover:bg-slate-800'
                    : 'bg-slate-900 text-white hover:bg-slate-800 animate-pulse-slow'
                    }`}
                title="Chat da Equipe"
            >
                {isOpen ? <CornerDownLeft size={20} /> : <MessageCircle size={20} />}
            </button>
        </div>
    );
}
