import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';

export function TierRowEditor({ tier, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tier.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`grid gap-3 rounded-lg border border-[#d8dee7] bg-white p-3 lg:grid-cols-[36px_1fr_120px_120px_120px_44px] ${isDragging ? 'opacity-60' : ''}`}>
      <button type="button" className="focus-ring rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9]" {...attributes} {...listeners} aria-label={`Drag ${tier.label}`}>
        <GripVertical size={18} />
      </button>
      <input className="field-input" value={tier.label} onChange={(event) => onChange({ ...tier, label: event.target.value })} aria-label="Tier label" />
      <input className="field-input h-11" type="color" value={tier.backgroundColour || '#f8fafc'} onChange={(event) => onChange({ ...tier, backgroundColour: event.target.value })} aria-label="Tier background colour" />
      <input className="field-input h-11" type="color" value={tier.textColour || '#111827'} onChange={(event) => onChange({ ...tier, textColour: event.target.value })} aria-label="Tier text colour" />
      <label className="flex items-center justify-between gap-2 rounded-lg border border-[#d8dee7] px-3 text-sm font-semibold text-[#334155]">
        Enabled
        <input type="checkbox" checked={tier.isActive !== false} onChange={(event) => onChange({ ...tier, isActive: event.target.checked })} />
      </label>
      <button type="button" className="btn btn-secondary focus-ring px-2 text-[#dc2626]" onClick={onDelete} aria-label={`Delete ${tier.label}`}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}
