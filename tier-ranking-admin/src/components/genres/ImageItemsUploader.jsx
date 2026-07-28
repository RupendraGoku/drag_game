import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../../api/axiosInstance.js';
import { uploadApi } from '../../api/uploadApi.js';
import { REQUIRED_IMAGE_ITEMS } from '../../config/rankingConfig.js';
import { ImageItemEditor } from './ImageItemEditor.jsx';

const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const titleFromFile = (file) =>
  file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function ImageItemsUploader({ items, setItems, categories, serverErrors, markDirty }) {
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const update = (next) => {
    setItems(next.map((item, order) => ({ ...item, order })));
    markDirty();
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    update(arrayMove(items, oldIndex, newIndex));
  };

  const validateFile = (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Images must be JPEG, PNG or WebP';
    if (file.size > 5 * 1024 * 1024) return 'Images must be 5 MB or smaller';
    return '';
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const remainingSlots = REQUIRED_IMAGE_ITEMS - items.length;
    if (remainingSlots <= 0) {
      toast.error(`A game can contain exactly ${REQUIRED_IMAGE_ITEMS} images.`);
      return;
    }
    const filesToUpload = files.slice(0, remainingSlots);

    const invalid = filesToUpload.map(validateFile).find(Boolean);
    if (invalid) {
      toast.error(invalid);
      return;
    }

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of filesToUpload) {
        const { data } = await uploadApi.image(file);
        uploaded.push({
          id: newId(),
          title: titleFromFile(file),
          alt: titleFromFile(file),
          description: '',
          image: data.data,
          categoryIds: categories[0]?.id ? [categories[0].id] : [],
          order: items.length + uploaded.length
        });
      }
      update([...items, ...uploaded].slice(0, REQUIRED_IMAGE_ITEMS));
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded`);
      if (files.length > filesToUpload.length) {
        toast.error(`${files.length - filesToUpload.length} extra image${files.length - filesToUpload.length === 1 ? '' : 's'} skipped`);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#111827]">4. {REQUIRED_IMAGE_ITEMS} Image Items</h2>
          <p className="mt-1 text-sm text-[#64748b]">{items.length} of {REQUIRED_IMAGE_ITEMS} images uploaded.</p>
        </div>
        <label className="btn btn-secondary focus-ring">
          <ImagePlus size={16} aria-hidden="true" />
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input className="sr-only" multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleFiles(event.target.files)} disabled={uploading} />
        </label>
      </div>
      <div
        className="mb-4 rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center text-sm font-semibold text-[#64748b]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
      >
        Drop JPEG, PNG or WebP files here. Publishing requires exactly {REQUIRED_IMAGE_ITEMS} valid items.
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <ImageItemEditor
                key={item.id}
                item={item}
                categories={categories}
                onChange={(next) => update(items.map((entry, entryIndex) => (entryIndex === index ? next : entry)))}
                onDelete={() => update(items.filter((entry) => entry.id !== item.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {items.length > REQUIRED_IMAGE_ITEMS ? <p className="mt-3 text-sm font-semibold text-[#dc2626]">A published game must contain exactly {REQUIRED_IMAGE_ITEMS} images.</p> : null}
      {serverErrors.items ? <p className="mt-3 text-sm font-semibold text-[#dc2626]">{serverErrors.items}</p> : null}
    </section>
  );
}
