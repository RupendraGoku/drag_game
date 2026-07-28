import { Copy, Edit, Eye, Power, Trash2, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GenreStatusBadge } from './GenreStatusBadge.jsx';

export function GenreTable({ genres, onAction }) {
  return (
    <div className="surface overflow-hidden">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-left">
          <thead className="border-b border-[#d8dee7] bg-[#f8fafc] text-xs uppercase text-[#64748b]">
            <tr>
              <th className="px-4 py-3">Genre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Counts</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8dee7]">
            {genres.map((genre) => (
              <tr key={genre._id || genre.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img className="h-14 w-20 rounded-md border border-[#d8dee7] object-cover" src={genre.coverImage?.url || '/missing-cover.svg'} alt={genre.coverImage?.alt || ''} />
                    <div>
                      <p className="font-bold text-[#111827]">{genre.name}</p>
                      <p className="mt-1 max-w-xs text-sm text-[#64748b]">{genre.heading}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#334155]">{genre.slug}</td>
                <td className="px-4 py-3 text-sm text-[#334155]">
                  {genre.topCategories?.length || 0} columns<br />
                  {genre.tiers?.length || 0} rows<br />
                  {genre.items?.length || 0} images
                </td>
                <td className="px-4 py-3">
                  <GenreStatusBadge status={genre.status} active={genre.isActive} />
                </td>
                <td className="px-4 py-3 text-sm text-[#64748b]">{new Date(genre.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="btn btn-secondary focus-ring px-2" to={`/genres/${genre._id || genre.id}/edit`} aria-label={`Edit ${genre.name}`}>
                      <Edit size={16} />
                    </Link>
                    <Link className="btn btn-secondary focus-ring px-2" to={`/genres/${genre._id || genre.id}/preview`} aria-label={`Preview ${genre.name}`}>
                      <Eye size={16} />
                    </Link>
                    <button className="btn btn-secondary focus-ring px-2" onClick={() => onAction(genre, genre.status === 'published' ? 'unpublish' : 'publish')} aria-label="Toggle publish">
                      <UploadCloud size={16} />
                    </button>
                    <button className="btn btn-secondary focus-ring px-2" onClick={() => onAction(genre, genre.isActive ? 'deactivate' : 'activate')} aria-label="Toggle active">
                      <Power size={16} />
                    </button>
                    <button className="btn btn-secondary focus-ring px-2" onClick={() => onAction(genre, 'duplicate')} aria-label="Duplicate">
                      <Copy size={16} />
                    </button>
                    <button className="btn btn-secondary focus-ring px-2 text-[#dc2626]" onClick={() => onAction(genre, 'delete')} aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {genres.map((genre) => (
          <article key={genre._id || genre.id} className="rounded-lg border border-[#d8dee7] p-3">
            <div className="flex gap-3">
              <img className="h-20 w-24 rounded-md border border-[#d8dee7] object-cover" src={genre.coverImage?.url || '/missing-cover.svg'} alt={genre.coverImage?.alt || ''} />
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-[#111827]">{genre.name}</h2>
                <p className="truncate text-sm text-[#64748b]">{genre.slug}</p>
                <div className="mt-2">
                  <GenreStatusBadge status={genre.status} active={genre.isActive} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="btn btn-secondary focus-ring" to={`/genres/${genre._id || genre.id}/edit`}>
                Edit
              </Link>
              <Link className="btn btn-secondary focus-ring" to={`/genres/${genre._id || genre.id}/preview`}>
                Preview
              </Link>
              <button className="btn btn-secondary focus-ring" onClick={() => onAction(genre, 'duplicate')}>
                Duplicate
              </button>
              <button className="btn btn-danger focus-ring" onClick={() => onAction(genre, 'delete')}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
