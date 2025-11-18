import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService, WatchHistory } from '../services/userService';
import { DatabaseService, WatchHistoryItem } from '../services/databaseService';
import { slugify } from '../utils/slugify';
import ContentGrid, { ContentItem } from '../components/ContentGrid'; // Import ContentItem
import { Film } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<(WatchHistory | WatchHistoryItem)[]>([]);
  const { t } = useTranslation();
  const { user: supabaseUser } = useAuth();

  const fetchHistory = async () => {
    if (supabaseUser) {
      const dbHistory = await DatabaseService.getWatchHistory(supabaseUser.id);
      setHistory(dbHistory);
    } else {
      setHistory(UserService.getWatchHistory());
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [supabaseUser]);

  const handleItemClick = (item: ContentItem) => {
    const id = item.id;
    // Use the 'type' or 'content_type' property from the item itself
    const type = item.type || item.content_type || 'movie';
    const titleSlug = slugify(item.title || item.name || 'untitled');
    navigate(`/${type}/${id}/${titleSlug}`);
  };

  const handleRemoveItem = async (itemId: number) => {
    // Note: Supabase schema doesn't support removing single history items easily without an ID.
    // The current databaseService doesn't have a remove method.
    // For now, we only support removing for guest users.
    if (!supabaseUser) {
      UserService.removeFromHistory(itemId);
      fetchHistory();
    }
  };

  const mappedHistory: ContentItem[] = history.map(h => ({
    id: (h as WatchHistoryItem).movie_id || (h as WatchHistory).movieId,
    name: h.title,
    title: h.title,
    poster_path: h.poster_path,
    type: (h as WatchHistory).type || (h as WatchHistoryItem).content_type as 'movie' | 'series' | 'anime', // Explicitly map type
  }));

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{t('history')}</h1>
      {history.length === 0 ? (
        <div className="py-20 text-center">
          <Film className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h2 className="text-xl font-semibold text-white">{t('nothing_here_yet')}</h2>
          <p className="text-gray-400">{t('history_description')}</p>
        </div>
      ) : (
        <ContentGrid
          items={mappedHistory}
          onItemClick={handleItemClick}
          onDeleteItem={!supabaseUser ? handleRemoveItem : undefined}
          contentType="movie" // This contentType is for the grid's internal logic, not the item's type
          showDelete={!supabaseUser}
        />
      )}
    </div>
  );
};

export default HistoryPage;