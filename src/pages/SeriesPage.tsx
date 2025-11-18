import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { tmdbApi, Movie, Genre } from '../services/tmdbApi';
import { SeriesService } from '../services/seriesService';
import { slugify } from '../utils/slugify';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import GenreFilter from '../components/GenreFilter';
import DashboardHero from '../components/DashboardHero';
import ContentGrid, { ContentItem } from '../components/ContentGrid';
import { useTranslation } from '../contexts/LanguageContext';

interface DashboardContext {
  setBackgroundUrl: (url: string) => void;
  openAIModal: () => void;
}

const SeriesPage: React.FC = () => {
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
        const [trendingRes, genresRes] = await Promise.all([
          SeriesService.getTrendingSeries(),
          tmdbApi.getTvGenres()
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
        console.error("Failed to fetch initial series data:", error);
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
          response = await SeriesService.getSeriesByGenre(selectedGenre, currentPage);
        } else {
          response = await SeriesService.getPopularSeries(currentPage);
        }
        
        if (currentPage === 1) {
          setContentItems(response.results);
        } else {
          setContentItems(prev => [...prev, ...response.results]);
        }
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to fetch series:", error);
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

  const handlePlay = (item: Movie) => navigate(`/series/watch/${item.id}/1/1`);
  const handleMoreInfo = (item: ContentItem) => navigate(`/series/${item.id}/${slugify(item.name || '')}`);

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
                    ? `${genres.find(g => g.id === selectedGenre)?.name} ${t('series')}` 
                    : t('popular_series')
                }
            </h2>
            <GenreFilter genres={genres} selectedGenre={selectedGenre} onSelectGenre={handleGenreSelect} />
        </div>
        <ContentGrid items={contentItems} onItemClick={handleMoreInfo} contentType="series" />
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

export default SeriesPage;