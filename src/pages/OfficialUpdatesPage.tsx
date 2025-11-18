import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Play, Calendar, Eye, Trash2, Plus, Video, FileText, Image, Mic, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface CompanyUpdate {
  id: string;
  title: string;
  content: string;
  media_type: string;
  media_url: string | null;
  thumbnail_url: string | null;
  views: number;
  created_at: string;
  user: {
    name: string;
    is_admin: boolean;
  };
}

const EnhancedUpdatesPage: React.FC = () => { // Removed EnhancedUpdatesPageProps and onBack prop
  const navigate = useNavigate(); // Initialize useNavigate
  const [updates, setUpdates] = useState<CompanyUpdate[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<'text' | 'image' | 'video' | 'audio'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedUpdate, setSelectedUpdate] = useState<CompanyUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const { user: supabaseUser, profile } = useAuth();
  const isAdmin = profile?.is_admin;

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('company_updates')
        .select(`
          *,
          user:profiles(name, is_admin)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
    };

    const isValidType = validTypes[uploadType as keyof typeof validTypes]?.includes(file.type);
    
    if (!isValidType) {
      alert(`Please select a valid ${uploadType} file`);
      return;
    }

    setSelectedFile(file);
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedThumbnail(file);
    } else {
      alert('Please select a valid image file for thumbnail');
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `updates/${fileName}`;

    const { error } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!title.trim() || !content.trim() || !isAdmin || !supabaseUser) {
      alert('Please fill in all required fields and ensure you have admin access');
      return;
    }

    if (uploadType !== 'text' && !selectedFile) {
      alert(`Please select a ${uploadType} file`);
      return;
    }

    setUploadProgress(0);
    
    try {
      let mediaUrl = null;
      let thumbnailUrl = null;

      // Upload main file if not text
      if (uploadType !== 'text' && selectedFile) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        mediaUrl = await uploadFile(selectedFile);
        
        // Upload thumbnail if provided
        if (selectedThumbnail) {
          thumbnailUrl = await uploadFile(selectedThumbnail);
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      // Insert update into database
      const { error } = await supabase
        .from('company_updates')
        .insert({
          user_id: supabaseUser.id,
          title: title.trim(),
          content: content.trim(),
          media_type: uploadType,
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl
        });

      if (error) throw error;

      // Reset form
      setTitle('');
      setContent('');
      setSelectedFile(null);
      setSelectedThumbnail(null);
      setUploadProgress(0);
      setShowUploadForm(false);
      
      // Refresh updates
      fetchUpdates();
    } catch (error) {
      console.error('Error uploading update:', error);
      alert('Failed to upload update');
    }
  };

  const deleteUpdate = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return;
    if (!isAdmin) {
      alert('You do not have permission to delete updates.');
      return;
    }

    try {
      const { error } = await supabase
        .from('company_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;
      fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
    }
  };

  const incrementViews = async (updateId: string) => {
    try {
      const { error } = await supabase.rpc('increment_update_views', {
        update_id: updateId
      });

      if (error) throw error;
      fetchUpdates();
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const viewUpdate = (update: CompanyUpdate) => {
    incrementViews(update.id);
    if (update.media_type === 'video') {
      setSelectedUpdate(update);
    }
  };

  const closeVideoPlayer = () => {
    setSelectedUpdate(null);
  };

  const getFileAccept = () => {
    switch (uploadType) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      default: return '';
    }
  };

  if (selectedUpdate && selectedUpdate.media_type === 'video') {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <button
          onClick={closeVideoPlayer}
          className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-3 max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 font-semibold">DeltaSilicon Admin</span>
              <CheckCircle className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <h2 className="text-white font-semibold text-lg">{selectedUpdate.title}</h2>
          <p className="text-gray-300 text-sm">{selectedUpdate.content}</p>
        </div>

        {selectedUpdate.media_url && (
          <video
            src={selectedUpdate.media_url}
            className="w-full h-full object-contain"
            controls
            autoPlay
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)} // Use navigate(-1) here
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 mr-4"
            >
              <ArrowLeft className="w-6 h-6 text-yellow-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center glow-circle">
                <Shield className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-xl font-bold text-white">Company Updates</h1>
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button"
            >
              <Plus className="w-4 h-4" />
              Add Update
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Official</span>{' '}
            <span className="text-yellow-400 glow-text">Updates</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stay informed with the latest news, features, and announcements from the DeltaSilicon.Hub team.
          </p>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && isAdmin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center glow-circle">
                      <Shield className="w-4 h-4 text-black" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Create Company Update</h3>
                  </div>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Upload Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Update Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'text', name: 'Text', icon: FileText },
                      { id: 'image', name: 'Image', icon: Image },
                      { id: 'video', name: 'Video', icon: Video },
                      { id: 'audio', name: 'Audio', icon: Mic }
                    ].map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setUploadType(type.id as any)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-300 ${
                            uploadType === type.id
                              ? 'bg-yellow-400 text-black border-yellow-400'
                              : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-sm font-medium">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter update title..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>

                {/* Content Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter update content..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none resize-none"
                    rows={4}
                  />
                </div>

                {/* File Upload (if not text type) */}
                {uploadType !== 'text' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} File *
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={getFileAccept()}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-yellow-400/50 transition-colors duration-300 flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-400">Click to select {uploadType} file</span>
                      </button>
                      {selectedFile && (
                        <div className="mt-2 bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-white text-sm">{selectedFile.name}</p>
                          <p className="text-gray-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      )}
                    </div>

                    {uploadType === 'video' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail (Optional)</label>
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-yellow-400/50 transition-colors duration-300 flex flex-col items-center gap-2"
                        >
                          <Image className="w-6 h-6 text-gray-400" />
                          <span className="text-gray-400 text-sm">Click to select thumbnail</span>
                        </button>
                        {selectedThumbnail && (
                          <div className="mt-2 bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-white text-sm">{selectedThumbnail.name}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-4">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                  className="w-full px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-button"
                >
                  {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Publish Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Updates List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No updates yet</h3>
              <p className="text-gray-400">Check back soon for the latest company news!</p>
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300">
                {/* Media Preview */}
                {update.media_type === 'image' && update.media_url && (
                  <div className="aspect-video relative">
                    <img
                      src={update.media_url}
                      alt={update.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {update.media_type === 'video' && (update.thumbnail_url || update.media_url) && (
                  <div className="aspect-video relative cursor-pointer" onClick={() => viewUpdate(update)}>
                    <img
                      src={update.thumbnail_url || update.media_url || ''}
                      alt={update.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="p-3 bg-yellow-400/90 text-black rounded-full hover:bg-yellow-400 transition-colors duration-300 glow-button">
                        <Play className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )}

                {update.media_type === 'audio' && update.media_url && (
                  <div className="p-4 bg-gray-800/50">
                    <audio controls className="w-full">
                      <source src={update.media_url} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Admin Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center glow-circle">
                          <Shield className="w-4 h-4 text-black" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-semibold">DeltaSilicon Admin</span>
                          <CheckCircle className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full glow-circle"></div>
                          <span className="text-xs text-yellow-400 font-semibold uppercase">
                            {update.media_type} Update
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">{update.title}</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">{update.content}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(update.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{update.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <button
                        onClick={() => deleteUpdate(update.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {update.media_type === 'video' && (
                    <button
                      onClick={() => viewUpdate(update)}
                      className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center gap-2 glow-button"
                    >
                      <Play className="w-4 h-4" />
                      Watch Video
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUpdatesPage;