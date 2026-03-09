import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Download, Edit, Trash, Loader2,
    Users, CheckCircle, Clock, AlertTriangle, X,
    UploadCloud, ArrowRight, Target, TrendingUp, Undo2
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
    fetchConvocacoesPsicologo, createConvocacaoPsicologo,
    updateConvocacaoPsicologo, deleteConvocacaoPsicologo,
    bulkInsertConvocacoesPsicologo, fetchConvocacoesResumo
} from '../../services/psicologoService';

const STATUS_PIPELINE = ['Pendente', 'Em Análise', 'Convocado', 'Empossado', 'Desistente'];
const STATUS_COLORS = {
    'Pendente': 'bg-slate-100 text-slate-600 border-slate-200',
    'Em Análise': 'bg-blue-100 text-blue-700 border-blue-200',
    'Convocado': 'bg-amber-100 text-amber-700 border-amber-200',
    'Empossado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Desistente': 'bg-red-100 text-red-600 border-red-200',
    'Substituído': 'bg-purple-100 text-purple-700 border-purple-200',
};
const STATUS_DOT = {
    'Pendente': 'bg-slate-400', 'Em Análise': 'bg-blue-500',
    'Convocado': 'bg-amber-500', 'Empossado': 'bg-emerald-500',
    'Desistente': 'bg-red-500', 'Substituído': 'bg-purple-500',
};

const EMPTY_FORM = {
    candidato_nome: '', candidato_cpf: '', candidato_email: '',
    candidato_telefone: '', classificacao: '', escola_destino: '',
    municipio: '', dre: '', status: 'Pendente',
    data_convocacao: new Date().toISOString().split('T')[0],
    data_resposta: '', data_posse: '', observacoes: ''
};

