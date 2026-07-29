import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';

const textFields = ['genreJson', 'genre', 'json'];
const fileFields = ['genreJson', 'genre', 'json'];

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const firstString = (...values) => {
  const match = values.find((value) => typeof value === 'string' && value.trim());
  return match ? match.trim() : '';
};

const finiteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const validHex = (value) => (typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value) ? value : undefined);

const isValidUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    new URL(value);
    return true;
  } catch (_error) {
    return false;
  }
};

const firstUploadedJsonFile = (req) => {
  if (req.file) return req.file;
  return fileFields.map((field) => req.files?.[field]?.[0]).find(Boolean);
};

const firstJsonTextField = (body = {}) => textFields.map((field) => body[field]).find((value) => typeof value === 'string' && value.trim());

const parseJson = (raw, field) => {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    throw new ApiError(422, 'Genre JSON file is invalid', [{ field, message: 'File must contain valid JSON' }]);
  }
};

const extractGenreObject = (parsed) => {
  let current = parsed;
  if (Array.isArray(current)) {
    if (current.length !== 1) {
      throw new ApiError(422, 'Genre JSON file must contain one genre object', [
        { field: 'genreJson', message: 'Use a single genre object or an array with one genre' }
      ]);
    }
    current = current[0];
  }

  for (let index = 0; index < 3; index += 1) {
    if (isObject(current?.genre)) current = current.genre;
    else if (isObject(current?.data)) current = current.data;
    else break;
  }

  if (!isObject(current)) {
    throw new ApiError(422, 'Genre JSON file must contain a genre object', [
      { field: 'genreJson', message: 'Expected a JSON object with genre fields' }
    ]);
  }

  return current;
};

const normalizeImageRef = (value, fallbackAlt = '') => {
  const rawUrl =
    typeof value === 'string'
      ? value
      : firstString(
          value?.url,
          value?.src,
          value?.href,
          value?.imageUrl,
          value?.image_url,
          value?.img,
          value?.photo,
          value?.poster,
          value?.thumbnail,
          value?.thumbnailUrl,
          value?.thumbnail_url
        );
  const url = isValidUrl(rawUrl) ? rawUrl.trim() : '';

  return {
    url,
    publicId: firstString(value?.publicId, value?.public_id),
    alt: firstString(value?.alt, fallbackAlt),
    width: finiteNumber(value?.width),
    height: finiteNumber(value?.height)
  };
};

const normalizeCategories = (value) => {
  const source = Array.isArray(value) ? value : [];
  return source
    .map((category, order) => {
      if (typeof category === 'string') {
        const name = category.trim();
        return name ? { id: crypto.randomUUID(), name, order, isActive: true } : null;
      }

      if (!isObject(category)) return null;
      const name = firstString(category.name, category.label, category.title);
      if (!name) return null;

      return {
        id: firstString(category.id) || crypto.randomUUID(),
        name,
        colour: validHex(category.colour || category.color),
        order: finiteNumber(category.order) ?? order,
        isActive: typeof category.isActive === 'boolean' ? category.isActive : true
      };
    })
    .filter(Boolean);
};

const normalizeTiers = (value) => {
  const source = Array.isArray(value) ? value : [];
  return source
    .map((tier, order) => {
      if (typeof tier === 'string') {
        const label = tier.trim();
        return label ? { id: crypto.randomUUID(), label, order, isActive: true } : null;
      }
      if (!isObject(tier)) return null;

      const label = firstString(tier.label, tier.name, tier.title);
      if (!label) return null;

      return {
        id: firstString(tier.id) || crypto.randomUUID(),
        label,
        backgroundColour: validHex(tier.backgroundColour || tier.backgroundColor || tier.colour || tier.color),
        textColour: validHex(tier.textColour || tier.textColor),
        order: finiteNumber(tier.order) ?? order,
        isActive: typeof tier.isActive === 'boolean' ? tier.isActive : true
      };
    })
    .filter(Boolean);
};

