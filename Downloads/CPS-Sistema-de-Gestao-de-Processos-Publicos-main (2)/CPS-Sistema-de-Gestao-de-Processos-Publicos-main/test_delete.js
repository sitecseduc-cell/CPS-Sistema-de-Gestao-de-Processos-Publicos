require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function testDelete() {
    console.log("Fetching a vacancy...");
    // Create a dummy vacancy first to safely delete
    const { data: insertData, error: insertError } = await supabase
        .from('controle_vagas')
        .insert({
            cargo_funcao: 'VAGA TESTE PARA DELETAR',
            municipio: 'SÃO PAULO',
            servidor: 'Vaga Dummy'
        })
        .select('*');

    if (insertError) {
        console.error("Insert Error (RLS?):", insertError);
        return;
    }

    const vagaId = insertData[0].id;
    console.log("Successfully inserted dummy vacancy:", vagaId);

    console.log("Attempting to delete it...");
    const { data: deleteData, error: deleteError } = await supabase
        .from('controle_vagas')
        .delete()
        .eq('id', vagaId)
        .select();

    console.log("Delete Result:");
    console.log("Data:", deleteData);
    console.log("Error:", deleteError);
}

testDelete();
