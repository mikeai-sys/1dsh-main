import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Movie, Genre } from '../services/tmdbApi';
import { AnimeService } from '../services/animeService';
import { slugify } from '../utils/slugify';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import GenreFilter from '../components/GenreFilter';
import DashboardHero from '../components/DashboardHero';
import ContentGrid, { ContentItem } from '../components/ContentGrid';
import { tmdbApi } from '../services/tmdbApi';
import { useTranslation } from '../contexts/LanguageContext';

interface DashboardContext {
  setBackgroundUrl: (url: string) => void;
  openAIModal: () => void;
}

const AnimePage: React.FC = () => {
  const navigate = useNavigate();
  const { setBackgroundUrl } = useOutletContext<DashboardContext>();
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
        const trendingRes = await AnimeService.getPopularAnime();
        const hero = trendingRes.results[0] || null;
        setHeroContent(hero);
        if (hero?.backdrop_path) {
          setBackgroundUrl(tmdbApi.getBackdropUrl(hero.backdrop_path, 'original') || '');
        } else {
          setBackgroundUrl('');
        }
        setGenres(AnimeService.getAnimeGenres());
      } catch (error) {
        console.error("Failed to fetch initial anime data:", error);
      }
    };
    fetchInitialData();

    return () => {
      setBackgroundUrl('');
    };
  }, [setBackgroundUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      try {
        let response;
        if (selectedGenre) {
          response = await AnimeService.getAnimeByGenre(selectedGenre, currentPage);
        } else {
          response = await AnimeService.getPopularAnime();
        }
        
        if (currentPage === 1) {
          setContentItems(response.results);
        } else {
          setContentItems(prev => [...prev, ...response.results]);
        }
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to fetch anime:", error);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [currentPage, selectedGenre]);

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
      {heroContent && !selectedGenre && currentPage === 1 && (
        <DashboardHero movie={heroContent} onPlay={handlePlay} onMoreInfo={handleMoreInfo} />
      )}
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
                {selectedGenre 
                    ? `${genres.find(g => g.id === selectedGenre)?.name} ${t('anime')}` 
                    : t('popular_anime')
                }
            </h2>
            <GenreFilter genres={genres} selectedGenre={selectedGenre} onSelectGenre={handleGenreSelect} />
        </div>
        <ContentGrid items={contentItems} onItemClick={handleMoreInfo} contentType="anime" />
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

export default AnimePage;