// --- Modal ---
function ConvocacaoModal({ isOpen, onClose, onSave, editingData }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setForm(editingData
            ? { ...EMPTY_FORM, ...editingData, classificacao: editingData.classificacao || '' }
            : EMPTY_FORM);
    }, [editingData, isOpen]);

    if (!isOpen) return null;

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form, classificacao: form.classificacao ? Number(form.classificacao) : null };
            if (editingData) {
                await updateConvocacaoPsicologo(editingData.id, payload);
                toast.success('Convocação atualizada!');
            } else {
                await createConvocacaoPsicologo(payload);
                toast.success('Convocação criada!');
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar. Verifique se o SQL foi executado no Supabase.');
        } finally {
            setLoading(false);
        }
    };

    const inp = 'w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-violet-50 rounded-t-3xl">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{editingData ? 'Editar Convocação' : 'Nova Convocação'}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Preencha os dados do candidato e da vaga</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form id="gestao-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Candidato */}
                        <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Dados do Candidato</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Nome Completo *</label><input required className={inp} value={form.candidato_nome} onChange={e => set('candidato_nome', e.target.value)} placeholder="João da Silva" /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">CPF *</label><input required className={inp} value={form.candidato_cpf} onChange={e => set('candidato_cpf', e.target.value)} placeholder="000.000.000-00" /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">E-mail</label><input type="email" className={inp} value={form.candidato_email} onChange={e => set('candidato_email', e.target.value)} placeholder="joao@email.com" /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Telefone</label><input className={inp} value={form.candidato_telefone} onChange={e => set('candidato_telefone', e.target.value)} placeholder="(11) 99999-9999" /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Classificação (posição na lista)</label><input type="number" min="1" className={inp} value={form.classificacao} onChange={e => set('classificacao', e.target.value)} placeholder="Ex: 42" /></div>
                            </div>
                        </div>
                        {/* Vaga */}
                        <div>
                            <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3">Lotação / Vaga</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2"><label className="text-xs font-semibold text-slate-600 block mb-1">Escola de Destino</label><input className={inp} value={form.escola_destino} onChange={e => set('escola_destino', e.target.value)} placeholder="EE Professora Ana Lima" /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Município</label><input className={inp} value={form.municipio} onChange={e => set('municipio', e.target.value)} placeholder="Campinas" /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">DRE</label><input className={inp} value={form.dre} onChange={e => set('dre', e.target.value)} placeholder="Sul 1" /></div>
                            </div>
                        </div>
                        {/* Status e Datas */}
                        <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Status e Datas</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Status *</label>
                                    <select required className={inp + ' bg-white'} value={form.status} onChange={e => set('status', e.target.value)}>
                                        {[...STATUS_PIPELINE, 'Substituído'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Data da Convocação *</label><input required type="date" className={inp} value={form.data_convocacao} onChange={e => set('data_convocacao', e.target.value)} /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Data da Resposta</label><input type="date" className={inp} value={form.data_resposta} onChange={e => set('data_resposta', e.target.value)} /></div>
                                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Data de Posse</label><input type="date" className={inp} value={form.data_posse} onChange={e => set('data_posse', e.target.value)} /></div>
                            </div>
                        </div>
                        <div><label className="text-xs font-semibold text-slate-600 block mb-1">Observações</label><textarea rows={3} className={inp + ' resize-none'} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Informações adicionais..." /></div>
                    </form>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                    <button form="gestao-form" type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 flex items-center gap-2">
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Tab Principal ---
export default function GestaoTab({ metaVagas = 200 }) {
    const [convocacoes, setConvocacoes] = useState([]);
    const [summary, setSummary] = useState({ Pendente: 0, 'Em Análise': 0, Convocado: 0, Empossado: 0, Desistente: 0, Substituído: 0, Total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFiltro, setStatusFiltro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { load(); }, [search, statusFiltro]);

    const load = async () => {
        setLoading(true);
        try {
            const [lista, res] = await Promise.all([
                fetchConvocacoesPsicologo({ search, status: statusFiltro }),
                fetchConvocacoesResumo()
            ]);
            setConvocacoes(lista);
            const total = Object.values(res).reduce((a, b) => a + b, 0);
            setSummary({ ...res, Total: total });
        }
        catch { toast.error('Verifique se o SQL foi executado no Supabase.'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir esta convocação?')) return;
        try { await deleteConvocacaoPsicologo(id); toast.success('Excluído.'); load(); }
        catch { toast.error('Erro ao excluir.'); }
    };

    const handleTramitar = async (id, novoStatus) => {
        try {
            await updateConvocacaoPsicologo(id, { status: novoStatus });
            toast.success(`Candidato atualizado para ${novoStatus}!`);
            load();
        } catch (err) {
            toast.error('Erro ao atualizar status.');
        }
    };

    const handleExport = () => {
        if (!convocacoes.length) { toast.error('Sem dados para exportar.'); return; }
        const ws = XLSX.utils.json_to_sheet(convocacoes.map(v => ({
            'Nome': v.candidato_nome, 'CPF': v.candidato_cpf, 'Email': v.candidato_email,
            'Telefone': v.candidato_telefone, 'Classificação': v.classificacao,
            'Escola': v.escola_destino, 'Município': v.municipio, 'DRE': v.dre,
            'Status': v.status, 'Data Convocação': v.data_convocacao,
            'Data Resposta': v.data_resposta, 'Data Posse': v.data_posse, 'Observações': v.observacoes
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Convocações PSS');
        XLSX.writeFile(wb, 'convocacoes_psicologo.xlsx');
        toast.success('Excel exportado!');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.SheetNames[0];
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

                const mapKeys = (row, possibleKeys) => {
                    const keys = Object.keys(row);
                    const k = keys.find(kl => possibleKeys.some(tag => kl.toLowerCase().includes(tag)));
                    return k ? row[k] : null;
                };

                const candidatos = [];
                for (const row of rows) {
                    const nome = mapKeys(row, ['nome', 'candidato']);
                    const cpf = mapKeys(row, ['cpf']);
                    const email = mapKeys(row, ['email', 'e-mail']);
                    const telefone = mapKeys(row, ['telefone', 'celular', 'contato']);
                    const classificacao = mapKeys(row, ['classifica', 'posição', 'posicao']);

                    if (!nome) continue;

                    candidatos.push({
                        candidato_nome: String(nome).trim(),
                        candidato_cpf: cpf ? String(cpf).trim() : 'Não informado',
                        candidato_email: email ? String(email).trim() : '',
                        candidato_telefone: telefone ? String(telefone).trim() : '',
                        classificacao: classificacao ? Number(classificacao) : 0,
                        status: 'Pendente'
                    });
                }

                if (candidatos.length === 0) {
                    toast.error("Nenhum candidato encontrado. Colunas esperadas: Nome, CPF, Email...");
                    return;
                }

                await bulkInsertConvocacoesPsicologo(candidatos);
                toast.success(`${candidatos.length} aprovados importados com sucesso!`);
                load();
            } catch (err) {
                console.error(err);
                toast.error("Erro ao importar a planilha de aprovados.");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    // KPIs
    const byStatus = (s) => summary[s] || 0;
    const empossados = byStatus('Empossado');
    const convocados = byStatus('Convocado');
    const pendentes = byStatus('Pendente') + byStatus('Em Análise');
    const desistentes = byStatus('Desistente');
    const taxaAceite = summary.Total > 0 ? Math.round((empossados / summary.Total) * 100) : 0;
    const pctMeta = Math.min(100, Math.round((empossados / metaVagas) * 100));

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { label: 'Total', value: summary.Total, color: 'indigo', Icon: Users },
                    { label: 'Pendentes', value: pendentes, color: 'slate', Icon: Clock },
                    { label: 'Convocados', value: convocados, color: 'amber', Icon: ArrowRight },
                    { label: 'Empossados', value: empossados, color: 'emerald', Icon: CheckCircle },
                    { label: 'Desistentes', value: desistentes, color: 'red', Icon: AlertTriangle },
                ].map((k, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between overflow-hidden relative group">
                        <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${k.color}-500/10 rounded-full group-hover:scale-150 transition-transform duration-500`} />
                        <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{k.label}</p><p className={`text-2xl font-black text-${k.color}-600 mt-0.5`}>{k.value}</p></div>
                        <div className={`p-2.5 bg-${k.color}-50 text-${k.color}-600 rounded-xl relative z-10`}><k.Icon size={20} /></div>
                    </div>
                ))}
            </div>

            {/* Barra de meta */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Target size={20} /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Meta de Vagas</p>
                        <p className="text-lg font-black text-slate-800">{empossados} <span className="text-slate-400 font-medium text-sm">/ {metaVagas} empossados</span></p>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5"><span>Progresso</span><span>{pctMeta}%</span></div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pctMeta}%` }} />
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={20} /></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Taxa de Aceite</p>
                        <p className="text-lg font-black text-emerald-600">{taxaAceite}%</p>
                    </div>
                </div>
            </div>

            {/* Pipeline visual */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pipeline de Convocação</p>
                <div className="flex flex-wrap gap-3">
                    {STATUS_PIPELINE.map((s, i) => {
                        const n = byStatus(s);
                        return (
                            <React.Fragment key={s}>
                                <button
                                    onClick={() => setStatusFiltro(statusFiltro === s ? '' : s)}
                                    className={`flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-all ${statusFiltro === s ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <span className={`text-2xl font-black ${STATUS_COLORS[s].split(' ')[1]}`}>{n}</span>
                                    <span className="text-xs font-semibold text-slate-500 mt-1">{s}</span>
                                </button>
                                {i < STATUS_PIPELINE.length - 2 && <div className="flex items-center text-slate-300"><ArrowRight size={16} /></div>}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Ações + filtros */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-60" placeholder="Buscar candidato..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
                        <option value="">Todos os status</option>
                        {[...STATUS_PIPELINE, 'Substituído'].map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold shadow-sm text-sm transition-colors cursor-pointer ${uploading ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}>
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        <span className="hidden sm:inline">Upload Aprovados (CSV/Excel)</span>
                        <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                    <button onClick={handleExport} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-sm text-sm"><Download size={16} /><span className="hidden sm:inline">Exportar</span></button>
                    <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm text-sm hover:shadow-lg hover:shadow-indigo-500/30"><Plus size={16} /><span className="hidden sm:inline">Nova Convocação</span></button>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-3.5 text-left">Candidato</th>
                                <th className="px-5 py-3.5 text-left">Escola / Município</th>
                                <th className="px-5 py-3.5 text-left">Classificação</th>
                                <th className="px-5 py-3.5 text-left">Status</th>
                                <th className="px-5 py-3.5 text-left">Convocado em</th>
                                <th className="px-5 py-3.5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2" />Carregando...</td></tr>
                            ) : convocacoes.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Nenhum registro encontrado.<br /><span className="text-xs">Execute o SQL no Supabase se for o primeiro acesso.</span></td></tr>
                            ) : convocacoes.map(item => (
                                <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-slate-800">{item.candidato_nome}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{item.candidato_cpf}{item.candidato_email && ` • ${item.candidato_email}`}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-700">{item.escola_destino || '—'}</div>
                                        <div className="text-xs text-slate-400">{[item.municipio, item.dre].filter(Boolean).join(' • ') || '—'}</div>
                                    </td>
                                    <td className="px-5 py-4 font-black text-slate-700">{item.classificacao ? `#${item.classificacao}` : '—'}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[item.status] || ''}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[item.status] || 'bg-slate-400'}`} />
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{item.data_convocacao ? new Date(item.data_convocacao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {item.status === 'Em Análise' && (
                                                <>
                                                    <button onClick={() => handleTramitar(item.id, 'Pendente')} title="Voltar para Pendente" className="p-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 rounded-lg shadow-sm transition-colors"><Undo2 size={14} /></button>
                                                    <button onClick={() => handleTramitar(item.id, 'Convocado')} title="Avançar para Convocado" className="p-2 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 rounded-lg shadow-sm transition-colors"><ArrowRight size={14} /></button>
                                                </>
                                            )}
                                            {item.status === 'Convocado' && (
                                                <>
                                                    <button onClick={() => handleTramitar(item.id, 'Em Análise')} title="Voltar para Em Análise" className="p-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg shadow-sm transition-colors"><Undo2 size={14} /></button>
                                                    <button onClick={() => handleTramitar(item.id, 'Empossado')} title="Avançar para Empossado" className="p-2 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg shadow-sm transition-colors"><CheckCircle size={14} /></button>
                                                </>
                                            )}
                                            {item.status === 'Empossado' && (
                                                <button onClick={() => handleTramitar(item.id, 'Convocado')} title="Reverter Posse (Voltar p/ Convocado)" className="p-2 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 rounded-lg shadow-sm transition-colors"><Undo2 size={14} /></button>
                                            )}
                                            <button onClick={() => { setEditing(item); setShowModal(true); }} title="Editar" className="p-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg shadow-sm transition-colors"><Edit size={14} /></button>
                                            <button onClick={() => handleDelete(item.id)} title="Excluir" className="p-2 bg-white border border-slate-200 hover:border-red-300 hover:text-red-500 rounded-lg shadow-sm transition-colors"><Trash size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConvocacaoModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={load} editingData={editing} />
        </div>
    );
}
