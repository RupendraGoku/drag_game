import crypto from 'crypto';
import { connectDatabase } from '../config/database.js';
import { Admin } from '../models/Admin.js';
import { Genre } from '../models/Genre.js';

const makeId = () => crypto.randomUUID();

const tierRows = [
  ['God Tier', '#fef3c7', '#92400e'],
  ['Excellent', '#dcfce7', '#166534'],
  ['Good', '#dbeafe', '#1d4ed8'],
  ['Overrated', '#fee2e2', '#991b1b'],
  ['Worst', '#f1f5f9', '#334155']
].map(([label, backgroundColour, textColour], order) => ({
  id: makeId(),
  label,
  backgroundColour,
  textColour,
  order,
  isActive: true
}));

const categoryColour = (order) => ['#b45309', '#166534', '#0b5db8', '#991b1b', '#4c1d95', '#334155'][order % 6];

const createCategories = (names) =>
  names.map((name, order) => ({
    id: makeId(),
    name,
    colour: categoryColour(order),
    order,
    isActive: true
  }));

const createItems = (slug, titles, categories) =>
  titles.map((title, order) => ({
    id: makeId(),
    title,
    alt: `${title} portrait`,
    description: `${title} sample ranking item`,
    image: {
      url: `https://picsum.photos/seed/${slug}-${order + 1}/600/600`,
      publicId: '',
      width: 600,
      height: 600
    },
    categoryIds: [categories[order % categories.length].id, categories[(order + 1) % categories.length].id],
    order
  }));

const sampleGenres = () => {
  const bgmiCategories = createCategories(['Assaulter', 'Sniper', 'Rusher', 'Grenadier', 'Fragger', 'Camper']);
  const footballCategories = createCategories(['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Playmaker']);

  return [
    {
      name: 'BGMI Player Ranking',
      slug: 'bgmi-player-ranking',
      heading: 'Rank the Best BGMI Players',
      description: 'Build a clean tier list for popular competitive players.',
      coverImage: {
        url: 'https://picsum.photos/seed/bgmi-cover/1200/720',
        publicId: '',
        alt: 'BGMI player ranking cover',
        width: 1200,
        height: 720
      },
      showAllCategory: true,
      topCategories: bgmiCategories,
      tiers: tierRows.map((tier) => ({ ...tier, id: makeId() })),
      items: createItems(
        'bgmi',
        ['Jonathan', 'Sarang', 'Omega', 'Neyo', 'Akshat', 'Mavi', 'Scout', 'Zgod', 'NinjaJOD', 'Shadow', 'Aaru', 'ClutchGod'],
        bgmiCategories
      ),
      version: 1,
      status: 'published',
      isActive: true,
      publishedAt: new Date()
    },
    {
      name: 'Football Player Ranking',
      slug: 'football-player-ranking',
      heading: 'Rank the Best Football Players',
      description: 'Compare all-time football names in a fast tier-ranking board.',
      coverImage: {
        url: 'https://picsum.photos/seed/football-cover/1200/720',
        publicId: '',
        alt: 'Football player ranking cover',
        width: 1200,
        height: 720
      },
      showAllCategory: true,
      topCategories: footballCategories,
      tiers: tierRows.map((tier) => ({ ...tier, id: makeId() })),
      items: createItems(
        'football',
        ['Messi', 'Ronaldo', 'Pele', 'Maradona', 'Zidane', 'Cruyff', 'Ronaldinho', 'Mbappe', 'Haaland', 'Neymar', 'Modric', 'Iniesta'],
        footballCategories
      ),
      version: 1,
      status: 'published',
      isActive: true,
      publishedAt: new Date()
    }
  ];
};

const run = async () => {
  await connectDatabase();
  const admin = await Admin.findOne().sort({ createdAt: 1 });

  for (const genre of sampleGenres()) {
    const existing = await Genre.findOne({ slug: genre.slug });
    if (existing) {
      const existingNames = new Set(existing.topCategories.map((category) => category.name.toLowerCase()));
      const missingCategories = genre.topCategories.filter((category) => !existingNames.has(category.name.toLowerCase()));

      if (!missingCategories.length) {
        console.log(`Sample genre already current: ${genre.slug}`);
        continue;
      }

      for (const category of missingCategories) {
        const nextCategory = {
          ...category,
          id: makeId(),
          order: existing.topCategories.length
        };
        existing.topCategories.push(nextCategory);

        existing.items.forEach((item, index) => {
          if (index % existing.topCategories.length === nextCategory.order) {
            item.categoryIds = Array.from(new Set([...(item.categoryIds || []), nextCategory.id]));
          }
        });
      }

      existing.version += 1;
      existing.updatedAt = new Date();
      await existing.save();
      console.log(`Updated sample genre categories: ${genre.slug}`);
      continue;
    }

    await Genre.create({ ...genre, createdBy: admin?._id });
    console.log(`Created sample genre: ${genre.slug}`);
  }

  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
