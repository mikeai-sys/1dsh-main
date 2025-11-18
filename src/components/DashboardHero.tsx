import React from 'react';
import { Play, Star, Info } from 'lucide-react';
import { Movie } from '../services/tmdbApi';
import { useTranslation } from '../contexts/LanguageContext';

interface DashboardHeroProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ movie, onPlay, onMoreInfo }) => {
  const { t } = useTranslation();
  if (!movie) return null;

  return (
    <div className="relative h-screen w-full flex items-end">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      
      {/* Content */}
      <div className="relative p-4 sm:p-8 md:p-12 text-white max-w-2xl">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 glow-text">
          {movie.title || movie.name}
        </h1>
        
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
          </div>
          <span>{new Date(movie.release_date || movie.first_air_date || '').getFullYear()}</span>
        </div>

        <p className="hidden sm:block text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
          {movie.overview}
        </p>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button"
          >
            <Play className="w-5 h-5" />
            <span>{t('play')}</span>
          </button>
          <button
            onClick={() => onMoreInfo(movie)}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gray-700/50 text-white font-semibold rounded-lg hover:bg-gray-700/80 transition-all duration-300 backdrop-blur-sm"
          >
            <Info className="w-5 h-5" />
            <span>{t('more_info')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;