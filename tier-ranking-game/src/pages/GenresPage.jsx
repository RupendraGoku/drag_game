import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/axiosInstance.js';
import { genreApi } from '../api/genreApi.js';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { GenreGrid } from '../components/genres/GenreGrid.jsx';

export function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await genreApi.list({ search });
      setGenres(data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(load, search ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">All Published Genres</h1>
          <p className="mt-1 text-xs text-[#64748b] sm:text-sm">Only published and active games are available here.</p>
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search genres</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" size={15} />
          <input className="w-full rounded-md border border-[#d8dee7] px-8 py-2 text-sm outline-none focus:border-[#2563eb]" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search genres" />
        </label>
      </div>
      {error ? (
        <ErrorState title="Genres unavailable" message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-56" />
          ))}
        </div>
      ) : (
        <GenreGrid genres={genres} />
      )}
    </div>
  );
}
