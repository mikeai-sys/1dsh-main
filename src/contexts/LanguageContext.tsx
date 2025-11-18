import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { locationService } from '../services/locationService';

// Import locales
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import ar from '../locales/ar.json';
import de from '../locales/de.json';
import it from '../locales/it.json';
import nl from '../locales/nl.json';
import sv from '../locales/sv.json';
import zh from '../locales/zh.json';
import kab from '../locales/kab.json';

const translations: { [key: string]: any } = { en, fr, es, ar, de, it, nl, sv, zh, kab };

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: { [key: string]: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('deltasilicon_language') || 'en');

  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLang = localStorage.getItem('deltasilicon_language');
      if (savedLang) {
        setLanguageState(savedLang);
      } else {
        const location = await locationService.getUserLocation();
        if (location) {
          const lang = locationService.getLanguageForCountry(location.country_code);
          setLanguage(lang);
        }
      }
    };
    initializeLanguage();
  }, []);

  const setLanguage = (lang: string) => {
    localStorage.setItem('deltasilicon_language', lang);
    setLanguageState(lang);
  };

  const t = (key: string, params?: { [key: string]: string }) => {
    let translation = translations[language]?.[key] || translations['en'][key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};