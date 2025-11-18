import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Clock, Globe, Heart, Share2, Users, User } from 'lucide-react';
import { tmdbApi, CastMember, CrewMember } from '../services/tmdbApi';
import { SeriesService } from '../services/seriesService'; // Corrected this line
import { UserService } from '../services/userService';
import { DatabaseService } from '../services/databaseService';
import RatingCircle from '../components/RatingCircle';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface ContentInfoPageProps {
  contentType: 'movie' | 'series';
}

const ContentInfoPage: React.FC<ContentInfoPageProps> = ({ contentType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { user: supabaseUser } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const numericId = parseInt(id);
        
        let detailsData, creditsData;
        if (contentType === 'series') {
          detailsData = await SeriesService.getSeriesDetails(numericId);
          creditsData = await tmdbApi.getSeriesCredits(numericId);
        } else {
          [detailsData, creditsData] = await Promise.all([
            tmdbApi.getMovieDetails(numericId),
            tmdbApi.getMovieCredits(numericId)
          ]);
        }
        
        setDetails(detailsData);
        setCast(creditsData.cast.slice(0, 20));
        setCrew(creditsData.crew);

        if (supabaseUser) {
          const fav = await DatabaseService.isFavorite(supabaseUser.id, numericId);
          setIsFavorite(fav);
        } else {
          setIsFavorite(UserService.isFavorite(numericId));
        }

      } catch (error) {
        console.error('Error fetching content details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, contentType, language, supabaseUser]);

  const handleWatch = () => {
    if (!id) return;
    if (contentType === 'series') {
      navigate(`/series/watch/${id}/1/1`);
    } else {
      navigate(`/movie/watch/${id}`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = details?.title || details?.name || 'Check this out!';
    const text = `Watch ${title} on DeltaSilicon.Hub!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareFeedback('Link copied!');
        setTimeout(() => setShareFeedback(''), 2000);
      } catch (error) {
        setShareFeedback('Failed to copy.');
        setTimeout(() => setShareFeedback(''), 2000);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!details) return;
    const numericId = details.id;

    if (supabaseUser) {
      if (isFavorite) {
        await DatabaseService.removeFromFavorites(supabaseUser.id, numericId);
      } else {
        await DatabaseService.addToFavorites(supabaseUser.id, numericId, details.title || details.name, details.poster_path, contentType, details.vote_average, details.release_date || details.first_air_date);
      }
      setIsFavorite(!isFavorite);
    } else {
      // Fallback to guest user with localStorage
      if (isFavorite) {
        UserService.removeFromFavorites(numericId);
      } else {
        UserService.addToFavorites(details, contentType as 'movie' | 'series' | 'anime');
      }
      setIsFavorite(!isFavorite);
    }
  };

  const handleActorClick = (actorId: number) => {
    navigate(`/actor/${actorId}`);
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDirector = () => crew.find(member => member.job === 'Director')?.name;
  const getWriters = () => crew.filter(member => member.department === 'Writing').map(m => m.name).slice(0, 2).join(', ');

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-4">Content not found</h2>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const director = getDirector();
  const writers = getWriters();

  return (
    <div className="min-h-screen bg-black text-white">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors">
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <div className="relative h-[60vh] min-h-[400px] md:h-[80vh] md:min-h-[600px]">
        {details.backdrop_path && (
          <img src={tmdbApi.getBackdropUrl(details.backdrop_path) || ''} alt={title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-shrink-0 w-36 h-52 sm:w-48 sm:h-72 md:w-56 md:h-80 rounded-xl overflow-hidden border-2 border-gray-700 self-center md:self-end">
              <img src={tmdbApi.getImageUrl(details.poster_path) || ''} alt={title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-end text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 text-white glow-text">{title}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-4 mb-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <RatingCircle percentage={details.vote_average * 10} />
                  <div className="text-left">
                    <div className="font-bold text-white">{t('user_score')}</div>
                    <div className="text-xs text-gray-400">{t('vote_count', { count: details.vote_count.toString() })}</div>
                  </div>
                </div>
                {releaseDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(releaseDate).getFullYear()}</span>
                  </div>
                )}
                {details.runtime ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(details.runtime)}</span>
                  </div>
                ) : (details.number_of_seasons && <span>{details.number_of_seasons} Seasons</span>)}
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase">{details.original_language}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {details.genres?.map((genre: any) => <span key={genre.id} className="px-3 py-1 bg-gray-800/80 border border-gray-600 rounded-full text-xs sm:text-sm">{genre.name}</span>)}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                <button onClick={handleWatch} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button">
                  <Play className="w-5 h-5" /> {t('play')}
                </button>
                <div className="flex gap-3">
                  <button onClick={toggleFavorite} className={`p-3 rounded-lg transition-colors ${isFavorite ? 'bg-red-600/20 text-red-400' : 'bg-gray-700/50 text-gray-300 hover:text-red-400'}`}>
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="p-3 bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  {shareFeedback && <span className="text-xs text-yellow-400 self-center">{shareFeedback}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <p className="text-gray-300 leading-relaxed mb-8">{details.overview}</p>
            
            <div className="space-y-4 text-sm border-t border-gray-800 pt-6">
              {director && <div className="flex"><strong className="w-24 text-gray-400">{t('director')}</strong><span className="text-white">{director}</span></div>}
              {writers && <div className="flex"><strong className="w-24 text-gray-400">{t('writers')}</strong><span className="flex-1 text-white">{writers}</span></div>}
              {contentType === 'series' && details.number_of_episodes && <div className="flex"><strong className="w-24 text-gray-400">{t('episodes')}</strong><span className="text-white">{details.number_of_episodes}</span></div>}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-yellow-400"/> {t('cast')}</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {cast.map((actor) => (
                <div key={actor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-900/50 cursor-pointer" onClick={() => handleActorClick(actor.id)}>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {actor.profile_path ? <img src={tmdbApi.getImageUrl(actor.profile_path, 'w200') || ''} alt={actor.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-gray-600" /></div>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{actor.name}</h3>
                    <p className="text-xs text-gray-400">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentInfoPage;