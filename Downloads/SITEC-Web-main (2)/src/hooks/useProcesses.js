import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useProcesses = (user) => {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProcesses([]);
      setIsLoading(false);
      return;
    }

    const fetchProcesses = async () => {
      setIsLoading(true);
      let processQuery = supabase
        .from('processes')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtragem baseada em role
      if (user.role === 'Analista') {
        processQuery = processQuery.eq('sector', user.sector);
      } else if (user.role !== 'Gestor' && user.role !== 'Suporte' && user.role !== 'Admin') {
        // Se não for nenhum desses roles (e não for Admin), não vê nada
        setProcesses([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await processQuery;

      if (error) {
        console.error("Erro ao buscar processos:", error);
      } else {
        const processesData = data.map(process => ({
          ...process,
          dataSubmissao: process.created_at
            ? new Date(process.created_at).toLocaleDateString('pt-BR')
            : 'Data Inválida'
        }));
        setProcesses(processesData);
      }
      setIsLoading(false);
    };

    fetchProcesses();

    // Realtime subscription (simplificada para qualquer mudança na tabela processes)
    // Nota: Em produção, idealmente filtraríamos também no realtime
    const subscription = supabase
      .channel('public:processes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'processes' }, () => {
        fetchProcesses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };

  }, [user]);

  return { processes, isLoading };
};

export default useProcesses;