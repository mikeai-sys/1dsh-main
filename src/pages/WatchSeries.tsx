import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SeriesPlayer from '../components/SeriesPlayer';
import { SeriesService, Series } from '../services/seriesService';

const WatchSeries = () => {
  const { seriesId, season, episode } = useParams<{ seriesId: string; season: string; episode: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      if (seriesId) {
        try {
          setLoading(true);
          const seriesDetails = await SeriesService.getSeriesDetails(parseInt(seriesId));
          setSeries(seriesDetails);
        } catch (error) {
          console.error("Failed to fetch series", error);
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSeries();
  }, [seriesId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!series) {
    return null;
  }

  return (
    <SeriesPlayer
      series={series}
      onClose={() => navigate(-1)}
      initialSeason={parseInt(season || '1')}
      initialEpisode={parseInt(episode || '1')}
    />
  );
};

export default WatchSeries;