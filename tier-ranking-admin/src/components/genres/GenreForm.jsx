import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, Save, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { apiErrorMessage } from '../../api/axiosInstance.js';
import { genreApi } from '../../api/genreApi.js';
import { REQUIRED_IMAGE_ITEMS } from '../../config/rankingConfig.js';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges.js';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { BasicInformationSection } from './BasicInformationSection.jsx';
import { GenreLivePreview } from './GenreLivePreview.jsx';
import { ImageItemsUploader } from './ImageItemsUploader.jsx';
import { defaultTiers, TierRowsEditor } from './TierRowsEditor.jsx';
import { TopCategoriesEditor } from './TopCategoriesEditor.jsx';

const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const basicSchema = z.object({
  name: z.string().min(2, 'Genre name is required'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
  heading: z.string().max(160, 'Heading is too long').optional().or(z.literal('')),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal(''))
});

const defaultCategories = () => [
  {
    id: newId(),
    name: 'Category 1',
    colour: '#2563eb',
    order: 0,
    isActive: true
  }
];

const mapServerErrors = (error) => {
  const entries = error.response?.data?.errors || [];
  return entries.reduce((acc, item) => {
    const key = item.field.split('.')[0];
    acc[key] = item.message;
    return acc;
  }, {});
};

const publishingErrors = (payload) => {
  const errors = [];
  const activeCategories = payload.topCategories.filter((category) => category.isActive !== false);
  const activeTiers = payload.tiers.filter((tier) => tier.isActive !== false);
  const activeCategoryIds = new Set(activeCategories.map((category) => category.id));
  const categoryNames = payload.topCategories.map((category) => category.name.trim().toLowerCase()).filter(Boolean);

  if (!payload.heading?.trim()) errors.push('Main heading is required before publishing.');
  if (!payload.coverImage?.url) errors.push('Cover image is required before publishing.');
  if (activeCategories.length < 1) errors.push('At least one enabled ranking column is required.');
  if (new Set(categoryNames).size !== categoryNames.length) errors.push('Ranking column names must be unique.');
  if (activeTiers.length < 2) errors.push('At least two enabled ranking rows are required.');
  if (payload.items.length !== REQUIRED_IMAGE_ITEMS) errors.push(`Exactly ${REQUIRED_IMAGE_ITEMS} image items are required before publishing.`);
  payload.items.forEach((item, index) => {
    if (!item.title?.trim()) errors.push(`Image item ${index + 1} needs a title.`);
    if (!item.image?.url) errors.push(`Image item ${index + 1} needs an uploaded image.`);
    if (!item.categoryIds?.some((id) => activeCategoryIds.has(id))) {
      errors.push(`Image item ${index + 1} needs at least one enabled ranking column.`);
    }
  });

  return errors;
};

