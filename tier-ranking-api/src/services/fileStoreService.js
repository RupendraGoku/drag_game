import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/environment.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';
import { validatePublishableGenre } from './genreService.js';

const dataDir = path.join(process.cwd(), 'data');
const dataPath = path.join(dataDir, 'dev-store.json');
export const uploadDir = path.join(process.cwd(), 'uploads');

let store = null;

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

const defaultTiers = () =>
  [
    ['God Tier', '#fef3c7', '#92400e'],
    ['Excellent', '#dcfce7', '#166534'],
    ['Good', '#dbeafe', '#1d4ed8'],
    ['Overrated', '#fee2e2', '#991b1b'],
    ['Worst', '#f1f5f9', '#334155']
  ].map(([label, backgroundColour, textColour], order) => ({
    id: id(),
    label,
    backgroundColour,
    textColour,
    order,
    isActive: true
  }));

const categoryColour = (order) => ['#b45309', '#166534', '#0b5db8', '#991b1b', '#4c1d95', '#334155'][order % 6];

const categories = (names) =>
  names.map((name, order) => ({
    id: id(),
    name,
    colour: categoryColour(order),
    order,
    isActive: true
  }));

const items = (slug, titles, topCategories) =>
  titles.map((title, order) => ({
    id: id(),
    title,
    description: `${title} sample ranking item`,
    alt: `${title} image`,
    image: {
      url: `https://picsum.photos/seed/${slug}-${order + 1}/600/600`,
      publicId: '',
      width: 600,
      height: 600
    },
    categoryIds: [topCategories[order % topCategories.length].id, topCategories[(order + 1) % topCategories.length].id],
    order
  }));

const makeGenre = ({ name, slug, heading, description, categoryNames, itemTitles }) => {
  const topCategories = categories(categoryNames);
  return {
    _id: id(),
    name,
    slug,
    heading,
    description,
    coverImage: {
      url: `https://picsum.photos/seed/${slug}-cover/1200/720`,
      publicId: '',
      alt: `${name} cover`,
      width: 1200,
      height: 720
    },
    showAllCategory: true,
    topCategories,
    tiers: defaultTiers(),
    items: items(slug, itemTitles, topCategories),
    version: 1,
    status: 'published',
    isActive: true,
    createdBy: '',
    publishedAt: now(),
    createdAt: now(),
    updatedAt: now()
  };
};

const sampleGenres = () => [
  makeGenre({
    name: 'BGMI Player Ranking',
    slug: 'bgmi-player-ranking',
    heading: 'Rank the Best BGMI Players',
    description: 'Build a clean tier list for popular competitive players.',
    categoryNames: ['Assaulter', 'Sniper', 'Rusher', 'Grenadier', 'Fragger', 'Camper'],
    itemTitles: ['Jonathan', 'Sarang', 'Omega', 'Neyo', 'Akshat', 'Mavi', 'Scout', 'Zgod', 'NinjaJOD', 'Shadow', 'Aaru', 'ClutchGod']
  }),
  makeGenre({
    name: 'Football Player Ranking',
    slug: 'football-player-ranking',
    heading: 'Rank the Best Football Players',
    description: 'Compare all-time football names in a fast tier-ranking board.',
    categoryNames: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Playmaker'],
    itemTitles: ['Messi', 'Ronaldo', 'Pele', 'Maradona', 'Zidane', 'Cruyff', 'Ronaldinho', 'Mbappe', 'Haaland', 'Neymar', 'Modric', 'Iniesta']
  })
];

const serialize = (data) => JSON.stringify(data, null, 2);

const syncSampleGenreCategories = () => {
  for (const sample of sampleGenres()) {
    const existing = store.genres.find((genre) => genre.slug === sample.slug);
    if (!existing) continue;

    const existingNames = new Set((existing.topCategories || []).map((category) => category.name.toLowerCase()));
    const missingCategories = sample.topCategories.filter((category) => !existingNames.has(category.name.toLowerCase()));
    if (!missingCategories.length) continue;

    for (const category of missingCategories) {
      const nextCategory = {
        ...category,
        id: id(),
        order: existing.topCategories.length
      };
      existing.topCategories.push(nextCategory);

      existing.items.forEach((item, index) => {
        if (index % existing.topCategories.length === nextCategory.order) {
          item.categoryIds = Array.from(new Set([...(item.categoryIds || []), nextCategory.id]));
        }
      });
    }

    existing.version = (existing.version || 1) + 1;
    existing.updatedAt = now();
  }
};

export const saveFileStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataPath, serialize(store), 'utf8');
};

