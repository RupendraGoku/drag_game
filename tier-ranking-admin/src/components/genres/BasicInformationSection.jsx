import { ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../../api/axiosInstance.js';
import { uploadApi } from '../../api/uploadApi.js';
import { FormError } from '../common/FormError.jsx';

export function BasicInformationSection({
  register,
  errors,
  serverErrors,
  coverImage,
  setCoverImage,
  status,
  setStatus,
  isActive,
  setIsActive,
  onSlugEdited,
  markDirty
}) {
  const uploadCover = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Cover image must be JPEG, PNG or WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be 5 MB or smaller');
      return;
    }
    try {
      const { data } = await uploadApi.image(file);
      setCoverImage({ ...data.data, alt: file.name });
      markDirty();
      toast.success('Cover uploaded');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const setCoverUrl = (url) => {
    setCoverImage({ ...(coverImage || {}), url, alt: coverImage?.alt || '' });
    markDirty();
  };

  return (
    <section className="surface p-5">
      <div className="mb-5">
        <h2 className="text-lg font-black text-[#111827]">1. Basic Information</h2>
        <p className="mt-1 text-sm text-[#64748b]">Name, URL slug, heading, cover and visibility.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">
            Genre name
          </label>
          <input className="field-input" id="name" {...register('name')} />
          <FormError>{errors.name?.message || serverErrors.name}</FormError>
        </div>
        <div>
          <label className="field-label" htmlFor="slug">
            URL slug
          </label>
          <input className="field-input" id="slug" {...register('slug', { onChange: onSlugEdited })} />
          <FormError>{errors.slug?.message || serverErrors.slug}</FormError>
        </div>
        <div className="lg:col-span-2">
          <label className="field-label" htmlFor="heading">
            Main heading
          </label>
          <input className="field-input" id="heading" {...register('heading')} />
          <FormError>{errors.heading?.message || serverErrors.heading}</FormError>
        </div>
        <div className="lg:col-span-2">
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea className="field-input min-h-24 resize-y" id="description" {...register('description')} />
          <FormError>{errors.description?.message || serverErrors.description}</FormError>
        </div>
        <div>
          <span className="field-label">Cover image</span>
          <div className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-3">
            {coverImage?.url ? (
              <img className="mb-3 aspect-[16/9] w-full rounded-md object-cover" src={coverImage.url} alt={coverImage.alt || ''} />
            ) : (
              <div className="mb-3 grid aspect-[16/9] place-items-center rounded-md bg-white text-sm font-semibold text-[#64748b]">
                No cover selected
              </div>
            )}
            <label className="btn btn-secondary focus-ring w-full">
              <ImagePlus size={16} aria-hidden="true" />
              Upload cover
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadCover(event.target.files?.[0])} />
            </label>
            <label className="mt-3 block">
              <span className="field-label">Cover image URL</span>
              <input className="field-input" value={coverImage?.url || ''} onChange={(event) => setCoverUrl(event.target.value)} placeholder="https://example.com/cover.jpg" />
            </label>
          </div>
          <FormError>{serverErrors.coverImage}</FormError>
        </div>
        <div className="space-y-4">
          <div>
            <span className="field-label">Status</span>
            <div className="grid grid-cols-2 gap-2">
              {['draft', 'published'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`btn focus-ring capitalize ${status === value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setStatus(value);
                    markDirty();
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-[#d8dee7] p-3 text-sm font-bold text-[#334155]">
            Active
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => {
                setIsActive(event.target.checked);
                markDirty();
              }}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
