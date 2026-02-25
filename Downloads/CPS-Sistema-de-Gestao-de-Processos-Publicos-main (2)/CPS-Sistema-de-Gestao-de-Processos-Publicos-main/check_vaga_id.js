import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtabcmusmorupvpkptif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWJjbXVzbW9ydXB2cGtwdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkwMDIsImV4cCI6MjA4MDg4NTAwMn0.8dh6YD6rirR8mHA7ffdKmYqwzqHCypn2XAWkBQS5vf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'luan.furtado@seduc.pa.gov.br',
        password: 'Giuliano0703',
    });
    if (authError) {
        console.error("Login failed:", authError.message);
        return;
    }

    const { data, error } = await supabase.from('controle_vagas').select('*');
    console.log("Vagas:", data?.length);
    if (data && data.length > 0) {
        console.log("Sample vaga:", data[0]);
    }
}
check();
