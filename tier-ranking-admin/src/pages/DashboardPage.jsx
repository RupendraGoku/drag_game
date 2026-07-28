import { Edit3, FilePlus2, Image, Layers, ListChecks, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '../api/axiosInstance.js';
import { dashboardApi } from '../api/dashboardApi.js';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';

const statCards = [
  ['totalGenres', 'Total genres', Layers],
  ['publishedGenres', 'Published', ListChecks],
  ['draftGenres', 'Drafts', FilePlus2],
  ['activeGenres', 'Active', Edit3],
  ['inactiveGenres', 'Inactive', Edit3],
  ['totalUploadedImages', 'Uploaded images', Image],
  ['totalRankingRows', 'Ranking rows', ListChecks],
  ['totalTopCategories', 'Ranking columns', Layers]
];

function GenreMiniList({ title, genres }) {
  return (
    <section className="surface p-5">
      <h2 className="text-base font-bold text-[#111827]">{title}</h2>
      <div className="mt-4 space-y-3">
        {genres?.length ? (
          genres.map((genre) => (
            <Link key={genre._id || genre.id} to={`/genres/${genre._id || genre.id}/edit`} className="block rounded-lg border border-[#d8dee7] p-3 hover:bg-[#f8fafc]">
              <p className="text-sm font-bold text-[#111827]">{genre.name}</p>
              <p className="mt-1 text-xs text-[#64748b]">{genre.slug}</p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-[#64748b]">No genres yet.</p>
        )}
      </div>
    </section>
  );
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    dashboardApi
      .stats()
      .then((response) => {
        if (!ignore) setData(response.data.data);
      })
      .catch((error) => toast.error(apiErrorMessage(error)))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    );
  }

  if (!data) return <EmptyState title="Dashboard unavailable" message="The API did not return dashboard data." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#64748b]">Operational overview for tier-ranking games.</p>
        </div>
        <Link className="btn btn-primary focus-ring" to="/genres/create">
          <Plus size={16} aria-hidden="true" />
          Quick Create Genre
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(([key, label, Icon]) => (
          <section key={key} className="surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#64748b]">{label}</p>
                <p className="mt-2 text-3xl font-black text-[#111827]">{data[key] ?? 0}</p>
              </div>
              <div className="rounded-lg bg-[#dbeafe] p-3 text-[#2563eb]">
                <Icon size={20} aria-hidden="true" />
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <GenreMiniList title="Recently created" genres={data.recentlyCreated} />
        <GenreMiniList title="Recently edited" genres={data.recentlyEdited} />
        <GenreMiniList title="Drafts needing completion" genres={data.draftsNeedingCompletion} />
      </div>
    </div>
  );
}
