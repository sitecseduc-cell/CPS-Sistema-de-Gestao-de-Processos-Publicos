import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PROCESSO_ID = "e3b67efe-b25a-44eb-9e78-8a1190b6b54f";

async function limparVagas() {
    console.log('🗑️  Limpando vagas do processo...');

    const { error } = await supabase
        .from('vagas')
        .delete()
        .eq('processo_id', PROCESSO_ID);

    if (error) {
        console.error('❌ Erro ao limpar vagas:', error.message);
    } else {
        console.log('✅ Vagas limpas com sucesso!');
    }
}

limparVagas();
