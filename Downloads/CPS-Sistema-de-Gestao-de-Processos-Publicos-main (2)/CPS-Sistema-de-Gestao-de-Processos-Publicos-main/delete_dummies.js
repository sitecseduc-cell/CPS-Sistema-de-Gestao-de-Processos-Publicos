import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtabcmusmorupvpkptif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWJjbXVzbW9ydXB2cGtwdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkwMDIsImV4cCI6MjA4MDg4NTAwMn0.8dh6YD6rirR8mHA7ffdKmYqwzqHCypn2XAWkBQS5vf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'luan.furtado@seduc.pa.gov.br',
        password: 'Giuliano0703',
    });

    if (authError) {
        console.log("Login erro", authError);
        return;
    }

    // Delete all dummy vacancies created by the script (Vaga Nova 1, 2, 3, 4)
    const { data, error } = await supabase.from('controle_vagas')
        .delete()
        .ilike('servidor', 'Vaga Nova%')
        .select();

    console.log("Deleted dummy vacancies:", data?.length);
    if (error) console.error(error);
}
clean();
