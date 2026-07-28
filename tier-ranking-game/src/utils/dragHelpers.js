export const POOL_ID = 'unranked-pool';

export const getItemId = (item) => item?.id;

export const getGenreId = (genre) => genre?.id || genre?._id;

export const getCategoryCellId = (tierId, categoryId) => `tier:${tierId}:category:${categoryId}`;

export const findContainer = (state, containerIds, id) => {
  if (!id) return null;
  if (id === POOL_ID || containerIds.includes(id)) return id;
  if (state.unrankedItemIds.includes(id)) return POOL_ID;
  return containerIds.find((containerId) => state.tierItems[containerId]?.includes(id)) || null;
};

export const getContainerItems = (state, containerId) =>
  containerId === POOL_ID ? state.unrankedItemIds : state.tierItems[containerId] || [];
