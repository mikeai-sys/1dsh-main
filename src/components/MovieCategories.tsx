import { useState, useEffect } from 'react';
import { Star, TrendingUp, Award, Clock, Siren as Fire } from 'lucide-react';
import { tmdbApi, Movie } from '../services/tmdbApi';

interface MovieCategoriesProps {
  onWatchMovie: () => void;
}

const MovieCategories: React.FC<MovieCategoriesProps> = ({ onWatchMovie }) => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'trending', name: 'Trending', icon: TrendingUp, color: 'text-red-400' },
    { id: 'popular', name: 'Popular', icon: Fire, color: 'text-orange-400' },
    { id: 'top_rated', name: 'Top Rated', icon: Award, color: 'text-yellow-400' },
    { id: 'now_playing', name: 'Now Playing', icon: Clock, color: 'text-green-400' }
  ];

  const fetchMoviesByCategory = async (category: string) => {
    setLoading(true);
    try {
      let response;
      switch (category) {
        case 'trending':
          response = await tmdbApi.getTrending();
          break;
        case 'popular':
          response = await tmdbApi.getPopular();
          break;
        case 'top_rated':
          response = await tmdbApi.getTopRated();
          break;
        case 'now_playing':
          response = await tmdbApi.getNowPlaying();
          break;
        default:
          response = await tmdbApi.getTrending();
      }
      setMovies(response.results.slice(0, 14)); // Show 14 movies for a clean grid
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesByCategory(activeCategory);
  }, [activeCategory]);

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Movie</span>{' '}
            <span className="text-yellow-400 glow-text">Categories</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300">
            Explore movies by different categories
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeCategory === category.id
                    ? 'bg-yellow-400 text-black glow-button'
                    : 'bg-gray-900/50 border border-gray-700 text-white hover:border-yellow-400/50 hover:bg-gray-900/70'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${activeCategory === category.id ? 'text-black' : category.color}`} />
                {category.name}
              </button>
            );
          })}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {movies.map((movie, index) => (
              <div 
                key={movie.id}
                className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 movie-card"
                style={{ animationDelay: `${index * 0.05}s` }}
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
        )}

        <div className="text-center mt-12">
          <button 
            onClick={onWatchMovie}
            className="px-8 py-3 border border-yellow-400/50 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400/10 transition-all duration-300 glow-border-hover"
          >
            View More {categories.find(cat => cat.id === activeCategory)?.name} Movies
          </button>
        </div>
      </div>
    </section>
  );
};

export default MovieCategories;