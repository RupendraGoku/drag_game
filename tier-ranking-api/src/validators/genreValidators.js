import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');
const colour = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Use a valid hex colour').optional().or(z.literal(''));

const imageRef = z
  .object({
    url: z.string().url().optional().or(z.literal('')),
    publicId: z.string().optional().or(z.literal('')),
    alt: z.string().optional().or(z.literal('')),
    width: z.number().optional(),
    height: z.number().optional()
  })
  .partial()
  .optional();

const topCategory = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(60),
  colour,
  order: z.number().optional(),
  isActive: z.boolean().optional()
});

const tier = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(60),
  backgroundColour: colour,
  textColour: colour,
  order: z.number().optional(),
  isActive: z.boolean().optional()
});

const imageItem = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(100),
  description: z.string().max(300).optional().or(z.literal('')),
  alt: z.string().max(160).optional().or(z.literal('')),
  image: imageRef,
  categoryIds: z.array(z.string()).optional(),
  order: z.number().optional()
});

const genrePayload = z.object({
  name: z.string().min(2).max(120).optional(),
  slug: slug.optional(),
  heading: z.string().max(160).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  coverImage: imageRef,
  showAllCategory: z.boolean().optional(),
  topCategories: z.array(topCategory).optional(),
  tiers: z.array(tier).optional(),
  items: z.array(imageItem).optional(),
  status: z.enum(['draft', 'published']).optional(),
  isActive: z.boolean().optional()
});

export const listGenresSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['all', 'draft', 'published']).optional(),
    isActive: z.enum(['all', 'true', 'false']).optional(),
    sort: z.enum(['newest', 'updated', 'name']).optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});

export const publicGenresSchema = z.object({
  query: z.object({
    search: z.string().optional()
  })
});

export const slugParamSchema = z.object({
  params: z.object({ slug })
});

export const idParamSchema = z.object({
  params: z.object({ id: objectId })
});

export const createGenreSchema = z.object({
  body: genrePayload.extend({
    name: z.string().min(2).max(120)
  })
});

export const updateGenreSchema = z.object({
  params: z.object({ id: objectId }),
  body: genrePayload
});

export const deleteImageSchema = z.object({
  body: z.object({
    publicId: z.string().min(1)
  })
});
