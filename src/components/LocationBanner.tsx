import React, { useState, useEffect } from 'react';
import { MapPin, Check, X } from 'lucide-react';
import { locationService, LocationData } from '../services/locationService';
import { useTranslation } from '../contexts/LanguageContext';

interface LocationBannerProps {
  onPreferenceSet: () => void;
}

const LocationBanner: React.FC<LocationBannerProps> = ({ onPreferenceSet }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkLocation = async () => {
      const preference = locationService.getLocationPreference();
      if (preference === null) {
        const userLocation = await locationService.getUserLocation();
        if (userLocation) {
          setLocation(userLocation);
          setVisible(true);
        }
      }
    };
    checkLocation();
  }, []);

  const handleAccept = () => {
    if (location) {
      locationService.setLocationPreference(true, location.country_code, location.country_name);
      setVisible(false);
      onPreferenceSet();
    }
  };

  const handleRefuse = () => {
    if (location) {
      locationService.setLocationPreference(false, location.country_code, location.country_name);
      setVisible(false);
      onPreferenceSet();
    }
  };

  if (!visible || !location) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-40 w-11/12 max-w-lg -translate-x-1/2 transform rounded-lg border border-gray-700 bg-gray-900/80 p-4 shadow-lg backdrop-blur-sm lg:bottom-4">
      <div className="flex items-start gap-4">
        <div className="mt-1 flex-shrink-0">
          <MapPin className="h-6 w-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{t('location_banner_title', { countryName: location.country_name })}</h3>
          <p className="mt-1 text-sm text-gray-300">{t('location_banner_body', { countryName: location.country_name })}</p>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAccept} className="flex items-center gap-2 rounded-md bg-yellow-400 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-300">
              <Check className="h-4 w-4" /> {t('accept')}
            </button>
            <button onClick={handleRefuse} className="flex items-center gap-2 rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600">
              <X className="h-4 w-4" /> {t('refuse')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationBanner;