import { useState, useEffect } from 'react';
import { X, Settings, Play, ChevronLeft, ChevronRight, List, Clock, Star, Calendar, SkipForward, ChevronDown, ChevronUp } from 'lucide-react';
import { SeriesService, Episode } from '../services/seriesService';
import { StreamingServiceManager } from '../services/streamingService';
import { UserService } from '../services/userService';
import SecureIframePlayer from './SecureIframePlayer';

interface SeriesPlayerProps {
  series: any;
  onClose: () => void;
  initialSeason?: number;
  initialEpisode?: number;
}

const SeriesPlayer: React.FC<SeriesPlayerProps> = ({ 
  series, 
  onClose, 
  initialSeason = 1, 
  initialEpisode = 1 
}) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [showEpisodeList, setShowEpisodeList] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [expandedSeasons, setExpandedSeasons] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const allEpisodes = await SeriesService.getAllEpisodes(series.id);
        setEpisodes(allEpisodes);
        
        // Find initial episode
        const initialEp = allEpisodes.find(ep => 
          ep.season_number === initialSeason && ep.episode_number === initialEpisode
        ) || allEpisodes[0];
        
        setCurrentEpisode(initialEp);
        
        // Auto-expand current season
        if (initialEp) {
          setExpandedSeasons({ [initialEp.season_number]: true });
        }
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [series.id, initialSeason, initialEpisode]);

  const getStreamingUrl = () => {
    if (!currentEpisode) return '';
    return SeriesService.getEpisodeStreamUrl(
      series.id, 
      currentEpisode.season_number, 
      currentEpisode.episode_number
    );
  };

  const playEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    
    // Add to watch history
    if (UserService.isLoggedIn()) {
      UserService.addToHistory({
        ...series,
        title: `${series.name} - S${episode.season_number}E${episode.episode_number}`,
        episode_info: {
          season: episode.season_number,
          episode: episode.episode_number,
          episode_name: episode.name
        }
      }, 'series');
    }
  };

  const playNextEpisode = () => {
    if (!currentEpisode) return;
    
    const currentIndex = episodes.findIndex(ep => 
      ep.season_number === currentEpisode.season_number && 
      ep.episode_number === currentEpisode.episode_number
    );
    
    if (currentIndex < episodes.length - 1) {
      playEpisode(episodes[currentIndex + 1]);
    }
  };

  const playPreviousEpisode = () => {
    if (!currentEpisode) return;
    
    const currentIndex = episodes.findIndex(ep => 
      ep.season_number === currentEpisode.season_number && 
      ep.episode_number === currentEpisode.episode_number
    );
    
    if (currentIndex > 0) {
      playEpisode(episodes[currentIndex - 1]);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    StreamingServiceManager.setActiveService(serviceId);
    setShowSettings(false);
  };

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [seasonNumber]: !prev[seasonNumber]
    }));
  };

  const services = StreamingServiceManager.getServices();

  // Group episodes by season
  const episodesBySeason = episodes.reduce((acc, episode) => {
    const season = episode.season_number;
    if (!acc[season]) acc[season] = [];
    acc[season].push(episode);
    return acc;
  }, {} as { [key: number]: Episode[] });

  const getCurrentEpisodeIndex = () => {
    if (!currentEpisode) return -1;
    return episodes.findIndex(ep => 
      ep.season_number === currentEpisode.season_number && 
      ep.episode_number === currentEpisode.episode_number
    );
  };

  const hasNextEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    return currentIndex >= 0 && currentIndex < episodes.length - 1;
  };

  const hasPreviousEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    return currentIndex > 0;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        {/* Main Video Player */}
        <div className={`relative transition-all duration-300 ${showEpisodeList ? 'w-2/3' : 'w-full'}`}>
          {/* Controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-3 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={() => setShowEpisodeList(!showEpisodeList)}
                className="p-3 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
              >
                <List className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={playPreviousEpisode}
                disabled={!hasPreviousEpisode()}
                className="p-3 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={playNextEpisode}
                disabled={!hasNextEpisode()}
                className="p-3 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {hasNextEpisode() && (
                <button
                  onClick={playNextEpisode}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400/90 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors duration-300"
                >
                  <SkipForward className="w-4 h-4" />
                  Next Episode
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
                >
                  <Settings className="w-6 h-6 text-white" />
                </button>

                {showSettings && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-48">
                    <h3 className="text-white font-semibold mb-3">Streaming Service</h3>
                    <div className="space-y-2 mb-4">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceChange(service.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-300 ${
                            service.isActive
                              ? 'bg-yellow-400 text-black font-semibold'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-700 pt-3">
                      <label className="flex items-center gap-2 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={autoPlay}
                          onChange={(e) => setAutoPlay(e.target.checked)}
                          className="rounded"
                        />
                        Auto-play next episode
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Episode Info */}
          {currentEpisode && (
            <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-4 max-w-md">
              <h3 className="text-white font-semibold text-lg mb-1">
                S{currentEpisode.season_number}E{currentEpisode.episode_number}: {currentEpisode.name}
              </h3>
              <p className="text-gray-300 text-sm line-clamp-2">{currentEpisode.overview}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {currentEpisode.vote_average > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{currentEpisode.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {currentEpisode.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{currentEpisode.runtime}m</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Iframe */}
          <SecureIframePlayer
            key={currentEpisode?.id}
            src={getStreamingUrl()}
            title={`Watch ${series.name} - ${currentEpisode?.name}`}
          />
        </div>

        {/* Desktop Episode List Sidebar */}
        {showEpisodeList && (
          <div className="w-1/3 bg-gray-900 border-l border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{series.name}</h2>
                  <p className="text-sm text-gray-400">{episodes.length} episodes</p>
                </div>
              </div>

              {/* Current Episode Highlight */}
              {currentEpisode && (
                <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 text-sm font-semibold">Now Playing</span>
                  </div>
                  <h4 className="text-white font-medium">
                    S{currentEpisode.season_number}E{currentEpisode.episode_number}: {currentEpisode.name}
                  </h4>
                </div>
              )}

              {/* Episodes by Season */}
              {Object.entries(episodesBySeason).map(([seasonNum, seasonEpisodes]) => (
                <div key={seasonNum} className="mb-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3 sticky top-0 bg-gray-900 py-2">
                    Season {seasonNum} ({seasonEpisodes.length} episodes)
                  </h3>
                  
                  <div className="space-y-2">
                    {seasonEpisodes.map((episode) => {
                      const isCurrentEpisode = currentEpisode?.id === episode.id;
                      const episodeIndex = episodes.findIndex(ep => ep.id === episode.id);
                      const isWatched = episodeIndex < getCurrentEpisodeIndex();
                      
                      return (
                        <div
                          key={`${episode.season_number}-${episode.episode_number}`}
                          className={`group cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                            isCurrentEpisode
                              ? 'bg-yellow-400/20 border-yellow-400/50'
                              : isWatched
                              ? 'bg-gray-800/30 border-gray-700/50'
                              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                          }`}
                          onClick={() => playEpisode(episode)}
                        >
                          <div className="flex gap-3">
                            {/* Episode Number Badge */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCurrentEpisode
                                ? 'bg-yellow-400 text-black'
                                : isWatched
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {episode.episode_number}
                            </div>

                            {/* Episode Thumbnail */}
                            <div className="relative w-24 h-14 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                              {episode.still_path ? (
                                <img
                                  src={SeriesService.getImageUrl(episode.still_path, 'w300') || ''}
                                  alt={episode.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Play className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              
                              {/* Play overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white" />
                              </div>

                              {/* Episode duration */}
                              {episode.runtime && (
                                <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-xs text-white">
                                  {episode.runtime}m
                                </div>
                              )}
                            </div>

                            {/* Episode Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-medium mb-1 line-clamp-2 ${
                                isCurrentEpisode ? 'text-yellow-400' : 'text-white'
                              }`}>
                                {episode.name}
                              </h4>
                              
                              <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                {episode.overview}
                              </p>

                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {episode.vote_average > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span>{episode.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                                
                                {episode.air_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(episode.air_date).getFullYear()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Mobile Video Player */}
        <div className="relative flex-shrink-0" style={{ height: '40vh' }}>
          {/* Mobile Controls */}
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={playPreviousEpisode}
                disabled={!hasPreviousEpisode()}
                className="p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              
              <button
                onClick={playNextEpisode}
                disabled={!hasNextEpisode()}
                className="p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>

                {showSettings && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 min-w-40 text-sm">
                    <h3 className="text-white font-semibold mb-2">Service</h3>
                    <div className="space-y-1">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceChange(service.id)}
                          className={`w-full text-left px-2 py-1 rounded transition-colors duration-300 ${
                            service.isActive
                              ? 'bg-yellow-400 text-black font-semibold'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Iframe */}
          <SecureIframePlayer
            key={currentEpisode?.id}
            src={getStreamingUrl()}
            title={`Watch ${series.name} - ${currentEpisode?.name}`}
          />
        </div>

        {/* Mobile Episode List Below Video */}
        <div className="flex-1 bg-gray-900 overflow-y-auto">
          <div className="p-4">
            {/* Series Info */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">{series.name}</h2>
              <p className="text-sm text-gray-400">{episodes.length} episodes</p>
            </div>

            {/* Current Episode Info */}
            {currentEpisode && (
              <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400 text-sm font-semibold">Now Playing</span>
                </div>
                <h4 className="text-white font-medium text-sm">
                  S{currentEpisode.season_number}E{currentEpisode.episode_number}: {currentEpisode.name}
                </h4>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{currentEpisode.overview}</p>
                
                {hasNextEpisode() && (
                  <button
                    onClick={playNextEpisode}
                    className="flex items-center gap-2 mt-3 px-3 py-2 bg-yellow-400 text-black font-semibold rounded-lg text-sm w-full justify-center"
                  >
                    <SkipForward className="w-4 h-4" />
                    Next Episode
                  </button>
                )}
              </div>
            )}

            {/* Mobile Episodes by Season */}
            {Object.entries(episodesBySeason).map(([seasonNum, seasonEpisodes]) => (
              <div key={seasonNum} className="mb-4">
                <button
                  onClick={() => toggleSeason(parseInt(seasonNum))}
                  className="w-full flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg mb-2"
                >
                  <div className="text-left">
                    <h3 className="text-yellow-400 font-semibold">Season {seasonNum}</h3>
                    <p className="text-gray-400 text-sm">{seasonEpisodes.length} episodes</p>
                  </div>
                  {expandedSeasons[parseInt(seasonNum)] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSeasons[parseInt(seasonNum)] && (
                  <div className="space-y-2">
                    {seasonEpisodes.map((episode) => {
                      const isCurrentEpisode = currentEpisode?.id === episode.id;
                      const episodeIndex = episodes.findIndex(ep => ep.id === episode.id);
                      const isWatched = episodeIndex < getCurrentEpisodeIndex();
                      
                      return (
                        <div
                          key={`${episode.season_number}-${episode.episode_number}`}
                          className={`cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                            isCurrentEpisode
                              ? 'bg-yellow-400/20 border-yellow-400/50'
                              : isWatched
                              ? 'bg-gray-800/30 border-gray-700/50'
                              : 'bg-gray-800/50 border-gray-700'
                          }`}
                          onClick={() => playEpisode(episode)}
                        >
                          <div className="flex gap-3">
                            {/* Episode Number Badge */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCurrentEpisode
                                ? 'bg-yellow-400 text-black'
                                : isWatched
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {episode.episode_number}
                            </div>

                            {/* Episode Thumbnail */}
                            <div className="relative w-20 h-12 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                              {episode.still_path ? (
                                <img
                                  src={SeriesService.getImageUrl(episode.still_path, 'w300') || ''}
                                  alt={episode.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Play className="w-3 h-3 text-gray-500" />
                                </div>
                              )}
                              
                              {/* Episode duration */}
                              {episode.runtime && (
                                <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/70 rounded text-xs text-white">
                                  {episode.runtime}m
                                </div>
                              )}
                            </div>

                            {/* Episode Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-medium mb-1 line-clamp-2 ${
                                isCurrentEpisode ? 'text-yellow-400' : 'text-white'
                              }`}>
                                {episode.name}
                              </h4>
                              
                              <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                                {episode.overview}
                              </p>

                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {episode.vote_average > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span>{episode.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                                
                                {episode.air_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(episode.air_date).getFullYear()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {episodes.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📺</div>
                <h3 className="text-lg font-semibold text-white mb-2">No episodes found</h3>
                <p className="text-gray-400 text-sm">
                  Episodes for this series are not available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesPlayer;