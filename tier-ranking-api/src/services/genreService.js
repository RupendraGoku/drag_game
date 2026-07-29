import crypto from 'crypto';
import mongoose from 'mongoose';
import { MIN_IMAGE_ITEMS } from '../config/rankingConfig.js';
import { Genre } from '../models/Genre.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';

const defaultTiers = [
  ['God Tier', '#fef3c7', '#92400e'],
  ['Excellent', '#dcfce7', '#166534'],
  ['Good', '#dbeafe', '#1d4ed8'],
  ['Overrated', '#fee2e2', '#991b1b'],
  ['Worst', '#f1f5f9', '#334155']
];

const ordered = (items = []) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const normalizeCategories = (categories = []) =>
  categories.map((category, index) => ({
    id: category.id || crypto.randomUUID(),
    name: String(category.name || '').trim(),
    colour: category.colour || '#2563eb',
    order: Number.isFinite(Number(category.order)) ? Number(category.order) : index,
    isActive: category.isActive !== false
  }));

const normalizeTiers = (tiers = []) =>
  tiers.map((tier, index) => ({
    id: tier.id || crypto.randomUUID(),
    label: String(tier.label || '').trim(),
    backgroundColour: tier.backgroundColour || defaultTiers[index]?.[1] || '#f8fafc',
    textColour: tier.textColour || defaultTiers[index]?.[2] || '#111827',
    order: Number.isFinite(Number(tier.order)) ? Number(tier.order) : index,
    isActive: tier.isActive !== false
  }));

const normalizeItems = (items = []) =>
  items.map((item, index) => ({
    id: item.id || crypto.randomUUID(),
    title: String(item.title || '').trim(),
    description: item.description || '',
    alt: item.alt || item.title || '',
    image: item.image || {},
    categoryIds: Array.isArray(item.categoryIds) ? item.categoryIds : [],
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : index
  }));

const normalizeGenrePayload = (payload) => {
  const normalized = { ...payload };

  if (payload.slug || payload.name) {
    normalized.slug = slugify(payload.slug || payload.name);
  }

  if (payload.topCategories) {
    normalized.topCategories = normalizeCategories(payload.topCategories);
  }

  if (payload.tiers) {
    normalized.tiers = normalizeTiers(payload.tiers);
  }

  if (payload.items) {
    normalized.items = normalizeItems(payload.items);
  }

  return normalized;
};

export const validatePublishableGenre = (genre) => {
  const errors = [];
  const activeCategories = (genre.topCategories || []).filter((category) => category.isActive);
  const activeTiers = (genre.tiers || []).filter((tier) => tier.isActive);
  const activeCategoryIds = new Set(activeCategories.map((category) => category.id));

  if (!genre.name?.trim()) errors.push({ field: 'name', message: 'Genre name is required' });
  if (!genre.heading?.trim()) errors.push({ field: 'heading', message: 'Main heading is required' });
  if (!genre.slug?.trim()) errors.push({ field: 'slug', message: 'Unique slug is required' });
  if (!genre.coverImage?.url) errors.push({ field: 'coverImage', message: 'Cover image is required' });
  if (activeCategories.length < 1) {
    errors.push({ field: 'topCategories', message: 'At least one enabled top category is required' });
  }
  if (activeTiers.length < 2) {
    errors.push({ field: 'tiers', message: 'At least two enabled ranking rows are required' });
  }
  activeTiers.forEach((tier, index) => {
    if (!tier.label?.trim()) {
      errors.push({ field: `tiers.${index}.label`, message: 'Every ranking row must have a label' });
    }
  });
  if ((genre.items || []).length < MIN_IMAGE_ITEMS) {
    errors.push({ field: 'items', message: 'At least one image item is required' });
  }
  (genre.items || []).forEach((item, index) => {
    if (!item.title?.trim()) errors.push({ field: `items.${index}.title`, message: 'Every image item needs a title' });
    if (!item.image?.url) errors.push({ field: `items.${index}.image`, message: 'Every image item needs a valid image URL' });
    if (!item.categoryIds?.length) {
      errors.push({ field: `items.${index}.categoryIds`, message: 'Every image item needs at least one category' });
    } else if (!item.categoryIds.some((id) => activeCategoryIds.has(id))) {
      errors.push({ field: `items.${index}.categoryIds`, message: 'Item must be assigned to an enabled category' });
    }
  });
  if (!['draft', 'published'].includes(genre.status)) {
    errors.push({ field: 'status', message: 'Genre status is invalid' });
  }

  return errors;
};

const ensureSlugIsAvailable = async (slug, currentId) => {
  const existing = await Genre.findOne({ slug });
  if (existing && existing._id.toString() !== String(currentId || '')) {
    throw new ApiError(409, 'Slug is already in use', [{ field: 'slug', message: 'Slug must be unique' }]);
  }
};

export const listPublicGenres = async (query) => {
  const filter = { status: 'published', isActive: true };
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { heading: new RegExp(query.search, 'i') },
      { description: new RegExp(query.search, 'i') }
    ];
  }

  return Genre.find(filter).sort({ updatedAt: -1 }).lean();
};

export const getPublicGenreBySlug = async (slug) => {
  const genre = await Genre.findOne({ slug, status: 'published', isActive: true }).lean();
  if (!genre) throw new ApiError(404, 'Genre does not exist, is unpublished, or is inactive');
  return genre;
};

export const getRelatedGenres = async (slug) => {
  const current = await getPublicGenreBySlug(slug);
  return Genre.find({
    _id: { $ne: current._id },
    status: 'published',
    isActive: true
  })
    .sort({ updatedAt: -1 })
    .limit(4)
    .lean();
};

export const listAdminGenres = async (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 50);
  const filter = {};

  if (query.status && query.status !== 'all') filter.status = query.status;
  if (query.isActive && query.isActive !== 'all') filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { slug: new RegExp(query.search, 'i') },
      { heading: new RegExp(query.search, 'i') }
    ];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    updated: { updatedAt: -1 },
    name: { name: 1 }
  };
  const sort = sortMap[query.sort] || sortMap.updated;

  const [genres, total] = await Promise.all([
    Genre.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Genre.countDocuments(filter)
  ]);

  return {
    genres,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const createGenre = async (payload, adminId) => {
  const normalized = normalizeGenrePayload(payload);
  if (!normalized.slug) normalized.slug = slugify(normalized.name);
  if (!normalized.slug) {
    throw new ApiError(422, 'Validation failed', [{ field: 'slug', message: 'Slug is required' }]);
  }
  await ensureSlugIsAvailable(normalized.slug);

  const genre = await Genre.create({
    ...normalized,
    createdBy: adminId,
    status: normalized.status || 'draft',
    topCategories: normalized.topCategories || [],
    tiers: normalized.tiers || normalizeTiers(defaultTiers.map(([label, backgroundColour, textColour], index) => ({
      label,
      backgroundColour,
      textColour,
      order: index
    }))),
    items: normalized.items || []
  });

  if (genre.status === 'published') {
    const errors = validatePublishableGenre(genre);
    if (errors.length) {
      await genre.deleteOne();
      throw new ApiError(422, 'Validation failed', errors);
    }
    genre.publishedAt = new Date();
    await genre.save();
  }

  return genre;
};

export const getAdminGenre = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Genre not found');
  const genre = await Genre.findById(id);
  if (!genre) throw new ApiError(404, 'Genre not found');
  return genre;
};

export const updateGenre = async (id, payload) => {
  const genre = await getAdminGenre(id);
  const normalized = normalizeGenrePayload(payload);

  if (normalized.slug) await ensureSlugIsAvailable(normalized.slug, genre._id);

  Object.assign(genre, normalized);
  genre.version += 1;

  if (genre.status === 'published' || normalized.status === 'published') {
    const errors = validatePublishableGenre(genre);
    if (errors.length) throw new ApiError(422, 'Validation failed', errors);
    if (!genre.publishedAt) genre.publishedAt = new Date();
  }

  await genre.save();
  return genre;
};

export const deleteGenre = async (id) => {
  const genre = await getAdminGenre(id);
  await genre.deleteOne();
  return true;
};

export const publishGenre = async (id) => {
  const genre = await getAdminGenre(id);
  const errors = validatePublishableGenre(genre);
  if (errors.length) throw new ApiError(422, 'Validation failed', errors);
  genre.status = 'published';
  genre.publishedAt = genre.publishedAt || new Date();
  genre.version += 1;
  await genre.save();
  return genre;
};

export const setGenreStatus = async (id, status) => {
  const genre = await getAdminGenre(id);
  genre.status = status;
  if (status === 'published') {
    const errors = validatePublishableGenre(genre);
    if (errors.length) throw new ApiError(422, 'Validation failed', errors);
    genre.publishedAt = genre.publishedAt || new Date();
  }
  genre.version += 1;
  await genre.save();
  return genre;
};

export const setGenreActive = async (id, isActive) => {
  const genre = await getAdminGenre(id);
  genre.isActive = isActive;
  genre.version += 1;
  await genre.save();
  return genre;
};

export const duplicateGenre = async (id, adminId) => {
  const genre = await getAdminGenre(id);
  const raw = genre.toObject();
  delete raw._id;
  delete raw.createdAt;
  delete raw.updatedAt;
  delete raw.publishedAt;

  const baseSlug = `${raw.slug}-copy`;
  let slug = baseSlug;
  let suffix = 2;
  while (await Genre.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const copy = await Genre.create({
    ...raw,
    name: `${raw.name} Copy`,
    slug,
    status: 'draft',
    isActive: false,
    version: 1,
    createdBy: adminId
  });

  return copy;
};

export const getDashboardStats = async () => {
  const [totalGenres, publishedGenres, draftGenres, activeGenres, inactiveGenres, recentCreated, recentEdited, drafts] =
    await Promise.all([
      Genre.countDocuments(),
      Genre.countDocuments({ status: 'published' }),
      Genre.countDocuments({ status: 'draft' }),
      Genre.countDocuments({ isActive: true }),
      Genre.countDocuments({ isActive: false }),
      Genre.find().sort({ createdAt: -1 }).limit(5).lean(),
      Genre.find().sort({ updatedAt: -1 }).limit(5).lean(),
      Genre.find({ status: 'draft' }).sort({ updatedAt: -1 }).limit(5).lean()
    ]);

  const totals = await Genre.aggregate([
    {
      $group: {
        _id: null,
        uploadedImages: { $sum: { $size: '$items' } },
        rankingRows: { $sum: { $size: '$tiers' } },
        topCategories: { $sum: { $size: '$topCategories' } }
      }
    }
  ]);

  return {
    totalGenres,
    publishedGenres,
    draftGenres,
    activeGenres,
    inactiveGenres,
    totalUploadedImages: totals[0]?.uploadedImages || 0,
    totalRankingRows: totals[0]?.rankingRows || 0,
    totalTopCategories: totals[0]?.topCategories || 0,
    recentlyCreated: recentCreated,
    recentlyEdited: recentEdited,
    draftsNeedingCompletion: drafts.filter((genre) => validatePublishableGenre(genre).length > 0)
  };
};

export const sortGenreForPublic = (genre) => ({
  ...genre,
  topCategories: ordered(genre.topCategories).filter((category) => category.isActive),
  tiers: ordered(genre.tiers).filter((tier) => tier.isActive),
  items: ordered(genre.items)
});