const normalizeCategoryIds = (item, categories, order) => {
  const byName = new Map(categories.map((category) => [category.name.toLowerCase(), category.id]));
  const directIds = [
    ...(Array.isArray(item.categoryIds) ? item.categoryIds : []),
    ...(typeof item.categoryId === 'string' ? [item.categoryId] : [])
  ].filter((value) => typeof value === 'string' && value.trim());

  const categoryNames = [
    ...(Array.isArray(item.categories) ? item.categories : []),
    ...(Array.isArray(item.categoryNames) ? item.categoryNames : []),
    item.category,
    item.column
  ].filter((value) => typeof value === 'string' && value.trim());

  const mappedIds = categoryNames.map((name) => byName.get(name.trim().toLowerCase())).filter(Boolean);
  if (directIds.length || mappedIds.length) return Array.from(new Set([...directIds, ...mappedIds]));
  return categories.length ? [categories[order % categories.length].id] : [];
};

const normalizeItems = (value, categories) => {
  const source = Array.isArray(value) ? value : [];
  return source.map((item, order) => {
    if (typeof item === 'string') {
      const title = item.trim() || `Item ${order + 1}`;
      return {
        id: crypto.randomUUID(),
        title,
        description: '',
        alt: title,
        image: {},
        categoryIds: categories.length ? [categories[order % categories.length].id] : [],
        order
      };
    }

    const sourceItem = isObject(item) ? item : {};
    const title = firstString(sourceItem.title, sourceItem.name, sourceItem.label, sourceItem.alt) || `Item ${order + 1}`;
    const imageSource =
      (typeof sourceItem.image === 'string' && sourceItem.image.trim()) || (isObject(sourceItem.image) && Object.keys(sourceItem.image).length)
        ? sourceItem.image
        : {
            url: firstString(
              sourceItem.imageUrl,
              sourceItem.image_url,
              sourceItem.img,
              sourceItem.photo,
              sourceItem.poster,
              sourceItem.thumbnail,
              sourceItem.thumbnailUrl,
              sourceItem.thumbnail_url,
              sourceItem.url,
              sourceItem.src
            )
          };
    const image = normalizeImageRef(imageSource, title);

    return {
      id: firstString(sourceItem.id) || crypto.randomUUID(),
      title,
      description: firstString(sourceItem.description, sourceItem.summary),
      alt: firstString(sourceItem.alt, title),
      image,
      categoryIds: normalizeCategoryIds(sourceItem, categories, order),
      order: finiteNumber(sourceItem.order) ?? order
    };
  });
};

const normalizeImportedGenre = (rawGenre, fallbackName) => {
  const name = firstString(rawGenre.name, rawGenre.genreName, rawGenre.title, rawGenre.heading, fallbackName, 'Imported Genre');
  const topCategories = normalizeCategories(rawGenre.topCategories || rawGenre.categories || rawGenre.columns);
  const tiers = normalizeTiers(rawGenre.tiers || rawGenre.tierRows || rawGenre.rows);
  const items = normalizeItems(rawGenre.items || rawGenre.imageItems || rawGenre.entries, topCategories);
  const coverSource =
    rawGenre.coverImage ||
    rawGenre.cover ||
    {
      url: firstString(rawGenre.coverUrl, rawGenre.cover_url, rawGenre.cover, rawGenre.imageUrl, rawGenre.image_url, rawGenre.poster)
    };
  const coverImage = normalizeImageRef(coverSource, name);

  return {
    name,
    slug: firstString(rawGenre.slug) || undefined,
    heading: firstString(rawGenre.heading, name),
    description: firstString(rawGenre.description, rawGenre.summary),
    coverImage,
    showAllCategory: typeof rawGenre.showAllCategory === 'boolean' ? rawGenre.showAllCategory : true,
    topCategories,
    tiers,
    items,
    status: 'draft',
    isActive: typeof rawGenre.isActive === 'boolean' ? rawGenre.isActive : true
  };
};

export const parseGenreJsonMiddleware = (req, _res, next) => {
  const file = firstUploadedJsonFile(req);
  const textField = file ? '' : firstJsonTextField(req.body);
  if (!file && !textField) return next();

  const field = file?.fieldname || textFields.find((key) => req.body?.[key] === textField) || 'genreJson';
  const raw = file ? file.buffer.toString('utf8') : textField;
  const fallbackName = file?.originalname?.replace(/\.json$/i, '').replace(/[-_]+/g, ' ');
  const parsed = parseJson(raw, field);
  req.body = normalizeImportedGenre(extractGenreObject(parsed), fallbackName);
  req.genreJsonImported = true;
  return next();
};
