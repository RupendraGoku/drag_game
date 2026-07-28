import { useParams } from 'react-router-dom';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { RankingGame } from '../components/ranking/RankingGame.jsx';
import { useGenre } from '../hooks/useGenre.js';

export function PlayGenrePage() {
  const { slug } = useParams();
  const { genre, loading, error, retry } = useGenre(slug);

  if (loading) return <Loader label="Loading game" />;
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ErrorState title="Game unavailable" message={error} onRetry={retry} />
      </div>
    );
  }
  if (!genre) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ErrorState title="Genre not found" message="This genre does not exist, is unpublished, or is inactive." />
      </div>
    );
  }

  return <RankingGame genre={genre} />;
}
