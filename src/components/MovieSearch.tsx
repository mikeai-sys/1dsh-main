import { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, Star } from 'lucide-react';
import { tmdbApi, Movie, Genre } from '../services/tmdbApi';

interface MovieSearchProps {
  onWatchMovie: () => void;
}

const MovieSearch: React.FC<MovieSearchProps> = ({ onWatchMovie }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const searchMovies = useCallback(
    debounce(async (query: string, page: number = 1) => {
      if (!query.trim()) {
        try {
          setLoading(true);
          const response = await tmdbApi.getPopular(page);
          setMovies(response.results);
          setTotalPages(response.total_pages);
        } catch (error) {
          console.error('Error fetching popular movies:', error);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await tmdbApi.searchMovies(query, page);
        setMovies(response.results);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const fetchMoviesByGenre = async (genreId: number, page: number = 1) => {
    try {
      setLoading(true);
      const response = await tmdbApi.getMoviesByGenre(genreId, page);
      setMovies(response.results);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await tmdbApi.getGenres();
        setGenres(response.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
    searchMovies('');
  }, [searchMovies]);

  useEffect(() => {
    if (selectedGenre) {
      fetchMoviesByGenre(selectedGenre, currentPage);
    } else {
      searchMovies(searchQuery, currentPage);
    }
  }, [searchQuery, selectedGenre, currentPage, searchMovies]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setSelectedGenre(null);
  };

  const handleGenreSelect = (genreId: number) => {
    setSelectedGenre(genreId);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Discover</span>{' '}
            <span className="text-yellow-400 glow-text">Movies</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-8">
            Search through thousands of movies and find your next favorite
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-yellow-400/50 transition-all duration-300"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 p-4 bg-gray-900/30 border border-gray-700 rounded-xl backdrop-blur-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearFilters}
                  className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                    !selectedGenre && !searchQuery
                      ? 'bg-yellow-400 text-black font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreSelect(genre.id)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
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
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {[...Array(14)].map((_, index) => (
              <div key={index} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 animate-pulse">
                <div className="aspect-[2/3] bg-gray-800"></div>
                <div className="p-2">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 mb-12">
              {movies.map((movie) => (
                <div 
                  key={movie.id}
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 movie-card"
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={tmdbApi.getImageUrl(movie.poster_path) || ''}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-gray-600 text-center">
                          <div className="text-2xl mb-1">🎬</div>
                          <div className="text-xs">No Image</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                    
                    <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold text-white">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                      {movie.title}
                    </h3>
                    
                    <button
                      onClick={onWatchMovie}
                      className="w-full mt-1 px-3 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button text-xs"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-400/50 transition-all duration-300"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-300">
                  Page {currentPage} of {Math.min(totalPages, 500)}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || currentPage >= 500}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-400/50 transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {movies.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No movies found</h3>
            <p className="text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieSearch;