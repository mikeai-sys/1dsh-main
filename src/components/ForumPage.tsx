import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Users, MessageCircle, Trash2, Edit3, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

interface ForumPageProps {
  onBack: () => void;
}

interface ForumMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    is_admin: boolean;
    avatar_url?: string;
  };
}

const ForumPage: React.FC<ForumPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user: supabaseUser, profile } = useAuth(); // Use the useAuth hook
  const isLoggedIn = !!supabaseUser; // Check if user is logged in
  const currentUserId = supabaseUser?.id;
  const currentUserIsAdmin = profile?.is_admin;

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('forum_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    // Simulate online users count
    setOnlineUsers(Math.floor(Math.random() * 50) + 10);

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_messages')
        .select(`
          *,
          user:profiles(name, is_admin, avatar_url)
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isLoggedIn || sending || !currentUserId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('forum_messages')
        .insert({
          user_id: currentUserId,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string, messageUserId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    if (!currentUserId || (messageUserId !== currentUserId && !currentUserIsAdmin)) {
      alert('You do not have permission to delete this message.');
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const startEdit = (message: ForumMessage) => {
    if (message.user_id !== currentUserId) {
      alert('You can only edit your own messages.');
      return;
    }
    setEditingId(message.id);
    setEditText(message.message);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editingId || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('forum_messages')
        .update({
          message: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId)
        .eq('user_id', currentUserId); // Ensure only owner can update

      if (error) throw error;
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to access the forum</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 mr-4"
            >
              <ArrowLeft className="w-6 h-6 text-yellow-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Community Forum</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{onlineUsers} online</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{messages.length} messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-hidden flex flex-col">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Welcome to the Community!</h2>
          <p className="text-gray-300">
            Connect with fellow DeltaSilicon.Hub users, share recommendations, discuss movies and series, 
            and stay updated with the latest platform news. Be respectful and enjoy the conversation!
          </p>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
              <p className="text-gray-400">Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 p-4 rounded-xl transition-all duration-300 group ${ // Added group class
                  message.user_id === currentUserId
                    ? 'bg-yellow-400/10 border border-yellow-400/20 ml-8'
                    : 'bg-gray-900/50 border border-gray-800 mr-8'
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    message.user.is_admin
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black glow-circle'
                      : message.user_id === currentUserId
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {message.user.avatar_url ? (
                      <img
                        src={message.user.avatar_url}
                        alt={message.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      message.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${
                      message.user.is_admin ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {message.user.name}
                    </span>
                    {message.user.is_admin && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/30 rounded-full">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full glow-circle"></div>
                        <span className="text-xs text-yellow-400 font-semibold">ADMIN</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(message.created_at)}
                      {message.updated_at !== message.created_at && ' (edited)'}
                    </span>
                  </div>

                  {/* Message Text */}
                  {editingId === message.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400/50 focus:outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-300"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-300"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-gray-300 leading-relaxed break-words">
                        {message.message}
                      </p>
                      
                      {/* Message Actions */}
                      {(message.user_id === currentUserId || currentUserIsAdmin) && ( // Allow admin to delete
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {message.user_id === currentUserId && (
                            <button
                              onClick={() => startEdit(message)}
                              className="p-1 text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(message.id, message.user_id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
              disabled={sending || !isLoggedIn}
              maxLength={500}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {newMessage.length}/500
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !isLoggedIn}
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 glow-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForumPage;