import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tmdbApi } from '../services/tmdbApi';
import { SeriesService } from '../services/seriesService';
import { AnimeService } from '../services/animeService';
import ContentGrid, { ContentItem } from '../components/ContentGrid';
import { slugify } from '../utils/slugify';
import { ArrowLeft, Search } from 'lucide-react';

type SearchCategory = 'movie' | 'series' | 'anime';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<SearchCategory>('movie');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setPage(1);
    setResults([]);
  }, [query, activeTab]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    };

    const fetchResults = async () => {
      setLoading(true);
      try {
        let response;
        switch (activeTab) {
          case 'movie':
            response = await tmdbApi.searchMovies(query, page);
            break;
          case 'series':
            response = await SeriesService.searchSeries(query, page);
            break;
          case 'anime':
            response = await AnimeService.searchAnime(query, page);
            break;
        }
        setResults(prev => page === 1 ? response.results : [...prev, ...response.results]);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error(`Error searching ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, activeTab, page]);

  const handleItemClick = (item: ContentItem) => {
    const slug = slugify(item.title || item.name || '');
    const contentType = item.type || activeTab;
    navigate(`/${contentType}/${item.id}/${slug}`);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <h1 className="text-xl font-bold text-white truncate">
            Search results for: <span className="text-yellow-400">"{query}"</span>
          </h1>
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
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold text-white">No results found for "{query}" in {activeTab}.</h2>
            <p className="text-gray-400 mt-2">Try a different search term or category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;