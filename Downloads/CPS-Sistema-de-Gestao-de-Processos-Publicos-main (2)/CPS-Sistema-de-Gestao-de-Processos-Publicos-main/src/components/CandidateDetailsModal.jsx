import React from 'react';
import { X, User, FileText, Briefcase, MapPin, Calendar, Mail, Phone, Hash } from 'lucide-react';

export default function CandidateDetailsModal({ isOpen, onClose, candidate }) {
    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors">

                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">
                            {candidate.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{candidate.nome}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ficha do Candidato</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${candidate.status === 'Classificado' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' :
                            candidate.status === 'Desclassificado' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400' :
                                'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                        }`}>
                        <div className="font-bold uppercase tracking-wide text-sm flex-1">
                            Status Atual: {candidate.status || 'Em Análise'}
                        </div>
                        <div className="text-xs opacity-75">
                            ID: {candidate.id}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Dados Pessoais</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <FileText size={18} className="text-slate-400" />
                                    <div>
                                        <span className="block text-xs text-slate-500 dark:text-slate-500">CPF</span>
                                        <span className="font-mono">{candidate.cpf}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <Mail size={18} className="text-slate-400" />
                                    <div>
                                        <span className="block text-xs text-slate-500 dark:text-slate-500">E-mail</span>
                                        <span>{candidate.email || 'Não informado'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <Phone size={18} className="text-slate-400" />
                                    <div>
                                        <span className="block text-xs text-slate-500 dark:text-slate-500">Telefone</span>
                                        <span>{candidate.telefone || 'Não informado'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <Calendar size={18} className="text-slate-400" />
                                    <div>
                                        <span className="block text-xs text-slate-500 dark:text-slate-500">Data de Nasc.</span>
                                        <span>{candidate.data_nascimento ? new Date(candidate.data_nascimento).toLocaleDateString('pt-BR') : 'Não informada'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Dados da Vaga</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <Briefcase size={18} className="text-slate-400" />
                                    <div>
                                        <span className="block text-xs text-slate-500 dark:text-slate-500">Cargo / Função</span>
                                        <span className="font-medium">{candidate.cargo}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <MapPin size={18} className="text-slate-400" />
                                    <div>
                                        <span className="block text-xs text-slate-500 dark:text-slate-500">Regional / Lotação</span>
                                        <span className="font-medium">{candidate.localidade}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <Hash size={18} className="text-slate-400" />
                                    <div>
                                        <span className="block text-xs text-slate-500 dark:text-slate-500">Nº Inscrição</span>
                                        <span className="font-mono">{candidate.numero_inscricao || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Fechar
                    </button>
                </div>

            </div>
        </div>
    );
}
