import { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ContentGrid, { ContentItem } from '../components/ContentGrid'; // Corrected import path
import { Movie } from '../services/tmdbApi';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../utils/slugify';

interface AIRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIRecommenderModal: React.FC<AIRecommenderModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-recommender', {
        body: { query },
      });

      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);
      
      setRecommendations(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: ContentItem) => {
    onClose();
    // Assuming 'item' will have 'title' or 'name' for slugify
    navigate(`/movie/${item.id}/${slugify(item.title || item.name || '')}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg"><X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" /></button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {recommendations.length === 0 && !loading && !error && (
            <div className="text-center text-gray-400 h-full flex flex-col justify-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>Ask for any movie or series recommendation!</p>
              <p className="text-sm">e.g., "A space opera with complex politics" or "A lighthearted comedy from the 90s"</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
            </div>
          )}
          {error && <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>}
          {recommendations.length > 0 && (
            <ContentGrid items={recommendations} onItemClick={handleItemClick} contentType="movie" />
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask for a recommendation..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none"
              disabled={loading}
            />
            <button onClick={handleSendQuery} disabled={loading || !query.trim()} className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommenderModal;