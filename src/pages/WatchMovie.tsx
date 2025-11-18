import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { tmdbApi, Movie } from '../services/tmdbApi';

const WatchMovie = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      if (movieId) {
        try {
          setLoading(true);
          const movieDetails = await tmdbApi.getMovieDetails(parseInt(movieId));
          setMovie(movieDetails);
        } catch (error) {
          console.error("Failed to fetch movie", error);
          navigate('/dashboard'); // Redirect if movie not found
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMovie();
  }, [movieId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!movie) {
    return null; // Or a "not found" message
  }

  return <VideoPlayer movie={movie} onClose={() => navigate(-1)} contentType="movie" />;
};

export default WatchMovie;