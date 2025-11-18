import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tmdbApi, Genre } from '../services/tmdbApi';
import { SeriesService } from '../services/seriesService';
import { AnimeService } from '../services/animeService';
import ContentGrid, { ContentItem } from '../components/ContentGrid';
import { slugify } from '../utils/slugify';
import { ArrowLeft, Search, Film, Tv, Sparkles } from 'lucide-react';
import AIRecommenderModal from '../components/AIRecommenderModal';

type SearchCategory = 'movie' | 'series' | 'anime';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchCategory>('movie');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<ContentItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const [movieRes, seriesRes] = await Promise.all([
        tmdbApi.searchMovies(searchQuery, 1),
        SeriesService.searchSeries(searchQuery, 1)
      ]);
      const combined = [
        ...movieRes.results.map(r => ({ ...r, type: 'movie' as const })),
        ...seriesRes.results.map(r => ({ ...r, type: 'series' as const }))
      ];
      setSuggestions(combined.slice(0, 8));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    debouncedFetchSuggestions(inputValue);
  }, [inputValue, debouncedFetchSuggestions]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        let genresResponse;
        if (activeTab === 'series') {
          genresResponse = await tmdbApi.getTvGenres();
        } else if (activeTab === 'anime') {
          setGenres(AnimeService.getAnimeGenres());
          return;
        } else {
          genresResponse = await tmdbApi.getGenres();
        }
        setGenres(genresResponse.genres);
      } catch (error) {
        console.error(`Error fetching ${activeTab} genres:`, error);
      }
    };
    fetchGenres();
    setPage(1);
    setResults([]);
    setSelectedGenre(null);
  }, [activeTab]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let response;
        if (query) {
          switch (activeTab) {
            case 'movie': response = await tmdbApi.searchMovies(query, page); break;
            case 'series': response = await SeriesService.searchSeries(query, page); break;
            case 'anime': response = await AnimeService.searchAnime(query, page); break;
          }
        } else if (selectedGenre) {
          switch (activeTab) {
            case 'movie': response = await tmdbApi.getMoviesByGenre(selectedGenre, page); break;
            case 'series': response = await SeriesService.getSeriesByGenre(selectedGenre, page); break;
            case 'anime': response = await AnimeService.getAnimeByGenre(selectedGenre, page); break;
          }
        } else {
          switch (activeTab) {
            case 'movie': response = await tmdbApi.getPopular(page); break;
            case 'series': response = await SeriesService.getPopularSeries(page); break;
            case 'anime': response = await AnimeService.getPopularAnime(); break;
          }
        }
        setResults(prev => page === 1 ? response.results : [...prev, ...response.results]);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error(`Error fetching data for ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, activeTab, page, selectedGenre]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    setSelectedGenre(null);
    setPage(1);
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleItemClick = (item: ContentItem) => {
    const slug = slugify(item.title || item.name || '');
    const contentType = item.type || activeTab;
    navigate(`/${contentType}/${item.id}/${slug}`);
  };

  const handleGenreSelect = (genreId: number) => {
    setSearchParams({});
    setInputValue('');
    setPage(1);
    setSelectedGenre(genreId);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const tabs: { id: SearchCategory; name: string }[] = [
    { id: 'movie', name: 'Movies' },
    { id: 'series', name: 'Series' },
    { id: 'anime', name: 'Anime' },
  ];

  const getSuggestionIcon = (type: 'movie' | 'series') => {
    if (type === 'movie') return <Film className="w-4 h-4 text-gray-400" />;
    return <Tv className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4" ref={searchRef}>
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for movies, series, or anime..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/50 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none"
              autoFocus
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {suggestions.map(item => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-700"
                  >
                    {getSuggestionIcon(item.type as 'movie' | 'series')}
                    <span className="flex-1 truncate">{item.title || item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 border-b border-gray-700">
          <div className="flex space-x-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-semibold transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-yellow-400 text-yellow-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {!query && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Filter by Genre</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-300 ${
                    selectedGenre === genre.id
                      ? 'bg-yellow-400 text-black font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && page === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-4">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <ContentGrid items={results} onItemClick={handleItemClick} contentType={activeTab} />
            {page < totalPages && (
              <div className="mt-8 text-center">
                <button onClick={handleLoadMore} disabled={loading} className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold text-white">No results found.</h2>
              <p className="text-gray-400 mt-2 mb-6">Try a different search term, or let our AI assistant help you find something to watch!</p>
              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                Ask AI Assistant
              </button>
            </div>
          )
        )}
      </div>
      <AIRecommenderModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </div>
  );
};

export default SearchPage;