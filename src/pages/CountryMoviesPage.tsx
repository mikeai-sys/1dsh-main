import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbApi, Movie } from '../services/tmdbApi';
import { locationService } from '../services/locationService';
import { useTranslation } from '../contexts/LanguageContext';
import { slugify } from '../utils/slugify';
import ContentGrid, { ContentItem } from '../components/ContentGrid'; // Import ContentItem
import { SkeletonDashboard } from '../components/SkeletonLoader';
import { MapPin } from 'lucide-react';

const CountryMoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [countryName, setCountryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [locationAllowed, setLocationAllowed] = useState(false);

  useEffect(() => {
    const fetchCountryMovies = async () => {
      setLoading(true);
      const pref = locationService.getLocationPreference();
      if (pref?.accepted && pref.countryCode) {
        setLocationAllowed(true);
        setCountryName(pref.countryName);
        try {
          const response = await tmdbApi.discoverMovies({ with_origin_country: pref.countryCode });
          setMovies(response.results);
        } catch (error) {
          console.error('Failed to fetch country movies:', error);
        }
      } else {
        setLocationAllowed(false);
      }
      setLoading(false);
    };
    fetchCountryMovies();
  }, []);

  const handleItemClick = (item: ContentItem) => {
    navigate(`/movie/${item.id}/${slugify(item.title || item.name || '')}`);
  };

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
        {locationAllowed ? t('popular_in_country', { countryName }) : t('country_movies')}
      </h1>
      {!locationAllowed ? (
        <div className="py-20 text-center">
          <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h2 className="text-xl font-semibold text-white">{t('enable_location_prompt')}</h2>
          <p className="text-gray-400">{t('enable_in_settings')}</p>
        </div>
      ) : (
        <ContentGrid items={movies} onItemClick={handleItemClick} contentType="movie" />
      )}
    </div>
  );
};

export default CountryMoviesPage;