import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtabcmusmorupvpkptif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWJjbXVzbW9ydXB2cGtwdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkwMDIsImV4cCI6MjA4MDg4NTAwMn0.8dh6YD6rirR8mHA7ffdKmYqwzqHCypn2XAWkBQS5vf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'luan.furtado@seduc.pa.gov.br',
        password: 'Giuliano0703',
    });

    console.log("My Node UID:", authData?.user?.id);

    const { data: selectData } = await supabase.from('controle_vagas').select('*').limit(1);
    if (selectData && selectData.length > 0) {
        console.log("Vaga keys:", Object.keys(selectData[0]));
        // Check if there is a 'user_id' or 'created_by'
        const vaga = selectData[0];
        console.log("Vaga data:", vaga);
    }
}
check();
