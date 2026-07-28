import { EmptyState } from '../common/EmptyState.jsx';
import { GenreCard } from './GenreCard.jsx';

export function GenreGrid({ genres }) {
  if (!genres.length) {
    return <EmptyState title="No published genres found" message="Try a different search or check back after new games are published." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {genres.map((genre) => (
        <GenreCard key={genre.id || genre._id || genre.slug} genre={genre} />
      ))}
    </div>
  );
}
