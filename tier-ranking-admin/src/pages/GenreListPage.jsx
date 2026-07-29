import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '../api/axiosInstance.js';
import { genreApi } from '../api/genreApi.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { GenreTable } from '../components/genres/GenreTable.jsx';

export function GenreListPage() {
  const [genres, setGenres] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: 'all', isActive: 'all', sort: 'updated', page: 1 });
  const [confirm, setConfirm] = useState(null);

  const params = useMemo(() => ({ ...filters, limit: 10 }), [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await genreApi.list(params);
      setGenres(data.data);
      setMeta(data.meta);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(load, filters.search ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [params]);

  const runAction = async () => {
    if (!confirm) return;
    const id = confirm.genre._id || confirm.genre.id;
    try {
      if (confirm.action === 'delete') await genreApi.remove(id);
      if (confirm.action === 'publish') await genreApi.publish(id);
      if (confirm.action === 'unpublish') await genreApi.unpublish(id);
      if (confirm.action === 'activate') await genreApi.activate(id);
      if (confirm.action === 'deactivate') await genreApi.deactivate(id);
      if (confirm.action === 'duplicate') await genreApi.duplicate(id);
      toast.success('Action completed');
      setConfirm(null);
      load();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Genres</h1>
          <p className="mt-1 text-sm text-[#64748b]">Search, publish, duplicate and manage every ranking game.</p>
        </div>
        <Link className="btn btn-primary focus-ring" to="/genres/create">
          <Plus size={16} aria-hidden="true" />
          Create Genre
        </Link>
      </div>
      <section className="surface grid gap-3 p-4 lg:grid-cols-[1fr_180px_180px_180px]">
        <label className="relative">
          <span className="sr-only">Search genres</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
          <input
            className="field-input pl-10"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            placeholder="Search genres"
          />
        </label>
        <select className="field-input" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select className="field-input" value={filters.isActive} onChange={(event) => setFilters((current) => ({ ...current, isActive: event.target.value, page: 1 }))}>
          <option value="all">All activity</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select className="field-input" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value, page: 1 }))}>
          <option value="updated">Recently updated</option>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
        </select>
      </section>
      {loading ? (
        <Skeleton className="h-96" />
      ) : genres.length ? (
        <>
          <GenreTable genres={genres} onAction={(genre, action) => setConfirm({ genre, action })} />
          <div className="flex items-center justify-between text-sm text-[#64748b]">
            <span>
              Page {meta?.page || 1} of {meta?.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-secondary focus-ring" disabled={(meta?.page || 1) <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>
                Previous
              </button>
              <button
                className="btn btn-secondary focus-ring"
                disabled={(meta?.page || 1) >= (meta?.totalPages || 1)}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No genres found" message="Create a draft genre, add ranking columns, rows and at least one image, then publish it." action={<Link className="btn btn-primary" to="/genres/create">Create Genre</Link>} />
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        danger={confirm?.action === 'delete'}
        title={`${confirm?.action || 'Confirm'} genre`}
        message={`This will ${confirm?.action} "${confirm?.genre?.name}".`}
        confirmLabel={confirm?.action === 'delete' ? 'Delete' : 'Confirm'}
        onClose={() => setConfirm(null)}
        onConfirm={runAction}
      />
    </div>
  );
}