export function GenreForm({ mode, initialGenre }) {
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [savingAction, setSavingAction] = useState('');
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewViewport, setPreviewViewport] = useState('desktop');

  const [coverImage, setCoverImage] = useState(initialGenre?.coverImage || {});
  const [showAllCategory, setShowAllCategory] = useState(initialGenre?.showAllCategory !== false);
  const [status, setStatus] = useState(initialGenre?.status || 'draft');
  const [isActive, setIsActive] = useState(initialGenre?.isActive !== false);
  const [topCategories, setTopCategories] = useState(initialGenre?.topCategories?.length ? initialGenre.topCategories : defaultCategories());
  const [tiers, setTiers] = useState(initialGenre?.tiers?.length ? initialGenre.tiers : defaultTiers.map((tier) => ({ ...tier, id: newId() })));
  const [items, setItems] = useState(initialGenre?.items || []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting }
  } = useForm({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      name: initialGenre?.name || '',
      slug: initialGenre?.slug || '',
      heading: initialGenre?.heading || '',
      description: initialGenre?.description || ''
    }
  });

  const watchedValues = watch();
  const watchedName = watchedValues.name;

  useEffect(() => {
    if (!slugEdited) {
      setValue('slug', slugify(watchedName), { shouldDirty: Boolean(watchedName) });
    }
  }, [watchedName, setValue, slugEdited]);

  useEffect(() => {
    if (!initialGenre) return;
    reset({
      name: initialGenre.name || '',
      slug: initialGenre.slug || '',
      heading: initialGenre.heading || '',
      description: initialGenre.description || ''
    });
    setCoverImage(initialGenre.coverImage || {});
    setShowAllCategory(initialGenre.showAllCategory !== false);
    setStatus(initialGenre.status || 'draft');
    setIsActive(initialGenre.isActive !== false);
    setTopCategories(initialGenre.topCategories?.length ? initialGenre.topCategories : defaultCategories());
    setTiers(initialGenre.tiers?.length ? initialGenre.tiers : defaultTiers.map((tier) => ({ ...tier, id: newId() })));
    setItems(initialGenre.items || []);
    setDirty(false);
    setSlugEdited(true);
  }, [initialGenre, reset]);

  useUnsavedChanges(isDirty || dirty);

  const genreId = initialGenre?._id || initialGenre?.id;

  const previewGenre = useMemo(
    () => ({
      name: watchedValues.name,
      slug: watchedValues.slug,
      heading: watchedValues.heading,
      description: watchedValues.description,
      coverImage,
      showAllCategory,
      topCategories,
      tiers,
      items,
      status,
      isActive
    }),
    [coverImage, isActive, items, showAllCategory, status, tiers, topCategories, watchedValues]
  );

  const markDirty = () => setDirty(true);

  const buildPayload = (values, nextStatus) => ({
    ...values,
    slug: slugify(values.slug || values.name),
    coverImage,
    showAllCategory,
    topCategories: topCategories.map((category, order) => ({ ...category, order })),
    tiers: tiers.map((tier, order) => ({ ...tier, order })),
    items: items.map((item, order) => ({ ...item, order })),
    status: nextStatus,
    isActive
  });

  const save = async (values, action) => {
    const nextStatus = action === 'publish' ? 'published' : action === 'draft' ? 'draft' : status;
    const payload = buildPayload(values, nextStatus);
    setServerErrors({});

    if (nextStatus === 'published') {
      const localErrors = publishingErrors(payload);
      if (localErrors.length) {
        toast.error(localErrors[0]);
        setServerErrors({
          coverImage: localErrors.find((error) => error.includes('Cover image')),
          topCategories: localErrors.find((error) => error.includes('column') || error.includes('Column')),
          tiers: localErrors.find((error) => error.includes('row')),
          items: localErrors.find((error) => error.includes('image') || error.includes('Image'))
        });
        return;
      }
    }

    setSavingAction(action);
    try {
      const response = mode === 'create' ? await genreApi.create(payload) : await genreApi.update(genreId, payload);
      toast.success(nextStatus === 'published' ? 'Genre published' : 'Genre saved');
      setDirty(false);
      reset(values);
      if (mode === 'create') {
        const createdId = response.data.data._id || response.data.data.id;
        navigate(`/genres/${createdId}/edit`, { replace: true });
      }
    } catch (error) {
      setServerErrors(mapServerErrors(error));
      toast.error(apiErrorMessage(error));
    } finally {
      setSavingAction('');
    }
  };

  const removeGenre = async () => {
    try {
      await genreApi.remove(genreId);
      toast.success('Genre deleted');
      navigate('/genres', { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const cancel = () => {
    if ((isDirty || dirty) && !window.confirm('Discard unsaved changes?')) return;
    navigate('/genres');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]" to="/genres">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to genres
          </Link>
          <h1 className="text-2xl font-black text-[#111827]">{mode === 'create' ? 'Create Genre' : 'Edit Genre'}</h1>
          <p className="mt-1 text-sm text-[#64748b]">Configure the public tier-ranking game from backend-driven data.</p>
        </div>
        {genreId ? (
          <Link className="btn btn-secondary focus-ring" to={`/genres/${genreId}/preview`}>
            <Eye size={16} aria-hidden="true" />
            Full Preview
          </Link>
        ) : null}
      </div>

      <form className="space-y-5">
        <BasicInformationSection
          register={register}
          errors={errors}
          serverErrors={serverErrors}
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          status={status}
          setStatus={setStatus}
          isActive={isActive}
          setIsActive={setIsActive}
          onSlugEdited={() => setSlugEdited(true)}
          markDirty={markDirty}
        />
        <TopCategoriesEditor categories={topCategories} setCategories={setTopCategories} serverErrors={serverErrors} markDirty={markDirty} />
        <TierRowsEditor tiers={tiers} setTiers={setTiers} serverErrors={serverErrors} markDirty={markDirty} />
        <ImageItemsUploader items={items} setItems={setItems} categories={topCategories.filter((category) => category.isActive !== false)} serverErrors={serverErrors} markDirty={markDirty} />
        <section className="surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111827]">Preview Size</h2>
              <p className="mt-1 text-sm text-[#64748b]">Switch the embedded preview width.</p>
            </div>
            <div className="flex rounded-lg border border-[#d8dee7] bg-white p-1">
              {['desktop', 'tablet', 'mobile'].map((viewport) => (
                <button
                  key={viewport}
                  type="button"
                  className={`rounded-md px-3 py-2 text-sm font-bold capitalize ${previewViewport === viewport ? 'bg-[#2563eb] text-white' : 'text-[#334155] hover:bg-[#f1f5f9]'}`}
                  onClick={() => setPreviewViewport(viewport)}
                >
                  {viewport}
                </button>
              ))}
            </div>
          </div>
          <GenreLivePreview genre={previewGenre} viewport={previewViewport} />
        </section>
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border border-[#d8dee7] bg-white p-3 shadow-lg">
          <div className="text-sm font-semibold text-[#64748b]">
            {items.length} of {REQUIRED_IMAGE_ITEMS} images. {topCategories.filter((category) => category.isActive !== false).length} active ranking columns.{' '}
            {tiers.filter((tier) => tier.isActive !== false).length} active rows.
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === 'edit' ? (
              <button type="button" className="btn btn-secondary focus-ring text-[#dc2626]" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </button>
            ) : null}
            <button type="button" className="btn btn-secondary focus-ring" onClick={cancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-secondary focus-ring" disabled={isSubmitting || Boolean(savingAction)} onClick={handleSubmit((values) => save(values, 'draft'))}>
              <Save size={16} aria-hidden="true" />
              {savingAction === 'draft' ? 'Saving...' : 'Save Draft'}
            </button>
            <button type="button" className="btn btn-secondary focus-ring" disabled={isSubmitting || Boolean(savingAction)} onClick={handleSubmit((values) => save(values, 'changes'))}>
              <Save size={16} aria-hidden="true" />
              {savingAction === 'changes' ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-primary focus-ring" disabled={isSubmitting || Boolean(savingAction)} onClick={handleSubmit((values) => save(values, 'publish'))}>
              <UploadCloud size={16} aria-hidden="true" />
              {savingAction === 'publish' ? 'Publishing...' : 'Save and Publish'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Delete genre"
        message="This deletes the genre from the admin and public API."
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(false)}
        onConfirm={removeGenre}
      />
    </div>
  );
}
