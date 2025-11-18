import { useParams, useNavigate } from 'react-router-dom';
import ActorMoviesPage from '../components/ActorMoviesPage';
import { Movie } from '../services/tmdbApi';

const ActorPage = () => {
  const { actorId } = useParams<{ actorId: string }>();
  const navigate = useNavigate();

  const handleWatchMovie = (movie: Movie) => {
    navigate(`/movie/watch/${movie.id}`);
  };

  if (!actorId) {
    return <div>Actor not found</div>;
  }

  return (
    <ActorMoviesPage
      actorId={parseInt(actorId)}
      onBack={() => navigate(-1)}
      onWatchMovie={handleWatchMovie}
    />
  );
};

export default ActorPage;