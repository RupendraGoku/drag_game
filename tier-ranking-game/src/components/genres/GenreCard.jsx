import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GenreCard({ genre }) {
  return (
    <article className="surface overflow-hidden">
      <Link to={`/play/${genre.slug}`} className="block">
        <img
          className="aspect-[16/9] w-full object-cover"
          src={genre.coverImage?.url || '/image-fallback.svg'}
          alt={genre.coverImage?.alt || genre.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/image-fallback.svg';
          }}
        />
      </Link>
      <div className="p-3">
        <h2 className="line-clamp-1 text-base font-black text-[#111827]">{genre.name}</h2>
        <p className="mt-1.5 line-clamp-2 min-h-8 text-xs leading-4 text-[#64748b]">{genre.description || genre.heading}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold text-[#334155]">
          <span className="rounded bg-[#f1f5f9] px-1.5 py-1">{genre.itemCount || genre.items?.length || 0} items</span>
          <span className="rounded bg-[#f1f5f9] px-1.5 py-1">{genre.tierCount || genre.tiers?.length || 0} rows</span>
        </div>
        <Link className="btn btn-primary focus-ring mt-3 w-full" to={`/play/${genre.slug}`}>
          <Play size={14} aria-hidden="true" />
          Play Now
        </Link>
      </div>
    </article>
  );
}
