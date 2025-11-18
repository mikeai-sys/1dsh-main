import { useState, useEffect, useRef } from 'react';
import { X, Settings, User, Trash2, Download, Globe, Palette, Upload, LogOut, Shield } from 'lucide-react';
import { UserService, UserSettings } from '../services/userService';
import { StreamingServiceManager } from '../services/streamingService';
import { DatabaseService } from '../services/databaseService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SecuritySettings from './SecuritySettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(UserService.getSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'data' | 'security'>('general');
  const { language, t } = useLanguage(); // Removed setLanguage
  const { user: supabaseUser, profile, signOut, refetchProfile } = useAuth();

  // Profile editing state
  const [name, setName] = useState(profile?.name || supabaseUser?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [accountType, setAccountType] = useState<'adult' | 'kids'>(profile?.account_type || 'adult'); // New state for account type
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(UserService.getSettings());
      setName(profile?.name || supabaseUser?.email || '');
      setAccountType(profile?.account_type || 'adult'); // Set account type when modal opens
      setAvatarFile(null);
    }
  }, [isOpen, profile, supabaseUser]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    UserService.updateSettings({ [key]: value });
    
    if (key === 'streamingService') {
      StreamingServiceManager.setActiveService(value);
    }
  };

  const handleProfileUpdate = async () => {
    if (!supabaseUser) return;
    setUploading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${supabaseUser.id}/profile.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = `${data.publicUrl}?t=${new Date().getTime()}`;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name, avatar_url: avatarUrl, account_type: accountType }) // Update account_type
        .eq('id', supabaseUser.id);

      if (updateError) throw updateError;

      await refetchProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setUploading(false);
      setAvatarFile(null);
    }
  };

  const handleDownloadData = async () => {
    let dataToDownload: any = {};
    if (supabaseUser) {
      const [favorites, history] = await Promise.all([
        DatabaseService.getFavorites(supabaseUser.id),
        DatabaseService.getWatchHistory(supabaseUser.id)
      ]);
      dataToDownload = { profile, favorites, history };
    } else {
      dataToDownload = {
        profile: UserService.getCurrentUser(),
        favorites: UserService.getFavorites(),
        history: UserService.getWatchHistory()
      };
    }

    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deltasilicon_hub_data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your watch history? This cannot be undone.')) {
      if (supabaseUser) {
        await DatabaseService.clearWatchHistory(supabaseUser.id);
      } else {
        UserService.clearHistory();
      }
      alert('Watch history cleared.');
    }
  };

  const handleClearFavorites = async () => {
    if (confirm('Are you sure you want to clear all your favorites? This cannot be undone.')) {
      if (supabaseUser) {
        await DatabaseService.clearFavorites(supabaseUser.id);
      } else {
        UserService.clearFavorites();
      }
      alert('Favorites cleared.');
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', name: t('general'), icon: Settings },
    { id: 'account', name: t('account'), icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: t('data'), icon: Download }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t('settings')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg"><X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" /></button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 min-h-0">
          <div className="w-full sm:w-48 md:w-64 border-b sm:border-b-0 sm:border-r border-gray-700 p-4 flex-shrink-0">
            <nav className="flex sm:flex-col gap-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-3 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base w-full text-left ${activeTab === tab.id ? 'bg-yellow-400 text-black font-semibold' : 'text-gray-300 hover:bg-gray-800'}`}>
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:block">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />{t('language')}</h3>
                  <select value={language} onChange={(e) => handleSettingChange('language', e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400/50 focus:outline-none text-sm">
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="ar">العربية</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="nl">Nederlands</option>
                    <option value="sv">Svenska</option>
                    <option value="zh">中文 (Chinese)</option>
                    <option value="kab">Taqbaylit (Kabyle)</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2"><Palette className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />Theme</h3>
                  <div className="flex gap-4">
                    <button onClick={() => handleSettingChange('theme', 'dark')} className={`px-4 py-2 rounded-lg border ${settings.theme === 'dark' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 border-gray-600'}`}>Dark</button>
                    <button onClick={() => handleSettingChange('theme', 'light')} className={`px-4 py-2 rounded-lg border ${settings.theme === 'light' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 border-gray-600'}`}>Light</button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'account' && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">{t('account_information')}</h3>
                {supabaseUser ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={avatarFile ? URL.createObjectURL(avatarFile) : profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${name}`} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                        <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-yellow-400 text-black rounded-full hover:bg-yellow-300">
                          <Upload className="w-4 h-4" />
                        </button>
                        <input type="file" ref={avatarInputRef} onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} accept="image/*" className="hidden" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{name}</p>
                        <p className="text-sm text-gray-400">{supabaseUser.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('name')}</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
                    </div>
                    {/* Account Type Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('account_type')}</label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as 'adult' | 'kids')}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400/50 focus:outline-none text-sm"
                      >
                        <option value="adult">{t('adult_account')}</option>
                        <option value="kids">{t('kids_account')}</option>
                      </select>
                      {accountType === 'kids' && (
                        <p className="mt-2 text-xs text-gray-400">{t('kids_recommendations_info')}</p>
                      )}
                    </div>
                    <button onClick={handleProfileUpdate} disabled={uploading} className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50">
                      {uploading ? t('saving') : t('save_changes')}
                    </button>
                    <div className="border-t border-gray-700 pt-6">
                      <button onClick={signOut} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                        <LogOut className="w-5 h-5" /> {t('logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">{t('guest_account_info')}</p>
                )}
              </div>
            )}
            {activeTab === 'security' && (
              <SecuritySettings />
            )}
            {activeTab === 'data' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">{t('manage_your_data')}</h3>
                  <p className="text-sm text-gray-400 mb-4">{t('data_download_info')}</p>
                  <button onClick={handleDownloadData} className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700">
                    <Download className="w-4 h-4" /> {t('download_my_data')}
                  </button>
                </div>
                <div className="border-t border-gray-700 pt-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-4">{t('danger_zone')}</h3>
                  <div className="space-y-4">
                    <button onClick={handleClearHistory} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" /> {t('clear_watch_history')}
                    </button>
                    <button onClick={handleClearFavorites} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" /> {t('clear_favorites')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;