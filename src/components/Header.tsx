import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, User, LogOut, Smile } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentUser: any;
  onLoginClick: () => void;
  onLogout: () => void;
  currentAccountType: 'adult' | 'kids';
  onToggleAccountType: () => void;
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentUser,
  onLoginClick,
  onLogout,
  currentAccountType,
  onToggleAccountType,
  isLoggedIn,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-800 bg-black/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <button
        onClick={onToggleSidebar}
        className="p-2 text-gray-400 hover:text-white lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate('/search')}
          className="p-2 text-gray-400 hover:text-white"
          title="Search"
        >
          <Search className="h-5 w-5" />
        </button>

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