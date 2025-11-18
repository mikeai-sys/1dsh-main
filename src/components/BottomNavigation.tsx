import React from 'react';
import { NavLink } from 'react-router-dom';
import { Film, Tv, Settings, Sparkles } from 'lucide-react';

interface BottomNavigationProps {
  onSettingsClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onSettingsClick }) => {
  const navItems = [
    { to: '/dashboard', text: 'Movies', icon: Film },
    { to: '/dashboard/series', text: 'Series', icon: Tv },
    { to: '/dashboard/anime', text: 'Anime', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors w-20 ${
                isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.text}</span>
          </NavLink>
        ))}
        <button
          onClick={onSettingsClick}
          className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-gray-400 transition-colors hover:text-white w-20"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;