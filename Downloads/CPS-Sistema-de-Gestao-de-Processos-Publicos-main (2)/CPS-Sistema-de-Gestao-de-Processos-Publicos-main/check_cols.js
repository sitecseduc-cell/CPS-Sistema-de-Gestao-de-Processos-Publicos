import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtabcmusmorupvpkptif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWJjbXVzbW9ydXB2cGtwdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkwMDIsImV4cCI6MjA4MDg4NTAwMn0.8dh6YD6rirR8mHA7ffdKmYqwzqHCypn2XAWkBQS5vf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: selectData } = await supabase.from('controle_vagas').select('*').limit(1);
    if (selectData && selectData.length > 0) {
        console.log(Object.keys(selectData[0]).join(', '));
    }
}
check();
