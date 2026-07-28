import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DraggableImageCard({ item, compact = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`touch-none overflow-hidden rounded-md border border-[#d8dee7] bg-white p-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-[#2563eb] ${
        isDragging ? 'opacity-40' : ''
      } ${compact ? 'w-[58px] shrink-0 sm:w-[70px]' : ''}`}
    >
      <button className="block w-full focus:outline-none" type="button" {...attributes} {...listeners} aria-label={`Drag ${item.title}`}>
        <img
          className="aspect-square w-full rounded object-cover"
          src={item.image?.url || '/image-fallback.svg'}
          alt={item.alt || item.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/image-fallback.svg';
          }}
        />
      </button>
    </article>
  );
}
