export interface LocationData {
  country_name: string;
  country_code: string;
}

const LOCATION_PREF_KEY = 'deltasilicon_location_pref';
const DEV_LOCATION_OVERRIDE_KEY = 'DEV_LOCATION_OVERRIDE'; // New key for dev override

export const locationService = {
  async getUserLocation(): Promise<LocationData | null> {
    // Check for local development override
    if (import.meta.env.DEV) { // Check if in development mode (Vite specific)
      const devOverride = localStorage.getItem(DEV_LOCATION_OVERRIDE_KEY);
      if (devOverride) {
        try {
          const parsedOverride = JSON.parse(devOverride);
          if (parsedOverride.country_name && parsedOverride.country_code) {
            console.log('Using DEV_LOCATION_OVERRIDE:', parsedOverride);
            return parsedOverride;
          }
        } catch (e) {
          console.error('Invalid DEV_LOCATION_OVERRIDE in localStorage:', e);
          // Fall through to ipapi.co if override is invalid
        }
      }
    }

    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        console.warn('Failed to fetch location from ipapi.co:', response.statusText);
        return null; // Return null on non-OK response
      }
      const data = await response.json();
      return {
        country_name: data.country_name,
        country_code: data.country_code,
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      // Specifically log a message about CORS for local development
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('CORS issue detected with ipapi.co. This often happens during local development. Location-based features might be limited. Consider deploying or using a proxy.');
      }
      return null; // Return null on any fetch error
    }
  },

  getLanguageForCountry(countryCode: string): string {
    const lowerCode = countryCode.toLowerCase();
    const countryLangMap: { [key: string]: string } = {
      // North America
      us: 'en', ca: 'en',
      // Europe
      gb: 'en', ie: 'en',
      de: 'de', at: 'de', ch: 'de',
      fr: 'fr', be: 'fr', lu: 'fr', mc: 'fr',
      es: 'es', ad: 'es',
      it: 'it',
      nl: 'nl',
      se: 'sv',
      // North Africa
      dz: 'kab', eg: 'ar', ma: 'ar', tn: 'ar', ly: 'ar', mr: 'ar', sd: 'ar',
      // Asia
      cn: 'zh', tw: 'zh', hk: 'zh', sg: 'zh',
      // Oceania
      au: 'en', nz: 'en'
    };
    return countryLangMap[lowerCode] || 'en'; // Default to English
  },

  getLocationPreference(): { accepted: boolean; countryCode: string; countryName: string } | null {
    const pref = localStorage.getItem(LOCATION_PREF_KEY);
    return pref ? JSON.parse(pref) : null;
  },

  setLocationPreference(accepted: boolean, countryCode: string, countryName: string) {
    localStorage.setItem(LOCATION_PREF_KEY, JSON.stringify({ accepted, countryCode, countryName }));
  },
};