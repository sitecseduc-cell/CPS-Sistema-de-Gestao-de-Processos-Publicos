-- ==========================================
-- MIGRATION: Performance Optimization Pack (CORRECTED)
-- ==========================================

-- 1. DROP EXISTING FUNCTIONS TO AVOID CONFLICTS
DROP FUNCTION IF EXISTS get_dashboard_stats;
DROP FUNCTION IF EXISTS get_my_profile;

-- 2. INDEXES FOR PERFORMANCE
-- Adiciona índices para filtros comuns se não existirem
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
-- Index para status de candidatos
CREATE INDEX IF NOT EXISTS idx_candidatos_status ON candidatos(status);

-- 3. RPC: get_dashboard_stats
-- Busca tudo em uma única query rápida
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_candidatos bigint;
  v_total_processos bigint;
  v_vagas_preenchidas bigint;
  v_em_analise bigint;
  v_classificados bigint;
  v_convocados bigint;
BEGIN
  -- Contagens rápidas da tabela correta 'candidatos'
  SELECT count(*) INTO v_total_candidatos FROM candidatos;
  
  -- Contagem de processos abertos
  SELECT count(*) INTO v_total_processos FROM processos WHERE status = 'aberto';
  
  -- Funil base nos status reais identificados (case insensitive para segurança)
  SELECT count(*) INTO v_em_analise FROM candidatos WHERE status ILIKE '%Análise%';
  SELECT count(*) INTO v_classificados FROM candidatos WHERE status ILIKE '%Classificado%';
  SELECT count(*) INTO v_convocados FROM candidatos WHERE status ILIKE '%Convocado%';
  
  -- Vagas preenchidas (exemplo: status Contratado)
  SELECT count(*) INTO v_vagas_preenchidas FROM candidatos WHERE status ILIKE '%Contratado%';

  RETURN json_build_object(
    'total_candidatos', v_total_candidatos,
    'total_processos', v_total_processos,
    'vagas_preenchidas', v_vagas_preenchidas,
    'em_analise', v_em_analise,
    'classificados', v_classificados,
    'convocados', v_convocados
  );
END;
$$;

-- 4. RPC: get_my_profile
-- Retorna o perfil do usuário logado de forma segura e rápida
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_profile json;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN null;
  END IF;

  SELECT row_to_json(p) INTO v_profile
  FROM profiles p
  WHERE p.id = v_user_id;

  RETURN v_profile;
END;
$$;
