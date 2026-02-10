-- Execute este script no SQL Editor do Supabase para corrigir permissões

-- 1. Garantir que a tabela users existe e tem as colunas corretas
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Gestor', 'Analista', 'Suporte')),
  sector TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Permitir que novos usuários insiram seu próprio perfil
-- (Importante para quando a trigger falha ou não existe)
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem criar seu próprio perfil"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Garantir políticas de leitura e atualização
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 5. Dar permissões ao role 'authenticated' e 'anon' (se necessário para registro)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;

-- 6. Recriar a Trigger (Opcional, mas recomendado para garantir robustez)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, sector)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Analista'),
    COALESCE(NEW.raw_user_meta_data->>'sector', null)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
