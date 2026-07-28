import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImagePlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../../api/axiosInstance.js';
import { uploadApi } from '../../api/uploadApi.js';

export function ImageItemEditor({ item, categories, onChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const replaceImage = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Images must be JPEG, PNG or WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Images must be 5 MB or smaller');
      return;
    }
    try {
      const { data } = await uploadApi.image(file);
      onChange({ ...item, image: data.data, alt: item.alt || file.name });
      toast.success('Image replaced');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const toggleCategory = (categoryId) => {
    const current = new Set(item.categoryIds || []);
    if (current.has(categoryId)) current.delete(categoryId);
    else current.add(categoryId);
    onChange({ ...item, categoryIds: Array.from(current) });
  };

  return (
    <article ref={setNodeRef} style={style} className={`rounded-lg border border-[#d8dee7] bg-white p-3 ${isDragging ? 'opacity-60' : ''}`}>
      <div className="grid gap-3 lg:grid-cols-[36px_140px_1fr_44px]">
        <button type="button" className="focus-ring rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9]" {...attributes} {...listeners} aria-label={`Drag ${item.title}`}>
          <GripVertical size={18} />
        </button>
        <div>
          {item.image?.url ? (
            <img className="aspect-square w-full rounded-md border border-[#d8dee7] object-cover" src={item.image.url} alt={item.alt || item.title} />
          ) : (
            <div className="grid aspect-square w-full place-items-center rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] text-xs font-bold text-[#64748b]">No image</div>
          )}
          <label className="btn btn-secondary focus-ring mt-2 w-full px-2 text-xs">
            <ImagePlus size={14} aria-hidden="true" />
            Replace
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => replaceImage(event.target.files?.[0])} />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="field-label">Item title</label>
            <input className="field-input" value={item.title} onChange={(event) => onChange({ ...item, title: event.target.value })} />
          </div>
          <div>
            <label className="field-label">Alt text</label>
            <input className="field-input" value={item.alt || ''} onChange={(event) => onChange({ ...item, alt: event.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Short description</label>
            <input className="field-input" value={item.description || ''} onChange={(event) => onChange({ ...item, description: event.target.value })} />
          </div>
          <fieldset className="md:col-span-2">
            <legend className="field-label">Ranking-column assignment</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 rounded-full border border-[#d8dee7] px-3 py-2 text-sm font-semibold text-[#334155]">
                  <input type="checkbox" checked={(item.categoryIds || []).includes(category.id)} onChange={() => toggleCategory(category.id)} />
                  {category.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <button type="button" className="btn btn-secondary focus-ring h-11 px-2 text-[#dc2626]" onClick={onDelete} aria-label={`Delete ${item.title}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
