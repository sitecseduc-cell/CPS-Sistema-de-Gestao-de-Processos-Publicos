import React, { useState, useEffect } from 'react';
import {
  Users, GitCommit, AlertTriangle, CheckCircle,
  Map, BarChart3
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { CardSkeleton, Skeleton } from '../components/ui/Loading';
import { supabase } from '../lib/supabaseClient';
import DashboardMap from '../components/DashboardMap';

const FunnelChart = ({ loading, data }) => {
  // Valores padrão apenas para não quebrar se vier vazio
  const funnelSteps = data || [
    { label: 'Inscritos', count: 0, color: 'bg-blue-600' },
    { label: 'Em Análise', count: 0, color: 'bg-blue-500' },
    { label: 'Classificados', count: 0, color: 'bg-indigo-500' },
    { label: 'Convocados', count: 0, color: 'bg-emerald-500' }
  ];

  // Calcula porcentagens relativas ao primeiro passo
  const maxVal = funnelSteps[0]?.count || 1;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full transition-colors duration-300">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center"><BarChart3 size={18} className="mr-2 text-slate-500 dark:text-slate-400" /> Funil de Seleção Global</h3>
      <div className="space-y-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-full" />)
          : funnelSteps.map((step, idx) => {
            const percent = Math.round((step.count / maxVal) * 100) || 0;
            return (
              <div key={idx} className="relative group cursor-default">
                <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-600 dark:text-slate-300">
                  <span>{step.label}</span>
                  <span>{step.count.toLocaleString()} ({percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div className={`h-full ${step.color} rounded-full transition-all duration-1000 group-hover:opacity-80`} style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    candidatos: 0,
    processos: 0,
    vagasPreenchidas: 0,
    atrasos: 0
  });
  const [funnelData, setFunnelData] = useState([]);
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // --- TENTATIVA VIA RPC (Melhor Performance) ---
        // Se o script SQL foi rodado, isso vai funcionar instantaneamente

        // 1. KPIs Gerais
        const { data: kpisData, error: kpiError } = await supabase.rpc('get_dashboard_kpis');
        if (kpiError) throw kpiError;

        // 2. Heatmap
        const { data: heatmapData, error: heatError } = await supabase.rpc('get_heatmap_stats');

        // 3. Funnel
        const { data: funnelRaw, error: funnelError } = await supabase.rpc('get_funnel_stats');

        // Processar Funnel Data
        // O RPC retorna array [{ status: '...', count: 10 }, ...]
        // Precisamos mapear para nossa estrutura fixa ou usar o que vier
        let finalFunnel = [];
        if (funnelRaw) {
          // Mapeamento manual para garantir ordem
          const counts = {};
          funnelRaw.forEach(item => counts[item.status] = item.count);

          // Total inscritos pode ser pego do KPI ou somando tudo, mas geralmente 'Em Análise' etc são subconjuntos
          // Vamos usar o total de candidatos como base do funil
          finalFunnel = [
            { label: 'Inscritos (Total)', count: kpisData.candidatos || 0, color: 'bg-blue-600' },
            { label: 'Em Análise', count: counts['Em Análise'] || 0, color: 'bg-blue-500' },
            { label: 'Classificados', count: counts['Classificado'] || 0, color: 'bg-purple-500' },
            { label: 'Convocados', count: counts['Convocado'] || 0, color: 'bg-emerald-500' }
          ];
        }

        setStats({
          candidatos: kpisData.candidatos || 0,
          processos: kpisData.processos || 0,
          vagasPreenchidas: kpisData.vagas || 0,
          atrasos: 2 // Mock mantido
        });

        if (heatmapData) setGeoData(heatmapData.map(d => ({ nome: d.municipio, count: d.count })));
        if (finalFunnel.length > 0) setFunnelData(finalFunnel);

      } catch (error) {
        console.warn("RPC falhou ou não existe. Usando fallback cliente-side.", error);
        // --- FALLBACK (Lógica Antiga) ---
        // Caso o usuário não tenha rodado o SQL ainda
        await fetchFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const fetchFallbackData = async () => {
      const { count: countCandidatos } = await supabase.from('candidatos').select('*', { count: 'exact', head: true });
      const { count: countProcessos } = await supabase.from('processos').select('*', { count: 'exact', head: true });
      const { count: countVagas } = await supabase.from('controle_vagas').select('*', { count: 'exact', head: true });

      // Heatmap Fallback (Limitado)
      const { data: vagasData } = await supabase.from('controle_vagas').select('municipio').limit(100);
      const cityCounts = {};
      if (vagasData) {
        vagasData.forEach(v => {
          if (v.municipio) {
            const city = v.municipio.trim().toUpperCase();
            cityCounts[city] = (cityCounts[city] || 0) + 1;
          }
        });
      }
      const sortedCities = Object.entries(cityCounts)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Funnel Fallback
      const { count: countEmAnalise } = await supabase.from('candidatos').select('*', { count: 'exact', head: true }).eq('status', 'Em Análise');
      const { count: countClassificados } = await supabase.from('candidatos').select('*', { count: 'exact', head: true }).eq('status', 'Classificado');
      const { count: countConvocados } = await supabase.from('candidatos').select('*', { count: 'exact', head: true }).eq('status', 'Convocado');

      setStats({
        candidatos: countCandidatos || 0,
        processos: countProcessos || 0,
        vagasPreenchidas: countVagas || 0,
        atrasos: 2
      });
      setGeoData(sortedCities);
      setFunnelData([
        { label: 'Inscritos (Total)', count: countCandidatos || 0, color: 'bg-blue-600' },
        { label: 'Em Análise', count: countEmAnalise || 0, color: 'bg-blue-500' },
        { label: 'Classificados', count: countClassificados || 0, color: 'bg-purple-500' },
        { label: 'Convocados', count: countConvocados || 0, color: 'bg-emerald-500' }
      ]);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Processos Ativos" value={stats.processos} icon={GitCommit} color="bg-blue-100 text-blue-600" />
            <StatCard title="Candidatos Totais" value={stats.candidatos.toLocaleString()} icon={Users} color="bg-purple-100 text-purple-600" subtext="Base atualizada" />
            <StatCard title="Quadro de Vagas" value={stats.vagasPreenchidas} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" subtext="Vagas cadastradas" />
            <StatCard title="Atenção Necessária" value={stats.atrasos} icon={AlertTriangle} color="bg-red-100 text-red-600" alert={true} subtext="Processos parados" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
        <div className="lg:col-span-1 h-full">
          <FunnelChart loading={loading} data={funnelData} />
        </div>
        <div className="lg:col-span-2 h-full">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Map size={18} className="mr-2 text-slate-500 dark:text-slate-400" /> Distribuição Geográfica
            </h3>
            <DashboardMap />
          </div>
        </div>
      </div>
    </div>
  );
}