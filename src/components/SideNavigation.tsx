import { NavLink } from 'react-router-dom';
import { Film, Tv, Settings, History, Heart, HelpCircle, Info, Bell, Sparkles, MapPin, Smile, User } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
  onAIClick: () => void;
  locationPref: { accepted: boolean; countryName: string } | null;
  currentAccountType: 'adult' | 'kids';
  onToggleAccountType: () => void;
  isLoggedIn: boolean;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  isOpen, 
  onClose, 
  onSettingsClick, 
  onAIClick, 
  locationPref,
  currentAccountType,
  onToggleAccountType,
  isLoggedIn
}) => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', text: t('movies'), icon: Film },
    { to: '/dashboard/series', text: t('series'), icon: Tv },
    { to: '/dashboard/anime', text: t('anime'), icon: Sparkles },
  ];

  if (locationPref?.accepted) {
    navItems.push({ 
      to: '/dashboard/country', 
      text: t('country_movies_specific', { countryName: locationPref.countryName }), 
      icon: MapPin 
    });
  }

  const userItems = [
    { to: '/dashboard/history', text: t('history'), icon: History, requiresAuth: true },
    { to: '/dashboard/favorites', text: t('favorites'), icon: Heart, requiresAuth: true },
  ];

  const otherItems = [
    { to: '/updates', text: t('updates'), icon: Bell },
    { to: '/support', text: t('support'), icon: HelpCircle },
    { to: '/about', text: t('about'), icon: Info },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 transform flex-col border-r border-gray-800 bg-gray-900/95 backdrop-blur-sm transition-transform duration-300 lg:relative lg:w-20 lg:translate-x-0 xl:w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-gray-800 px-4 lg:justify-center xl:justify-start">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-400">
            <Film className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold text-yellow-400 glow-text lg:hidden xl:block">DSH</span>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex w-full items-center gap-4 rounded-lg p-3 transition-colors group xl:justify-start lg:justify-center ${
                  isActive ? 'bg-yellow-400/10 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`
              }
              onClick={onClose}
              title={item.text}
            >
              <item.icon className={`h-6 w-6 flex-shrink-0 ${'text-yellow-400'}`} />
              <span className="font-medium lg:hidden xl:block truncate">{item.text}</span>
            </NavLink>
          ))}
          {isLoggedIn && userItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex w-full items-center gap-4 rounded-lg p-3 transition-colors group xl:justify-start lg:justify-center ${
                  isActive ? 'bg-yellow-400/10 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`
              }
              onClick={onClose}
              title={item.text}
            >
              <item.icon className={`h-6 w-6 flex-shrink-0 ${'text-yellow-400'}`} />
              <span className="font-medium lg:hidden xl:block truncate">{item.text}</span>
            </NavLink>
          ))}
          <div className="my-4 border-t border-gray-800"></div>
          <button
            onClick={() => {
              onAIClick();
              onClose();
            }}
            className="flex w-full items-center gap-4 rounded-lg p-3 text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-white group xl:justify-start lg:justify-center"
            title="AI Assistant"
          >
            <Sparkles className="h-6 w-6 flex-shrink-0 text-purple-400" />
            <span className="font-medium lg:hidden xl:block">AI Assistant</span>
          </button>
          {otherItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex w-full items-center gap-4 rounded-lg p-3 transition-colors group xl:justify-start lg:justify-center ${
                  isActive ? 'bg-yellow-400/10 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`
              }
              onClick={onClose}
              title={item.text}
            >
              <item.icon className={`h-6 w-6 flex-shrink-0 ${'text-yellow-400'}`} />
              <span className="font-medium lg:hidden xl:block truncate">{item.text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-800 p-2">
          {isLoggedIn && (
            <button
              onClick={() => {
                onToggleAccountType();
                onClose();
              }}
              className={`flex w-full items-center gap-4 rounded-lg p-3 transition-colors group xl:justify-start lg:justify-center ${
                currentAccountType === 'kids' ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
              title={currentAccountType === 'kids' ? t('exit_kids_mode') : t('enter_kids_mode')}
            >
              {currentAccountType === 'kids' ? (
                <Smile className="h-6 w-6 flex-shrink-0 text-green-400" />
              ) : (
                <User className="h-6 w-6 flex-shrink-0 text-yellow-400" />
              )}
              <span className="font-medium lg:hidden xl:block">
                {currentAccountType === 'kids' ? t('kids_mode') : t('adult_mode')}
              </span>
            </button>
          )}
          <button
            onClick={() => {
              onSettingsClick();
              onClose();
            }}
            className="flex w-full items-center gap-4 rounded-lg p-3 text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-white group xl:justify-start lg:justify-center"
            title={t('settings')}
          >
            <Settings className="h-6 w-6 flex-shrink-0" />
            <span className="font-medium lg:hidden xl:block">{t('settings')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNavigation;