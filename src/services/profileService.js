import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export const profileService = {

  // --- PERFIS (ROLES) ---

  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async createRole(role) {
    const id = role.id || role.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    const { data, error } = await supabase
      .from('roles')
      .insert([{
        id,
        name: role.name,
        description: role.description,
        color: role.color
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRole(id, updates) {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRole(id) {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },


  // --- REGRAS DO SISTEMA ---

  async getRules() {
    const { data, error } = await supabase
      .from('access_rules')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data;
  },

  async addRule(rule) {
    // Garante ID único formatado
    const id = rule.id || rule.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');

    const { data, error } = await supabase
      .from('access_rules')
      .insert([{
        id,
        name: rule.name,
        description: rule.description,
        category: rule.category
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRule(ruleId) {
    const { error } = await supabase
      .from('access_rules')
      .delete()
      .eq('id', ruleId);

    if (error) throw error;
    return true;
  },

  // --- MATRIZ DE PERMISSÕES ---

  async getPermissions() {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*');

    if (error) throw error;

    // Transforma em objeto: { 'admin': ['rule1', 'rule2'], 'gestor': [...] }
    const matrix = {};
    data.forEach(p => {
      if (!matrix[p.role]) matrix[p.role] = [];
      matrix[p.role].push(p.rule_id);
    });

    return matrix;
  },

  async togglePermission(role, ruleId, shouldAdd) {
    if (shouldAdd) {
      const { error } = await supabase
        .from('role_permissions')
        .insert([{ role, rule_id: ruleId }]);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .match({ role, rule_id: ruleId });
      if (error) throw error;
    }
    return true;
  },

  // --- USUÁRIOS E PERFIS ---

  async getUsers() {
    // Busca perfis da tabela pública 'profiles'
    // Limitando a 100 para evitar lentidão (TODO: Implementar paginação real)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, updated_at')
      .order('full_name') // Ordenação alfabética
      .limit(100);

    if (error) throw error;

    return data.map(u => ({
      id: u.id,
      name: u.full_name || 'Usuário sem nome',
      email: u.email || 'Email oculto',
      role: u.role || 'servidor',
      status: 'ativo', // Supabase não expõe status de sessão facilmente via API pública, assumimos ativo
      lastAccess: new Date(u.updated_at).toLocaleDateString()
    }));
  },

  async updateUserRole(userId, newRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  async createUser(userData) {
    // ⚠️ CRITICAL: Use a separate client instance to avoid logging out the current admin
    // This allows us to create a new user without replacing the local session
    const tempSupabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
        },
      },
    });

    if (authError) throw authError;

    // If signup successful, ensure role is set correctly using our ADMIN privileges
    // (The trigger creates the profile, we just update the role)
    if (authData.user) {
      // Give the trigger a moment or ensure we can update
      await new Promise(r => setTimeout(r, 1000)); // Small safety delay for trigger

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role,
          full_name: userData.name // FORCE update name to ensure it's saved
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.warn('User created but profile update failed:', profileError);
      }
    }

    return authData;
  }
};
