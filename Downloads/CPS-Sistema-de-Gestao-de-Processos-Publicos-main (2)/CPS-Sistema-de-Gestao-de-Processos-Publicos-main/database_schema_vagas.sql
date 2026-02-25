-- ========================================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Aplicação: CPS - Sistema de Gestão de Processos Públicos (Vagas Especiais)
-- ========================================================================================

-- 1. CRIAÇÃO DA TABELA PRINCIPAL 'controle_vagas'
-- Esta tabela armazena tanto as vagas reais alocadas a servidores quanto as vagas 
-- geradas pelo "Auto-Gerador" aguardando candidatos.

CREATE TABLE IF NOT EXISTS public.controle_vagas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Informações da Vaga Base
  matvin VARCHAR(255),
  servidor VARCHAR(255),               -- "Nome" da vaga original ou "VAGA NOVA"
  cargo_funcao VARCHAR(255) NOT NULL,  -- Prof de Matemática, etc.
  atividade VARCHAR(255),
  vacancia VARCHAR(255),               -- Motivo de vacância se for o caso
  status VARCHAR(50) DEFAULT 'LIVRE',  -- 'LIVRE', 'VAGO', 'OCUPADO'
  
  -- Localidade
  ultima_lotacao VARCHAR(255),
  dre VARCHAR(100),
  secretaria_pertencente VARCHAR(255),
  municipio VARCHAR(255) NOT NULL,     -- Cidade essencial para o algoritmo de Match
  
  -- Vagas Especiais & Homologação
  atendido_candidato VARCHAR(255),     -- Nome do candidato vencedor preenchido via CSV
  candidato_convocado Boolean DEFAULT false,
  observacao TEXT,                     -- Onde fica gravado o "Match: 95%"
  
  -- Relacionamento com o usuário que a criou (Opcional caso queira travar edições)
  user_id UUID REFERENCES auth.users(id)
);

-- 2. HABILITAR SEGURANÇA EM NIVEL DE LINHA (RLS - ROW LEVEL SECURITY)
-- Isso evita que usuários que não estejam logados modifiquem o banco
ALTER TABLE public.controle_vagas ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACESSO (POLICIES)

-- A) Política de LEITURA (SELECT)
-- Qualquer usuário autenticado no sistema pode VER as vagas na tela.
CREATE POLICY "Permitir leitura de vagas para usuários autenticados" 
ON public.controle_vagas
FOR SELECT 
TO authenticated 
USING (true);

-- B) Política de INSERÇÃO (INSERT)
-- O botão "Auto-Gerar Vagas Planilha" e "Nova Vaga" precisam desse acesso.
CREATE POLICY "Permitir inserção de vagas para usuários autenticados" 
ON public.controle_vagas
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- C) Política de ATUALIZAÇÃO (UPDATE)
-- O botão verde "Alocar Aqui" do VagasEspeciais precisa conseguir atualizar o status para OCUPADO
-- e gravar o nome na coluna atendido_candidato.
CREATE POLICY "Permitir atualização para usuários autenticados" 
ON public.controle_vagas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- D) Política de DELEÇÃO (DELETE)
-- Para a tabelinha do Controle de Vagas (ícone da lixeira) conseguir apagar vagas.
CREATE POLICY "Permitir deleção para usuários autenticados" 
ON public.controle_vagas
FOR DELETE
TO authenticated
USING (true);

-- ========================================================================================
-- FIM DO SCRIPT
-- ========================================================================================
-- COMO USAR:
-- 1. Abra seu painel da Supabase -> Projeto -> SQL Editor.
-- 2. Cole esse script inteiro e clique no botão verde "RUN" no canto direito inferior.
-- ========================================================================================
