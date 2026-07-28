import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { apiErrorMessage } from '../api/axiosInstance.js';
import { genreApi } from '../api/genreApi.js';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { GenreLivePreview } from '../components/genres/GenreLivePreview.jsx';

export function PreviewGenrePage() {
  const { id } = useParams();
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const publicUrl = import.meta.env.VITE_PUBLIC_GAME_URL || 'http://localhost:5173';

  useEffect(() => {
    let ignore = false;
    genreApi
      .preview(id)
      .then((response) => {
        if (!ignore) setGenre(response.data.data);
      })
      .catch((error) => toast.error(apiErrorMessage(error)))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <Loader label="Loading preview" />;
  if (!genre) return <EmptyState title="Preview unavailable" message="This draft or genre could not be loaded." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]" to={`/genres/${id}/edit`}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to editor
          </Link>
          <h1 className="text-2xl font-black text-[#111827]">{genre.name}</h1>
          <p className="mt-1 text-sm text-[#64748b]">Protected admin preview for draft and published games.</p>
        </div>
        {genre.status === 'published' && genre.isActive ? (
          <a className="btn btn-secondary focus-ring" href={`${publicUrl}/play/${genre.slug}`} target="_blank" rel="noreferrer">
            <ExternalLink size={16} aria-hidden="true" />
            Open Public Game
          </a>
        ) : null}
      </div>
      <GenreLivePreview genre={genre} viewport="desktop" />
    </div>
  );
}
