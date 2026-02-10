import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook para escutar mudanças no banco de dados em tempo real.
 * @param {string} table - Nome da tabela (ex: 'notifications')
 * @param {function} callback - Função a ser executada quando houver mudança
 * @param {Array} filter - (Opcional) Array de dependências para reiniciar o listener
 */
export const useRealtime = (table, callback, filter = []) => {
    useEffect(() => {
        const channel = supabase
            .channel(`public:${table}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: table },
                (payload) => {
                    console.log(`Alteração detectada em ${table}:`, payload);
                    callback(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, ...filter]);
};
