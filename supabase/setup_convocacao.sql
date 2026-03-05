-- ==========================================
-- GESTÃO DE CONVOCAÇÕES ESPECIAIS
-- ==========================================

-- 1. Tabela de Convocações (Criadas pelo Gestor)
CREATE TABLE IF NOT EXISTS convocacoes_especiais (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'aberta', -- 'aberta', 'em_analise', 'finalizada', 'cancelada'
    link_edital TEXT,
    link_retificacao TEXT,
    link_resultado TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Inscrições na Convocação
CREATE TABLE IF NOT EXISTS inscricoes_convocacao (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    convocacao_id UUID REFERENCES convocacoes_especiais(id) ON DELETE CASCADE,
    candidato_cpf VARCHAR(14) NOT NULL,
    dados_inscricao JSONB DEFAULT '{}'::jsonb,
    status_inscricao VARCHAR(50) DEFAULT 'inscrito', -- 'inscrito', 'em_analise', 'convocado', 'desclassificado'
    observacao_gestor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(convocacao_id, candidato_cpf)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_convocacoes_status ON convocacoes_especiais(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_cpf ON inscricoes_convocacao(candidato_cpf);
CREATE INDEX IF NOT EXISTS idx_inscricoes_convocacao ON inscricoes_convocacao(convocacao_id);

-- 3. Habilitar RLS
ALTER TABLE convocacoes_especiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes_convocacao ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para convocacoes_especiais
-- Todos podem ver as convocações abertas ou finalizadas (Candidatos leem)
CREATE POLICY "Leitura pública de convocações" 
ON convocacoes_especiais FOR SELECT 
USING (true);

-- Apenas admins/gestores podem inserir/atualizar/deletar convocações
CREATE POLICY "Gestão total de convocações para admins" 
ON convocacoes_especiais FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'gestor')
    )
);

-- 5. Políticas para inscricoes_convocacao
-- Inserção pública (Candidatos se inscrevem sem login auth da supabase, usando CPF)
CREATE POLICY "Candidatos podem se inscrever" 
ON inscricoes_convocacao FOR INSERT 
WITH CHECK (true);

-- Leitura pública baseada no CPF (Opcional, se a consulta for via edge function ou RLS aberta com filtro no front)
CREATE POLICY "Qualquer um pode ler inscrições" 
ON inscricoes_convocacao FOR SELECT 
USING (true);

-- Atualização restrita a admins/gestores (mudar status, adicionar observacao)
CREATE POLICY "Gestão de inscrições para admins" 
ON inscricoes_convocacao FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'gestor')
    )
);

-- Enable Realtime
alter publication supabase_realtime add table convocacoes_especiais;
alter publication supabase_realtime add table inscricoes_convocacao;

-- ==========================================
-- LISTA DE CANDIDATOS APTOS (UPLOAD DE EXCEL)
-- ==========================================

-- 6. Tabela de Candidatos Aptos
CREATE TABLE IF NOT EXISTS candidatos_aptos_convocacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    convocacao_id UUID REFERENCES convocacoes_especiais(id) ON DELETE CASCADE,
    candidato_cpf VARCHAR(14) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(convocacao_id, candidato_cpf)
);

-- Índices de busca rápida
CREATE INDEX IF NOT EXISTS idx_candidatos_aptos_cpf ON candidatos_aptos_convocacao(candidato_cpf);
CREATE INDEX IF NOT EXISTS idx_candidatos_aptos_convocacao ON candidatos_aptos_convocacao(convocacao_id);

-- RLS
ALTER TABLE candidatos_aptos_convocacao ENABLE ROW LEVEL SECURITY;

-- Leitura de aptos (Candidato precisará ler para validar sua própria inscrição)
CREATE POLICY "Leitura de aptos" 
ON candidatos_aptos_convocacao FOR SELECT 
USING (true);

-- Gestão exclusiva pelo admin/gestor
CREATE POLICY "Gestor pode gerir aptos" 
ON candidatos_aptos_convocacao FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'gestor')
    )
);
