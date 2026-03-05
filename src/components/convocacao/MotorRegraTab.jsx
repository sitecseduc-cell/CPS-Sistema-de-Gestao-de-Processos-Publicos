import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle, CheckCircle, Loader2, Info, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { fetchRegraAtiva, updateRegra } from '../../services/psicologoService';

const PARAM_CONFIG = [
    {
        group: 'Limites de Porte (nº de alunos)',
        color: 'indigo',
        params: [
            { key: 'limite_pequeno_max', label: 'Pequeno Porte — até N alunos', hint: 'Escolas com até este número são classificadas como Pequeno Porte', min: 100, max: 1500, step: 50, emoji: '🟢' },
            { key: 'limite_medio_b_max', label: 'Médio Porte — até N alunos', hint: 'Entre Pequeno e este número = Médio Porte. Acima de Médio = Grande Porte', min: 100, max: 2000, step: 50, emoji: '🟡' },
        ]
    },
    {
        group: 'Alocação de Psicólogos (Proporção)',
        color: 'violet',
        params: [
            { key: 'psic_por_escolas_pequenas', label: '1 psicólogo para cada N escolas (Pequenas/Médias)', hint: 'Escolas pequenas e médias (Rurais e Interior) são agrupadas para compartilhar profissional. Ex: 3', min: 1, max: 20, step: 1, emoji: '👥' },
            { key: 'psic_por_alunos_grande', label: '1 psicólogo para cada N alunos (Grande Porte)', hint: 'Para escolas de Grande Porte, a alocação é fixa e proporcional. Ex: 1 psicólogo a cada 1000 alunos', min: 200, max: 3000, step: 100, emoji: '🏫' },
        ]
    },
    {
        group: 'Meta Geral do Edital',
        color: 'emerald',
        params: [
            { key: 'total_vagas_disponivel', label: 'Total de vagas disponíveis', hint: 'Foco de preenchimento voltado para Zona Rural e Cidades de Interior (polos urbanos metropolitanos excluídos).', min: 1, max: 1000, step: 1, emoji: '🎯' },
        ]
    }
];

function calcDemandPreview(regra) {
    // Simulação com dados alinhados às prioridades reais do sistema (Rural + Interior). 
    // Grandes polos metropolitanos (Belém, Ananindeua, etc) já excluídos desta amostra.
    const escolasPequenoMedio = 477; // Escolas a serem atendidas por psicólogos compartilhados
    const alunosGrandePorte = 41000; // Total de alunos em escolas grandes do interior/rural

    // Cálculo seguindo a regra = 1 por cada N escolas (Pq/Médio) e 1 por cada N alunos (Grandes)
    const nPeqMedio = Math.ceil(escolasPequenoMedio / (regra.psic_por_escolas_pequenas || 3));
    const nGrande = Math.ceil(alunosGrandePorte / (regra.psic_por_alunos_grande || 1000));

    const demandaBruta = nPeqMedio + nGrande;
    const vagas = regra.total_vagas_disponivel || 200;

    let total = demandaBruta;
    let nFixo = nGrande;
    let nComp = nPeqMedio;

    if (total > vagas) {
        total = vagas;
        const pctGrande = nGrande / demandaBruta;
        nFixo = Math.floor(vagas * pctGrande);
        nComp = vagas - nFixo;
    }

    return { nPeqMedio: nComp, nGrande: nFixo, total, demandaBruta };
}

