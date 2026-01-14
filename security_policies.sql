-- ==========================================
-- MIGRATION: Security & RLS Policies
-- ==========================================

-- 1. Enable RLS on Tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

-- 2. Policies for PROFILES
-- View own profile: Users can see their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Update own profile: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Admins/Managers view all: Admins and Managers need to see everyone
CREATE POLICY "Admins/Managers view all profiles" 
ON profiles FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'gestor')
  )
);

-- 3. Policies for CANDIDATOS
-- Read access: Public or Authenticated depending on rules. 
-- Assuming authenticated users (like panel viewers) need to read, or maybe strict owners?
-- Let's allow Admins/Managers to do everything.
CREATE POLICY "Admins/Managers manage candidatos" 
ON candidatos FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'gestor')
  )
);

-- 4. Policies for PROCESSOS
-- Public Read: Candidates need to see open processes
CREATE POLICY "Public view open processes" 
ON processos FOR SELECT 
USING (true);

-- Admin/Manager Write: Only staff can create/edit processes
CREATE POLICY "Admins/Managers manage processos" 
ON processos FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'gestor')
  )
);
