import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Globe, Film } from 'lucide-react';
import { tmdbApi, Movie, Person } from '../services/tmdbApi';
import { slugify } from '../utils/slugify';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';

interface ActorMoviesPageProps {
  actorId: number;
  onBack: () => void;
  onWatchMovie: (movie: Movie) => void;
}

const ActorMoviesPage: React.FC<ActorMoviesPageProps> = ({ actorId, onBack, onWatchMovie }) => {
  const navigate = useNavigate();
  const [actor, setActor] = useState<Person | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        setLoading(true);
        const [actorDetails, movieCredits] = await Promise.all([
          tmdbApi.getPersonDetails(actorId),
          tmdbApi.getPersonMovieCredits(actorId)
        ]);
        
        setActor(actorDetails);
        const sortedMovies = movieCredits.cast
          .filter(movie => movie.poster_path)
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 50);
        
        setMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching actor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActorData();
  }, [actorId, language]);

  const handleMovieCardClick = (movie: Movie) => {
    const titleSlug = slugify(movie.title || movie.name || 'untitled');
    navigate(`/movie/${movie.id}/${titleSlug}`);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div></div>;
  }

  if (!actor) {
    return <div>Actor not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg mr-4">
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <h1 className="text-xl font-bold text-white">{actor.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Actor Info Card */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex-shrink-0 w-48 h-72 md:w-64 md:h-96 rounded-xl overflow-hidden">
              {actor.profile_path ? (
                <img src={tmdbApi.getImageUrl(actor.profile_path, 'w500') || ''} alt={actor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 glow-text">{actor.name}</h1>
              <div className="space-y-2 text-sm text-gray-300 mb-6">
                {actor.birthday && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span>{t('born')}: {new Date(actor.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {actor.place_of_birth && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Globe className="w-4 h-4 text-yellow-400" />
                    <span>{t('from')}: {actor.place_of_birth}</span>
                  </div>
                )}
                {actor.known_for_department && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Film className="w-4 h-4 text-yellow-400" />
                    <span>{t('known_for')}: {actor.known_for_department}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">{t('biography')}</h2>
                <p className="text-gray-400 leading-relaxed max-h-48 overflow-y-auto pr-2">
                  {actor.biography || 'No biography available.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">{t('movies_featuring')} <span className="text-yellow-400 glow-text">{actor.name}</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {movies.map((movie) => (
              <div 
                key={movie.id}
                className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 movie-card cursor-pointer"
                onClick={() => handleMovieCardClick(movie)}
              >
                <div className="aspect-[2/3] relative">
                  <img src={tmdbApi.getImageUrl(movie.poster_path) || ''} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 sm:p-3">
                  <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">{movie.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWatchMovie(movie);
                    }}
                    className="w-full px-3 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 text-xs"
                  >
                    {t('play')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorMoviesPage;