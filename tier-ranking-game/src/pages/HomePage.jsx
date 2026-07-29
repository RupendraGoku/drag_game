import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '../api/axiosInstance.js';
import { genreApi } from '../api/genreApi.js';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { GenreGrid } from '../components/genres/GenreGrid.jsx';
import { loadRecentlyPlayed } from '../utils/storageHelpers.js';

export function HomePage() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [recent] = useState(() => loadRecentlyPlayed());

  useEffect(() => {
    genreApi
      .featured()
      .then((response) => setGenres(response.data.data))
      .catch((error) => toast.error(apiErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const filters = useMemo(() => {
    const names = new Set();
    genres.forEach((genre) => genre.categories?.forEach((category) => names.add(category.name)));
    return ['all', ...Array.from(names).slice(0, 8)];
  }, [genres]);

  const filteredGenres = useMemo(
    () =>
      genres.filter((genre) => {
        const matchesSearch = [genre.name, genre.heading, genre.description].join(' ').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || genre.categories?.some((category) => category.name === filter);
        return matchesSearch && matchesFilter;
      }),
    [genres, search, filter]
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4">
      <section className="mb-4">
        <h1 className="max-w-3xl text-2xl font-black text-[#111827] sm:text-3xl">Choose a Tier Ranking Game</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[#64748b]">Pick a published genre, rank its images, and continue editing your saved board later.</p>
      </section>
      <section className="surface mb-4 grid gap-2 p-3 lg:grid-cols-[1fr_auto]">
        <label className="relative">
          <span className="sr-only">Search genres</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b]" size={15} />
          <input className="w-full rounded-md border border-[#d8dee7] px-8 py-2 text-sm outline-none focus:border-[#2563eb]" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search genres" />
        </label>
        <div className="flex max-w-full gap-1.5 overflow-x-auto">
          {filters.map((name) => (
            <button key={name} className={`rounded-md px-2.5 py-1.5 text-xs font-bold ${filter === name ? 'bg-[#2563eb] text-white' : 'border border-[#d8dee7] bg-white text-[#334155]'}`} onClick={() => setFilter(name)}>
              {name === 'all' ? 'All' : name}
            </button>
          ))}
        </div>
      </section>
      {recent.length ? (
        <section className="mb-5">
          <h2 className="mb-2 text-base font-black text-[#111827]">Recently Played</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recent.map((genre) => (
              <Link key={genre.id} to={`/play/${genre.slug}`} className="min-w-44 rounded-md border border-[#d8dee7] bg-white p-2 hover:bg-[#f8fafc]">
                <img className="mb-1.5 aspect-[16/9] w-full rounded object-cover" src={genre.coverImage?.url || '/image-fallback.svg'} alt={genre.coverImage?.alt || genre.name} />
                <p className="truncate text-xs font-black text-[#111827]">{genre.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-56" />
          ))}
        </div>
      ) : (
        <GenreGrid genres={filteredGenres} />
      )}
    </div>
  );
}
