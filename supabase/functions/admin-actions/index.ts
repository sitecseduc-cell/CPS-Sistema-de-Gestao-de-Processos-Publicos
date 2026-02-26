// supabase/functions/admin-actions/index.ts
// Edge Function para ações exclusivas de administrador.
// Usa SERVICE_ROLE_KEY (auto-injetada pelo Supabase) — NUNCA exposta ao cliente.
//
// Deploy: supabase functions deploy admin-actions
//
// Actions disponíveis:
//   - createUser: cria usuário via supabase.auth.admin.createUser()

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Cria cliente admin com SERVICE_ROLE_KEY — tem permissões totais no banco
function createAdminClient() {
    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!url || !serviceKey) {
        throw new Error('Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Verifica se o chamador é um admin autenticado
async function verifyAdminCaller(authHeader: string | null): Promise<boolean> {
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createAdminClient();

    // Busca o usuário pelo token JWT
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;

    // Verifica o perfil no banco
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'admin';
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');

        // ✅ Apenas admins autenticados podem chamar esta função
        const isAdmin = await verifyAdminCaller(authHeader);
        if (!isAdmin) {
            return new Response(
                JSON.stringify({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { action, payload } = await req.json();
        const supabaseAdmin = createAdminClient();

        // ──────────────────────────────────────────────
        // ACTION: createUser
        // Cria um novo usuário usando a API admin do Supabase
        // ──────────────────────────────────────────────
        if (action === 'createUser') {
            const { email, password, name, role } = payload;

            if (!email || !password || !name || !role) {
                return new Response(
                    JSON.stringify({ error: 'Campos obrigatórios: email, password, name, role.' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Cria o usuário com email já confirmado (sem precisar de verificação)
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Confirma o email automaticamente
                user_metadata: {
                    full_name: name,
                    role,
                },
            });

            if (authError) throw authError;

            // Garante que o perfil foi criado/atualizado com o role correto
            // (o trigger do banco faz isso automaticamente, mas forçamos aqui como garantia)
            if (authData.user) {
                await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        email,
                        full_name: name,
                        role,
                    }, { onConflict: 'id' });

                // Registra no audit log
                await supabaseAdmin.rpc('log_audit_event', {
                    p_operation: 'INSERT',
                    p_table_name: 'profiles',
                    p_record_id: authData.user.id,
                    p_old_data: null,
                    p_new_data: { email, role },
                }).catch(() => { }); // Falha silenciosa no audit log
            }

            return new Response(
                JSON.stringify({ data: { userId: authData.user?.id, email } }),
                { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ──────────────────────────────────────────────
        // ACTION: deleteUser
        // Remove um usuário permanentemente (soft-delete opcional)
        // ──────────────────────────────────────────────
        if (action === 'deleteUser') {
            const { userId } = payload;
            if (!userId) {
                return new Response(
                    JSON.stringify({ error: 'userId é obrigatório.' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (error) throw error;

            return new Response(
                JSON.stringify({ data: { deleted: true } }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: `Ação desconhecida: ${action}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro interno';
        console.error('[admin-actions] ❌', message);
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