export default function MotorRegraTab({ onRegraChanged }) {
    const [regra, setRegra] = useState(null);
    const [editando, setEditando] = useState(null); // cópia para edição
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => { loadRegra(); }, []);

    const loadRegra = async () => {
        setLoading(true);
        try {
            const r = await fetchRegraAtiva();
            setRegra(r);
            setEditando(r ? { ...r } : null);
        } catch (err) {
            toast.error('Não foi possível carregar as regras. Execute o SQL no Supabase.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setEditando(e => ({ ...e, [key]: Number(value) }));
        setDirty(true);
    };

    const handleSave = async () => {
        if (!editando?.id) return;
        setSaving(true);
        try {
            const updated = await updateRegra(editando.id, editando, 'Usuário Admin');
            setRegra(updated);
            setEditando({ ...updated });
            setDirty(false);
            toast.success('Regras salvas com sucesso!');
            onRegraChanged?.(updated);
        } catch (err) {
            toast.error('Erro ao salvar. Execute o SQL no Supabase.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (!window.confirm('Desfazer todas as alterações não salvas?')) return;
        setEditando({ ...regra });
        setDirty(false);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 text-indigo-600">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="font-bold text-lg">Carregando regras do banco...</p>
        </div>
    );

    if (!regra) return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={36} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Banco de dados não configurado</h3>
            <p className="text-slate-500 max-w-md">Execute o script SQL no <strong>Supabase Dashboard → SQL Editor</strong> para criar as tabelas e a regra padrão.</p>
            <div className="mt-4 bg-slate-900 text-emerald-400 rounded-xl px-6 py-3 font-mono text-sm">supabase/migrations/001_psicologo_schema.sql</div>
        </div>
    );

    const preview = calcDemandPreview(editando || regra);
    const vagas = editando?.total_vagas_disponivel || 200;

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* Aviso de estado não salvo */}
            {dirty && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700 font-medium">Há alterações não salvas nas regras.</p>
                    <div className="ml-auto flex gap-2">
                        <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-amber-100 rounded-lg transition-colors"><RotateCcw size={13} />Desfazer</button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"><Save size={13} />{saving ? 'Salvando...' : 'Salvar Agora'}</button>
                    </div>
                </div>
            )}

            {/* Preview de impacto */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-3xl p-6 flex flex-col lg:flex-row gap-5 items-center justify-between overflow-hidden relative">
                <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="z-10">
                    <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Preview — Demanda estimada com as regras atuais</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-black">{preview.total}</span>
                        <span className="text-indigo-200">psicólogos necessários</span>
                    </div>
                    <p className="text-indigo-200 text-xs mt-2">
                        <strong>Nota:</strong> Belém, Ananindeua, Marabá e polos urbanos similares <strong>não</strong> entram nesta conta.
                        <br />
                        Filtros ativos: Sem Indígena, Quilombola, SOME, CEEJA.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 z-10 shrink-0">
                    {[
                        { label: 'Fixos (Escolas Grandes)', value: preview.nGrande, color: 'bg-indigo-400/30' },
                        { label: 'Compartilhados (Pq/Médio)', value: preview.nPeqMedio, color: 'bg-emerald-500/30' },
                    ].map(b => (
                        <div key={b.label} className={`${b.color} rounded-xl px-4 py-2 text-center`}>
                            <p className="text-2xl font-black">{b.value}</p>
                            <p className="text-[10px] font-bold uppercase text-indigo-100 mt-1">{b.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                <div className="shrink-0 p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Settings size={20} /></div>
                <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                        <span>Demanda bruta estimada ({preview.demandaBruta}) vs. limite do edital ({vagas})</span>
                        <span>{Math.min(100, Math.round((preview.demandaBruta / vagas) * 100))}% ocupado</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${preview.demandaBruta > vagas ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}`} style={{ width: `${Math.min(100, (preview.demandaBruta / vagas) * 100)}%` }} />
                    </div>
                </div>
                {preview.demandaBruta > vagas && (
                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <CheckCircle size={13} />Cortado para o limite exato ({vagas})
                    </div>
                )}
                {preview.demandaBruta <= vagas && (
                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                        <CheckCircle size={13} />Livre para todas (Sem Sobras)
                    </div>
                )}
            </div>

            {/* Grupos de parâmetros */}
            {editando && PARAM_CONFIG.map(group => (
                <div key={group.group} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className={`p-4 border-b border-slate-100 bg-${group.color}-50 flex items-center gap-2`}>
                        <Settings size={16} className={`text-${group.color}-500`} />
                        <h4 className={`text-sm font-bold text-${group.color}-700`}>{group.group}</h4>
                    </div>
                    <div className="p-5 space-y-5">
                        {group.params.map(p => {
                            const val = editando[p.key] ?? 0;
                            const changed = regra[p.key] !== val;
                            return (
                                <div key={p.key} className={`rounded-xl p-4 transition-colors ${changed ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-base">{p.emoji}</span>
                                                <label className="text-sm font-bold text-slate-800">{p.label}</label>
                                                {changed && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">modificado</span>}
                                            </div>
                                            <p className="text-xs text-slate-400">{p.hint}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <input
                                                type="range" min={p.min} max={p.max} step={p.step}
                                                value={val}
                                                onChange={e => handleChange(p.key, e.target.value)}
                                                className="w-32 accent-indigo-600"
                                            />
                                            <input
                                                type="number" min={p.min} max={p.max} step={p.step}
                                                value={val}
                                                onChange={e => handleChange(p.key, e.target.value)}
                                                className="w-24 p-2 text-center border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Metadados */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5"><Clock size={13} />Última alteração: {regra.updated_at ? new Date(regra.updated_at).toLocaleString('pt-BR') : '—'}</div>
                <div className="flex items-center gap-1.5"><Info size={13} />Alterado por: <span className="font-semibold text-slate-600">{regra.changed_by || 'Sistema'}</span></div>
                <div className="flex items-center gap-1.5"><Info size={13} />Descrição: <span className="font-semibold text-slate-600">{regra.descricao}</span></div>
                <button onClick={handleSave} disabled={saving || !dirty} className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm">
                    <Save size={16} />{saving ? 'Salvando...' : 'Salvar Regras'}
                </button>
            </div>
        </div>
    );
}
