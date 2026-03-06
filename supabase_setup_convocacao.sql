-- supabase_setup_convocacao.sql
-- Módulo de Convocação de Psicólogos - Scripts de Setup do Banco de Dados (Supabase)

-- 1. TABELA DE REGRAS DE ALOCAÇÃO
CREATE TABLE IF NOT EXISTS public.regras_alocacao_psicologo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descricao TEXT NOT NULL,
    total_vagas_disponivel INTEGER DEFAULT 200,
    psic_por_escolas_pequenas INTEGER DEFAULT 3,
    limite_pequeno_max INTEGER DEFAULT 700,
    limite_medio_b_max INTEGER DEFAULT 999,
    psic_por_alunos_grande INTEGER DEFAULT 1000,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    changed_by TEXT DEFAULT 'Sistema'
);

-- Inserir Regra Padrão Inicial
INSERT INTO public.regras_alocacao_psicologo (descricao) 
VALUES ('Regra Padrão Inicial do Edital')
ON CONFLICT DO NOTHING;

-- 2. TABELA DO HISTÓRICO DE ETL (IMPORTAÇÕES)
CREATE TABLE IF NOT EXISTS public.etl_imports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_arquivo TEXT NOT NULL,
    tamanho_bytes BIGINT,
    total_escolas INTEGER,
    processado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'Concluído'
);

-- 3. TABELA BASE DE ESCOLAS (Populado pelo ETL)
CREATE TABLE IF NOT EXISTS public.escolas_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    import_id UUID REFERENCES public.etl_imports(id) ON DELETE CASCADE,
    nome_escola TEXT NOT NULL,
    municipio TEXT NOT NULL,
    dre TEXT,
    area_localizacao TEXT DEFAULT 'Urbana',
    total_alunos INTEGER NOT NULL,
    porte TEXT NOT NULL,
    psicologos_alocados NUMERIC DEFAULT 0,
    status_alocacao TEXT DEFAULT 'Pendente',
    meta_psicologos NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE CONVOCAÇÕES (Aprovados e Alocações Ocupadas)
CREATE TABLE IF NOT EXISTS public.convocacoes_psicologo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidato_nome TEXT NOT NULL,
    candidato_cpf TEXT,
    candidato_email TEXT,
    candidato_telefone TEXT,
    classificacao INTEGER,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Análise', 'Convocado', 'Empossado', 'Desistente', 'Substituído')),
    
    escola_destino TEXT,
    municipio TEXT,
    dre TEXT,
    escola_id UUID REFERENCES public.escolas_base(id) ON DELETE SET NULL, -- Novo campo de vinculo forte
    
    data_convocacao DATE DEFAULT CURRENT_DATE,
    data_resposta DATE,
    data_posse DATE,
    observacoes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Forçar a adição das colunas caso a tabela já existisse antes do script inteiro
ALTER TABLE public.convocacoes_psicologo 
    ADD COLUMN IF NOT EXISTS escola_destino TEXT,
    ADD COLUMN IF NOT EXISTS municipio TEXT,
    ADD COLUMN IF NOT EXISTS dre TEXT,
    ADD COLUMN IF NOT EXISTS escola_id UUID REFERENCES public.escolas_base(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS data_convocacao DATE DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS data_resposta DATE,
    ADD COLUMN IF NOT EXISTS data_posse DATE,
    ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Função de Trigger para o campo 'updated_at' na tabela das Regras
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_regras_alocacao ON public.regras_alocacao_psicologo;
CREATE TRIGGER trigger_update_regras_alocacao
    BEFORE UPDATE ON public.regras_alocacao_psicologo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_convocacao ON public.convocacoes_psicologo;
CREATE TRIGGER trigger_update_convocacao
    BEFORE UPDATE ON public.convocacoes_psicologo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. HABILITAR RLS e CRIAR POLÍTICAS PÚBLICAS RESTRITAS POR OPERAÇÃO (Acesso anônimo)
-- Políticas 'FOR ALL' por vezes falham no Insert anonimo dependendo da configuração do projeto Supabase. 
-- Fatiar por operação garante 100% de sucesso.
ALTER TABLE public.regras_alocacao_psicologo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etl_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocacoes_psicologo ENABLE ROW LEVEL SECURITY;

-- Limpeza
DROP POLICY IF EXISTS "Permitir Tudo Regras" ON public.regras_alocacao_psicologo;
DROP POLICY IF EXISTS "Permitir Tudo ETL" ON public.etl_imports;
DROP POLICY IF EXISTS "Permitir Tudo Escolas" ON public.escolas_base;
DROP POLICY IF EXISTS "Permitir Tudo Convocacoes" ON public.convocacoes_psicologo;

-- Regras
DROP POLICY IF EXISTS "Permitir Select Regras" ON public.regras_alocacao_psicologo;
CREATE POLICY "Permitir Select Regras" ON public.regras_alocacao_psicologo FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir Insert Regras" ON public.regras_alocacao_psicologo;
CREATE POLICY "Permitir Insert Regras" ON public.regras_alocacao_psicologo FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Update Regras" ON public.regras_alocacao_psicologo;
CREATE POLICY "Permitir Update Regras" ON public.regras_alocacao_psicologo FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Delete Regras" ON public.regras_alocacao_psicologo;
CREATE POLICY "Permitir Delete Regras" ON public.regras_alocacao_psicologo FOR DELETE USING (true);

-- ETL
DROP POLICY IF EXISTS "Permitir Select ETL" ON public.etl_imports;
CREATE POLICY "Permitir Select ETL" ON public.etl_imports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir Insert ETL" ON public.etl_imports;
CREATE POLICY "Permitir Insert ETL" ON public.etl_imports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Update ETL" ON public.etl_imports;
CREATE POLICY "Permitir Update ETL" ON public.etl_imports FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Delete ETL" ON public.etl_imports;
CREATE POLICY "Permitir Delete ETL" ON public.etl_imports FOR DELETE USING (true);

-- Escolas
DROP POLICY IF EXISTS "Permitir Select Escolas" ON public.escolas_base;
CREATE POLICY "Permitir Select Escolas" ON public.escolas_base FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir Insert Escolas" ON public.escolas_base;
CREATE POLICY "Permitir Insert Escolas" ON public.escolas_base FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Update Escolas" ON public.escolas_base;
CREATE POLICY "Permitir Update Escolas" ON public.escolas_base FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Delete Escolas" ON public.escolas_base;
CREATE POLICY "Permitir Delete Escolas" ON public.escolas_base FOR DELETE USING (true);

-- Convocacoes
DROP POLICY IF EXISTS "Permitir Select Convocacoes" ON public.convocacoes_psicologo;
CREATE POLICY "Permitir Select Convocacoes" ON public.convocacoes_psicologo FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir Insert Convocacoes" ON public.convocacoes_psicologo;
CREATE POLICY "Permitir Insert Convocacoes" ON public.convocacoes_psicologo FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Update Convocacoes" ON public.convocacoes_psicologo;
CREATE POLICY "Permitir Update Convocacoes" ON public.convocacoes_psicologo FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir Delete Convocacoes" ON public.convocacoes_psicologo;
CREATE POLICY "Permitir Delete Convocacoes" ON public.convocacoes_psicologo FOR DELETE USING (true);

-- 6. RECARREGAR CACHE DE SCHEMA DO POSTGREST (Supabase)
-- Envia um sinal para a API recarregar a estrutura imediatamente e reconhecer novas colunas
NOTIFY pgrst, 'reload schema';
