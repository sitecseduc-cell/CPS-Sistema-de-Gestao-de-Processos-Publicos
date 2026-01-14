-- ==========================================
-- MIGRATION: Access Control System (RBAC)
-- ==========================================

-- 1. Table: Roles (Perfis de Acesso)
CREATE TABLE IF NOT EXISTS roles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- 2. Table: Access Rules (Regras de Permissão)
CREATE TABLE IF NOT EXISTS access_rules (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text DEFAULT 'Sistema',
  created_at timestamptz DEFAULT now()
);

-- 3. Table: Matrix of Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
  role text REFERENCES roles(id) ON DELETE CASCADE,
  rule_id text REFERENCES access_rules(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role, rule_id)
);

-- 4. Enable RLS (Security)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Allow Admins to manage, Everyone to read (so UI works)
-- ROLES
CREATE POLICY "Public read roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Admins manage roles" ON roles FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- RULES
CREATE POLICY "Public read rules" ON access_rules FOR SELECT USING (true);
CREATE POLICY "Admins manage rules" ON access_rules FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- PERMISSIONS
CREATE POLICY "Public read permissions" ON role_permissions FOR SELECT USING (true);
CREATE POLICY "Admins manage permissions" ON role_permissions FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 6. Seed Default Data (Initial Setup)
INSERT INTO roles (id, name, description, color) VALUES
('admin', 'Administrador', 'Acesso total ao sistema', 'bg-red-100 text-red-700 border-red-200'),
('gestor', 'Gestor', 'Gerencia processos e candidatos', 'bg-blue-100 text-blue-700 border-blue-200'),
('servidor', 'Servidor', 'Visualiza informações básicas', 'bg-slate-100 text-slate-700 border-slate-200'),
('visitante', 'Visitante', 'Acesso restrito', 'bg-slate-50 text-slate-500 border-slate-100')
ON CONFLICT (id) DO NOTHING;

INSERT INTO access_rules (id, name, description, category) VALUES
('manage_users', 'Gerenciar Usuários', 'Criar, editar e remover usuários', 'Sistema'),
('manage_roles', 'Gerenciar Perfis', 'Criar e editar perfis de acesso', 'Sistema'),
('view_dashboard', 'Ver Dashboard', 'Acesso aos indicadores', 'Dashboard'),
('manage_processes', 'Gerenciar Processos', 'Criar e editar editais', 'Processos')
ON CONFLICT (id) DO NOTHING;

-- Grant all to Admin
INSERT INTO role_permissions (role, rule_id)
SELECT 'admin', id FROM access_rules
ON CONFLICT DO NOTHING;
