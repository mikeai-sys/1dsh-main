import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService, FavoriteMovie } from '../services/userService';
import { DatabaseService, FavoriteItem } from '../services/databaseService';
import { slugify } from '../utils/slugify';
import ContentGrid, { ContentItem } from '../components/ContentGrid'; // Import ContentItem
import { Heart } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<(FavoriteMovie | FavoriteItem)[]>([]);
  const { t } = useTranslation();
  const { user: supabaseUser } = useAuth();

  const fetchFavorites = async () => {
    if (supabaseUser) {
      const dbFavorites = await DatabaseService.getFavorites(supabaseUser.id);
      setFavorites(dbFavorites);
    } else {
      setFavorites(UserService.getFavorites());
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [supabaseUser]);

  const handleItemClick = (item: ContentItem) => {
    const id = item.id;
    // Use the 'type' or 'content_type' property from the item itself
    const type = item.type || item.content_type || 'movie'; 
    const titleSlug = slugify(item.title || item.name || 'untitled');
    navigate(`/${type}/${id}/${titleSlug}`);
  };

  const handleRemoveItem = async (itemId: number) => {
    if (supabaseUser) {
      await DatabaseService.removeFromFavorites(supabaseUser.id, itemId);
    } else {
      UserService.removeFromFavorites(itemId);
    }
    fetchFavorites();
  };

  const mappedFavorites: ContentItem[] = favorites.map(f => ({
    id: (f as FavoriteItem).movie_id || (f as FavoriteMovie).movieId,
    name: f.title,
    title: f.title,
    poster_path: f.poster_path,
    vote_average: f.vote_average,
    type: (f as FavoriteMovie).type || (f as FavoriteItem).content_type as 'movie' | 'series' | 'anime', // Explicitly map type
  }));

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{t('favorites')}</h1>
      {favorites.length === 0 ? (
        <div className="py-20 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h2 className="text-xl font-semibold text-white">{t('no_favorites_yet')}</h2>
          <p className="text-gray-400">{t('favorites_description')}</p>
        </div>
      ) : (
        <ContentGrid
          items={mappedFavorites}
          onItemClick={handleItemClick}
          onDeleteItem={handleRemoveItem}
          contentType="movie" // This contentType is for the grid's internal logic, not the item's type
          showDelete
        />
      )}
    </div>
  );
};

export default FavoritesPage;