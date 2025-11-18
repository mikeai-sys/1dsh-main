import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, User, LogOut, Smile } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeTab: string;
  currentUser: any;
  onLoginClick: () => void;
  onLogout: () => void;
  currentAccountType: 'adult' | 'kids';
  onToggleAccountType: () => void;
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeTab,
  currentUser,
  onLoginClick,
  onLogout,
  currentAccountType,
  onToggleAccountType,
  isLoggedIn,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getPlaceholder = () => {
    if (activeTab === 'series') return t('search_series');
    if (activeTab === 'anime') return t('search_anime');
    return t('search_movies');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-800 bg-black/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <button
        onClick={onToggleSidebar}
        className="p-2 text-gray-400 hover:text-white lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900/50 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none"
        />
      </form>

      <div className="flex items-center gap-2 sm:gap-4">
        {isLoggedIn && (
          <button
            onClick={onToggleAccountType}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              currentAccountType === 'kids' ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
            title={currentAccountType === 'kids' ? t('exit_kids_mode') : t('enter_kids_mode')}
          >
            {currentAccountType === 'kids' ? (
              <Smile className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">
              {currentAccountType === 'kids' ? t('kids_mode') : t('adult_mode')}
            </span>
          </button>
        )}

        {currentUser ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-300 sm:inline">
              {t('welcome')}, {currentUser.name}
            </span>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-400"
              title={t('logout')}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">{t('sign_in')}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;