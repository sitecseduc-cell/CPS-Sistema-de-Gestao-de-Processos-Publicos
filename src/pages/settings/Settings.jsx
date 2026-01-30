import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Icon from '../../components/Icon'; // Caminho atualizado

// Cole TODOS os componentes de Configurações do App.jsx aqui
// SettingsInputField, ToggleSwitch, ProfileSettings, AppearanceSettings, SecuritySettings, NotificationSettings, e SettingsComponent

const SettingsInputField = ({ id, label, type, name, value, onChange, placeholder, disabled = false }) => (
  <div className="flex-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

const ToggleSwitch = ({ id, name, label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <button
      id={id}
      name={name}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange({ target: { name, checked: !checked } })}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const ProfileSettings = ({ user }) => {
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.username,
          avatar: profile.avatar,
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Perfil salvo com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert('Erro ao salvar perfil.');
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Perfil Público</h3>
      <form onSubmit={handleProfileSave} className="space-y-6">
        <div className="flex items-center space-x-4">
          <img src={profile.avatar || `https://placehold.co/100x100/eeeeee/333333?text=${profile.username?.charAt(0) || '?'}`} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          <SettingsInputField id="avatar" label="URL do Avatar" type="text" name="avatar" value={profile.avatar} onChange={handleProfileChange} />
        </div>
        <SettingsInputField id="username" label="Nome Completo" type="text" name="username" value={profile.username} onChange={handleProfileChange} />
        <SettingsInputField id="email-profile" label="Email" type="email" name="email" value={profile.email} onChange={() => { }} disabled={true} />
        <div className="flex justify-end pt-2">
          <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

const AppearanceSettings = ({ darkMode, toggleDarkMode }) => (
  <div className="animate-fade-in">
    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Aparência</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">Personalize a aparência do sistema ao seu gosto.</p>
    <ToggleSwitch
      id="dark-mode-toggle"
      name="darkMode"
      label="Modo Escuro"
      description="Ative para uma experiência com menos brilho."
      checked={darkMode}
      onChange={toggleDarkMode}
    />
  </div>
);

const SecuritySettings = () => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      alert('Senha alterada com sucesso!');
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert('Erro ao alterar senha.');
    }
  };
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Segurança da Conta</h3>
      <form onSubmit={handlePasswordSave} className="space-y-4">
        <SettingsInputField id="currentPassword" name="current" label="Senha Atual" type="password" value={passwords.current} onChange={handlePasswordChange} />
        <SettingsInputField id="newPassword" name="new" label="Nova Senha" type="password" value={passwords.new} onChange={handlePasswordChange} />
        <SettingsInputField id="confirmPassword" name="confirm" label="Confirmar Nova Senha" type="password" value={passwords.confirm} onChange={handlePasswordChange} />
        <div className="flex justify-end pt-2">
          <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Alterar Senha
          </button>
        </div>
      </form>
    </div>
  );
};

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
  });
  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Preferências de Notificação</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Escolha como você deseja ser notificado sobre as atividades.</p>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <ToggleSwitch
          id="email-notifications"
          name="email"
          label="Notificações por E-mail"
          description="Receba resumos e alertas importantes no seu e-mail."
          checked={notifications.email}
          onChange={handleNotificationChange}
        />
        <ToggleSwitch
          id="in-app-notifications"
          name="inApp"
          label="Notificações na Plataforma"
          description="Mostra alertas dentro do sistema."
          checked={notifications.inApp}
          onChange={handleNotificationChange}
        />
      </div>
    </div>
  );
};

// Componente principal exportado
const SettingsComponent = ({ user, darkMode, toggleDarkMode }) => {
  const [activeSettingTab, setActiveSettingTab] = useState('perfil');
  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: 'user' },
    { id: 'aparencia', label: 'Aparência', icon: 'sun' },
    { id: 'seguranca', label: 'Segurança', icon: 'shieldCheck' },
    { id: 'notificacoes', label: 'Notificações', icon: 'bell' },
  ];

  const renderTabContent = () => {
    switch (activeSettingTab) {
      case 'perfil': return <ProfileSettings user={user} />;
      case 'aparencia': return <AppearanceSettings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      case 'seguranca': return <SecuritySettings />;
      case 'notificacoes': return <NotificationSettings />;
      default: return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h2>
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSettingTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-lg ${activeSettingTab === tab.id
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent'
              }`}
          >
            <Icon name={tab.icon} className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SettingsComponent;