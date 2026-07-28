import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';

export function TopCategoryEditorRow({ category, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className={`grid gap-3 rounded-lg border border-[#d8dee7] bg-white p-3 md:grid-cols-[36px_1fr_120px_120px_44px] ${isDragging ? 'opacity-60' : ''}`}>
      <button type="button" className="focus-ring rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9]" {...attributes} {...listeners} aria-label={`Drag ${category.name}`}>
        <GripVertical size={18} />
      </button>
      <input className="field-input" value={category.name} onChange={(event) => onChange({ ...category, name: event.target.value })} aria-label="Column name" />
      <input className="field-input h-11" type="color" value={category.colour || '#2563eb'} onChange={(event) => onChange({ ...category, colour: event.target.value })} aria-label="Column colour" />
      <label className="flex items-center justify-between gap-2 rounded-lg border border-[#d8dee7] px-3 text-sm font-semibold text-[#334155]">
        Enabled
        <input type="checkbox" checked={category.isActive !== false} onChange={(event) => onChange({ ...category, isActive: event.target.checked })} />
      </label>
      <button type="button" className="btn btn-secondary focus-ring px-2 text-[#dc2626]" onClick={onDelete} aria-label={`Delete ${category.name}`}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}