export const initFileStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadDir, { recursive: true });

  try {
    store = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  } catch (_error) {
    store = { admins: [], refreshTokens: [], genres: sampleGenres() };
  }

  syncSampleGenreCategories();

  for (const seedAdmin of env.seedAdmins) {
    const email = seedAdmin.email?.toLowerCase();
    if (!email || !seedAdmin.password) continue;

    const existing = store.admins.find((admin) => admin.email === email);
    if (existing) continue;

    store.admins.push({
      _id: id(),
      name: seedAdmin.name || email,
      email,
      passwordHash: await bcrypt.hash(seedAdmin.password, 12),
      role: seedAdmin.role || 'admin',
      isActive: true,
      createdAt: now(),
      updatedAt: now()
    });
  }

  await saveFileStore();
  return store;
};

export const getFileStore = () => {
  if (!store) throw new ApiError(500, 'File store is not initialized');
  return store;
};

export const publicGenres = () =>
  getFileStore().genres.filter((genre) => genre.status === 'published' && genre.isActive);

export const cardPayload = (genre) => ({
  id: genre._id,
  name: genre.name,
  slug: genre.slug,
  heading: genre.heading,
  description: genre.description,
  coverImage: genre.coverImage,
  itemCount: genre.items?.length || 0,
  tierCount: genre.tiers?.filter((tier) => tier.isActive).length || 0,
  categories: genre.topCategories?.filter((category) => category.isActive) || [],
  updatedAt: genre.updatedAt
});

export const normalizeGenre = (payload, existing = {}) => {
  const normalized = {
    ...existing,
    ...payload,
    slug: slugify(payload.slug || payload.name || existing.slug),
    topCategories: (payload.topCategories || existing.topCategories || []).map((category, order) => ({
      id: category.id || id(),
      name: category.name,
      colour: category.colour || '#2563eb',
      order,
      isActive: category.isActive !== false
    })),
    tiers: (payload.tiers || existing.tiers || defaultTiers()).map((tier, order) => ({
      id: tier.id || id(),
      label: tier.label,
      backgroundColour: tier.backgroundColour || '#f8fafc',
      textColour: tier.textColour || '#111827',
      order,
      isActive: tier.isActive !== false
    })),
    items: (payload.items || existing.items || []).map((item, order) => ({
      id: item.id || id(),
      title: item.title,
      description: item.description || '',
      alt: item.alt || item.title,
      image: item.image || {},
      categoryIds: item.categoryIds || [],
      order
    })),
    showAllCategory: payload.showAllCategory ?? existing.showAllCategory ?? true,
    status: payload.status || existing.status || 'draft',
    isActive: payload.isActive ?? existing.isActive ?? true
  };

  return normalized;
};

export const ensureFileSlugAvailable = (slug, currentId) => {
  const exists = getFileStore().genres.find((genre) => genre.slug === slug && genre._id !== currentId);
  if (exists) throw new ApiError(409, 'Slug is already in use', [{ field: 'slug', message: 'Slug must be unique' }]);
};

export const findFileGenre = (idOrSlug, publicOnly = false) => {
  const source = publicOnly ? publicGenres() : getFileStore().genres;
  const genre = source.find((entry) => entry._id === idOrSlug || entry.slug === idOrSlug);
  if (!genre) throw new ApiError(404, publicOnly ? 'Genre does not exist, is unpublished, or is inactive' : 'Genre not found');
  return genre;
};

export const validateFilePublish = (genre) => {
  const errors = validatePublishableGenre(genre);
  if (errors.length) throw new ApiError(422, 'Validation failed', errors);
};

export const createFileGenre = async (payload, adminId) => {
  const storeData = getFileStore();
  const genre = normalizeGenre(payload);
  genre._id = id();
  genre.createdBy = adminId;
  genre.version = 1;
  genre.createdAt = now();
  genre.updatedAt = now();
  ensureFileSlugAvailable(genre.slug);
  if (genre.status === 'published') {
    validateFilePublish(genre);
    genre.publishedAt = now();
  }
  storeData.genres.push(genre);
  await saveFileStore();
  return genre;
};

export const updateFileGenre = async (genreId, payload) => {
  const genre = findFileGenre(genreId);
  const normalized = normalizeGenre(payload, genre);
  ensureFileSlugAvailable(normalized.slug, genre._id);
  Object.assign(genre, normalized, { version: (genre.version || 1) + 1, updatedAt: now() });
  if (genre.status === 'published') {
    validateFilePublish(genre);
    genre.publishedAt = genre.publishedAt || now();
  }
  await saveFileStore();
  return genre;
};

export const removeFileGenre = async (genreId) => {
  const storeData = getFileStore();
  const index = storeData.genres.findIndex((genre) => genre._id === genreId);
  if (index === -1) throw new ApiError(404, 'Genre not found');
  storeData.genres.splice(index, 1);
  await saveFileStore();
};
