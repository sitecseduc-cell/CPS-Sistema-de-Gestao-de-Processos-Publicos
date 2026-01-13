import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DebugStatus() {
    const [statuses, setStatuses] = useState(null);

    useEffect(() => {
        async function check() {
            const { data, error } = await supabase.from('candidatos').select('status');
            if (error) {
                console.error('Debug Error:', error);
                return;
            }
            const counts = {};
            data.forEach(c => {
                const s = c.status || 'NULL';
                counts[s] = (counts[s] || 0) + 1;
            });
            console.log('DEBUG STATUS COUNTS:', counts);
            setStatuses(counts);
        }
        check();
    }, []);

    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded z-50 text-xs font-mono">
            <h3 className="font-bold border-b mb-2">Debug DB Statuses</h3>
            <pre>{JSON.stringify(statuses, null, 2)}</pre>
        </div>
    );
}
