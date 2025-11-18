import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UserService } from '../services/userService';
import { locationService } from '../services/locationService';
import SettingsModal from '../components/SettingsModal';
import LoginModal from '../components/LoginModal';
import AuthModal from '../components/AuthModal';
import SideNavigation from '../components/SideNavigation';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import LocationBanner from '../components/LocationBanner';
import { useAuth } from '../contexts/AuthContext';
import AIRecommenderModal from '../components/AIRecommenderModal';
import { supabase } from '../lib/supabase'; // Import supabase for profile updates
import { useTranslation } from '../contexts/LanguageContext'; // Import useTranslation

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // For guest login
  const [showAuthModal, setShowAuthModal] = useState(false); // For Supabase login
  const [showAIModal, setShowAIModal] = useState(false);
  const [guestUser, setGuestUser] = useState(UserService.getCurrentUser());
  const location = useLocation();
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [bgOpacity, setBgOpacity] = useState(1);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [locationPref, setLocationPref] = useState(locationService.getLocationPreference());
  const { t } = useTranslation(); // Use translation hook

  const { user: supabaseUser, profile, signOut, refetchProfile } = useAuth();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleGuestLogin = (user: any) => {
    setGuestUser(user);
  };

  const handleLogout = () => {
    if (supabaseUser) {
      signOut(); // Use signOut from AuthContext
    } else {
      UserService.logout();
      setGuestUser(null);
    }
  };

  const handleScroll = () => {
    if (mainContentRef.current) {
      const scrollPos = mainContentRef.current.scrollTop;
      const fadeEnd = window.innerHeight * 0.5;
      setBgOpacity(Math.max(0, 1 - scrollPos / fadeEnd));
    }
  };

  const handlePrefSet = () => {
    setLocationPref(locationService.getLocationPreference());
  };

  const toggleAccountType = async () => {
    if (!supabaseUser) {
      alert(t('login_for_account_type')); // Inform guest users
      return;
    }
    const newAccountType = profile?.account_type === 'kids' ? 'adult' : 'kids';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: newAccountType })
        .eq('id', supabaseUser.id);

      if (error) throw error;
      await refetchProfile();
      alert(t('account_type_updated', { type: newAccountType }));
    } catch (error) {
      console.error('Error toggling account type:', error);
      alert(t('failed_to_update_account_type'));
    }
  };

  useEffect(() => {
    const mainEl = mainContentRef.current;
    mainEl?.addEventListener('scroll', handleScroll);
    return () => mainEl?.removeEventListener('scroll', handleScroll);
  }, []);

  const effectiveUser = supabaseUser ? { name: profile?.name || supabaseUser.email } : guestUser;
  const isLoggedIn = !!supabaseUser; // Determine if a Supabase user is logged in

  return (
    <div className="flex h-screen w-full bg-black text-white">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-500"
        style={{ backgroundImage: `url(${backgroundUrl})`, opacity: bgOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <SideNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSettingsClick={() => setShowSettings(true)}
        onAIClick={() => setShowAIModal(true)}
        locationPref={locationPref}
        currentAccountType={profile?.account_type || 'adult'}
        onToggleAccountType={toggleAccountType}
        isLoggedIn={isLoggedIn}
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentUser={effectiveUser}
          onLoginClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          currentAccountType={profile?.account_type || 'adult'}
          onToggleAccountType={toggleAccountType}
          isLoggedIn={isLoggedIn}
        />
        <main ref={mainContentRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-16 lg:pb-0">
          <Outlet context={{ setBackgroundUrl, openAIModal: () => setShowAIModal(true) }} />
        </main>
      </div>
      <BottomNavigation onSettingsClick={() => setShowSettings(true)} />

      <LocationBanner onPreferenceSet={handlePrefSet} />

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleGuestLogin} />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onGuest={() => {
          setShowAuthModal(false);
          setShowLogin(true);
        }}
      />
      
      <AIRecommenderModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Dashboard;