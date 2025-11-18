import { Star, Trash2, Play } from 'lucide-react';
import { tmdbApi } from '../services/tmdbApi';

export interface ContentItem {
  id: number;
  title?: string; // Made optional as it might be 'name' for series
  name?: string; // Added for series
  poster_path: string | null; // Allow null for poster_path
  vote_average?: number;
  type?: 'movie' | 'series' | 'anime'; // Added type property for better compatibility
  content_type?: string; // Also added content_type for database service items
}

interface ContentGridProps {
  items: ContentItem[];
  onItemClick: (item: ContentItem) => void;
  onDeleteItem?: (itemId: number) => void;
  contentType: 'movie' | 'series' | 'anime';
  showDelete?: boolean;
}

const ContentGrid: React.FC<ContentGridProps> = ({ items, onItemClick, onDeleteItem, showDelete = false }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="group cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-yellow-400/20">
            <img
              src={tmdbApi.getImageUrl(item.poster_path) || ''}
              alt={item.title || item.name || 'No Title'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {item.vote_average && item.vote_average > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span>{item.vote_average.toFixed(1)}</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Play className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold text-white transition-colors duration-300 group-hover:text-yellow-400">
            {item.title || item.name}
          </h3>
          {showDelete && onDeleteItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-600/40"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContentGrid;