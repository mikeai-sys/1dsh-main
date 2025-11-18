import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { tmdbApi, Movie, Genre } from '../services/tmdbApi';
import { slugify } from '../utils/slugify';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import GenreFilter from '../components/GenreFilter';
import DashboardHero from '../components/DashboardHero';
import ContentGrid, { ContentItem } from '../components/ContentGrid'; // Import ContentItem
import { useTranslation } from '../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

interface DashboardContext {
  setBackgroundUrl: (url: string) => void;
  searchQuery: string;
  openAIModal: () => void;
}

const MoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const { setBackgroundUrl, searchQuery, openAIModal } = useOutletContext<DashboardContext>();
  const { t } = useTranslation();
  const [heroContent, setHeroContent] = useState<Movie | null>(null);
  const [contentItems, setContentItems] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [trendingRes, genresRes] = await Promise.all([
          tmdbApi.getTrending(),
          tmdbApi.getGenres()
        ]);
        const hero = trendingRes.results[0] || null;
        setHeroContent(hero);
        if (hero?.backdrop_path) {
          setBackgroundUrl(tmdbApi.getBackdropUrl(hero.backdrop_path, 'original') || '');
        } else {
          setBackgroundUrl('');
        }
        setGenres(genresRes.genres);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();

    return () => {
      setBackgroundUrl('');
    };
  }, [setBackgroundUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre]);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      try {
        let response;
        if (searchQuery) {
          response = await tmdbApi.searchMovies(searchQuery, currentPage);
        } else if (selectedGenre) {
          response = await tmdbApi.getMoviesByGenre(selectedGenre, currentPage);
        } else {
          response = await tmdbApi.getPopular(currentPage);
        }
        
        if (currentPage === 1) {
          setContentItems(response.results);
        } else {
          setContentItems(prev => [...prev, ...response.results]);
        }
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [currentPage, selectedGenre, searchQuery]);

  const handleGenreSelect = (genreId: number | null) => {
    setSelectedGenre(genreId);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePlay = (item: Movie) => navigate(`/movie/watch/${item.id}`);
  const handleMoreInfo = (item: ContentItem) => navigate(`/movie/${item.id}/${slugify(item.title || item.name || '')}`);

  if (loading && currentPage === 1) return <SkeletonDashboard />;

  return (
    <>
      {heroContent && !searchQuery && !selectedGenre && currentPage === 1 && (
        <DashboardHero movie={heroContent} onPlay={handlePlay} onMoreInfo={handleMoreInfo} />
      )}

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
                {searchQuery 
                    ? t('results_for', { query: searchQuery })
                    : selectedGenre 
                        ? `${genres.find(g => g.id === selectedGenre)?.name} ${t('movies')}` 
                        : t('popular_movies')
                }
            </h2>
            {!searchQuery && <GenreFilter genres={genres} selectedGenre={selectedGenre} onSelectGenre={handleGenreSelect} />}
        </div>
        <ContentGrid items={contentItems} onItemClick={handleMoreInfo} contentType="movie" />
        {contentItems.length === 0 && !loading && searchQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-2">{t('no_movies_found')}</h3>
            <p className="text-gray-400 mb-6">{t('no_results_ai_prompt')}</p>
            <button 
              onClick={openAIModal}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button"
            >
              <Sparkles className="w-5 h-5" /> {t('ask_ai_recommender')}
            </button>
          </div>
        )}
        {currentPage < totalPages && !loading && (
          <div className="mt-8 text-center">
            <button onClick={handleLoadMore} className="btn-primary">
              {t('load_more')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MoviesPage;