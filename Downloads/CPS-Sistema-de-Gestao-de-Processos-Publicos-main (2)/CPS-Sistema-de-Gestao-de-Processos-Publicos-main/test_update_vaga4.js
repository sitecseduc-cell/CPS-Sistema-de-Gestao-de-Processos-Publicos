import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtabcmusmorupvpkptif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWJjbXVzbW9ydXB2cGtwdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkwMDIsImV4cCI6MjA4MDg4NTAwMn0.8dh6YD6rirR8mHA7ffdKmYqwzqHCypn2XAWkBQS5vf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'luan.furtado@seduc.pa.gov.br',
        password: 'Giuliano0703',
    });

    const { data: selectData } = await supabase.from('controle_vagas').select('*').ilike('servidor', '%Vaga Nova 4%').limit(1);
    if (selectData && selectData.length > 0) {
        const vaga = selectData[0];
        console.log("Found Vaga to Update:", vaga.id, vaga.servidor);

        const payload = {
            status: 'OCUPADO',
            atendido_candidato: "NILSON CARLOS (Node Test)",
            observacao: `Homologado via CSV (Vagas Especiais) - Match: 95%`
        };

        const { data: updateData, error: updateError } = await supabase
            .from('controle_vagas')
            .update(payload)
            .eq('id', vaga.id)
            .select('*');

        console.log("UPDATE Response:", { updateData, updateError });
    } else {
        console.log("Could not find Vaga Nova 4");
    }
}
check();
