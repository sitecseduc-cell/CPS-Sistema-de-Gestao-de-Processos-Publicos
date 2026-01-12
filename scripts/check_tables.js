import { supabase } from '../src/lib/supabaseClient.js';

async function checkTables() {
    console.log('Checking tables...');

    const tables = ['profiles', 'access_rules', 'role_permissions'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`❌ Table '${table}' check failed:`, error.message);
        } else {
            console.log(`✅ Table '${table}' exists and is accessible.`);
        }
    }
}

checkTables();
