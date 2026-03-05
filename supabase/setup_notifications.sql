-- ==========================================
-- GESTÃO DE NOTIFICAÇÕES (system_notifications)
-- ==========================================

-- 1. Criação da Tabela
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'system', -- 'system', 'audit', 'chat', 'alert'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON system_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON system_notifications(created_at);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Políticas (Policies)
-- Usuários podem ver suas próprias notificações
CREATE POLICY "Usuários podem ver suas próprias notificações" 
ON system_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Usuários podem atualizar (ex: marcar como lido) suas próprias notificações
CREATE POLICY "Usuários podem atualizar suas notificações" 
ON system_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias notificações
CREATE POLICY "Usuários podem deletar suas notificações" 
ON system_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- O sistema (funções invoker / service role) pode inserir notificações, 
-- Administradores também podem inserir notificações
CREATE POLICY "Admins podem inserir notificações para todos" 
ON system_notifications 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'gestor')
    )
    OR auth.uid() = user_id
);

-- 5. Habilitar o Realtime para a tabela
alter publication supabase_realtime add table system_notifications;
