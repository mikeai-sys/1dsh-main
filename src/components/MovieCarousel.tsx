import { useState, useEffect } from 'react';
import { Star, Play, Calendar, TrendingUp } from 'lucide-react';
import { tmdbApi, Movie } from '../services/tmdbApi';

interface MovieCarouselProps {
  onWatchMovie: () => void;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ onWatchMovie }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await tmdbApi.getTrending();
        setMovies(response.results.slice(0, 14)); // Show 14 for a clean grid
      } catch (err) {
        setError('Failed to load movies');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Trending</span>{' '}
              <span className="text-yellow-400 glow-text">Movies</span>
            </h2>
          </div>
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
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-white">Trending</span>{' '}
              <span className="text-yellow-400 glow-text">Movies</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-300">
            Discover what's hot right now
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
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
                    <Play className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={onWatchMovie}
                    className="p-3 bg-yellow-400/90 text-black rounded-full hover:bg-yellow-400 transition-colors duration-300 glow-button"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                </div>

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
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={onWatchMovie}
            className="px-8 py-3 border border-yellow-400/50 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400/10 transition-all duration-300 glow-border-hover"
          >
            View All Movies
          </button>
        </div>
      </div>
    </section>
  );
};

export default MovieCarousel;