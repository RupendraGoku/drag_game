export const genreId = (genre) => genre?.id || genre?._id;

export const progressKey = (id) => `tier-ranking-progress-${id}`;
const recentKey = 'tier-ranking-recent-genres';

export const loadProgress = (id) => {
  try {
    const raw = localStorage.getItem(progressKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const saveProgress = (id, progress) => {
  localStorage.setItem(progressKey(id), JSON.stringify({ ...progress, lastUpdated: new Date().toISOString() }));
};

export const clearProgress = (id) => localStorage.removeItem(progressKey(id));

export const loadRecentlyPlayed = () => {
  try {
    return JSON.parse(localStorage.getItem(recentKey) || '[]');
  } catch (_error) {
    return [];
  }
};

export const saveRecentlyPlayed = (genre) => {
  const id = genreId(genre);
  if (!id) return;
  const current = loadRecentlyPlayed().filter((item) => item.id !== id);
  const next = [
    {
      id,
      name: genre.name,
      slug: genre.slug,
      coverImage: genre.coverImage,
      playedAt: new Date().toISOString()
    },
    ...current
  ].slice(0, 6);
  localStorage.setItem(recentKey, JSON.stringify(next));
};
