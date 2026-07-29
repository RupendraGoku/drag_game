import { arrayMove } from '@dnd-kit/sortable';
import { getCategoryCellId, getGenreId, POOL_ID } from './dragHelpers.js';

export const ordered = (items = []) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const activeTiers = (genre) => ordered(genre.tiers || []).filter((tier) => tier.isActive !== false);

export const activeCategories = (genre) => ordered(genre.topCategories || []).filter((category) => category.isActive !== false);

export const itemMap = (genre) => new Map(ordered(genre.items || []).map((item) => [item.id, item]));

export const createEmptyTierItems = (tiers, categories = []) =>
  tiers.reduce((acc, tier) => {
    if (!categories.length) {
      acc[tier.id] = [];
      return acc;
    }

    categories.forEach((category) => {
      acc[getCategoryCellId(tier.id, category.id)] = [];
    });
    return acc;
  }, {});

const allStateItemIds = (state) => [...state.unrankedItemIds, ...Object.values(state.tierItems || {}).flat()];

export const isCompatibleProgress = (saved, genre) => {
  if (!saved || saved.genreId !== getGenreId(genre) || saved.genreVersion !== genre.version) return false;
  const currentItemIds = ordered(genre.items || []).map((item) => item.id);
  const currentTierIds = activeTiers(genre).map((tier) => tier.id);
  const currentCategoryIds = activeCategories(genre).map((category) => category.id);
  const currentContainerIds = currentCategoryIds.length
    ? currentTierIds.flatMap((tierId) => currentCategoryIds.map((categoryId) => getCategoryCellId(tierId, categoryId)))
    : currentTierIds;
  const savedIds = allStateItemIds(saved);
  const uniqueSavedIds = new Set(savedIds);

  return (
    currentItemIds.length > 0 &&
    savedIds.length === currentItemIds.length &&
    uniqueSavedIds.size === currentItemIds.length &&
    currentItemIds.every((id) => uniqueSavedIds.has(id)) &&
    currentContainerIds.every((id) => Object.prototype.hasOwnProperty.call(saved.tierItems || {}, id))
  );
};

export const buildInitialGameState = (genre, savedProgress) => {
  if (isCompatibleProgress(savedProgress, genre)) {
    return {
      ...savedProgress,
      selectedCategoryId: savedProgress.selectedCategoryId || 'all'
    };
  }

  const tiers = activeTiers(genre);
  const categories = activeCategories(genre);
  return {
    genreId: getGenreId(genre),
    genreVersion: genre.version,
    selectedCategoryId: 'all',
    unrankedItemIds: ordered(genre.items || []).map((item) => item.id),
    tierItems: createEmptyTierItems(tiers, categories),
    lastUpdated: new Date().toISOString()
  };
};

const withoutItem = (ids, activeId) => ids.filter((id) => id !== activeId);

const insertItem = (ids, activeId, overId) => {
  if (!overId || overId === POOL_ID || ids.includes(overId) === false) return [...ids, activeId];
  const index = ids.indexOf(overId);
  return [...ids.slice(0, index), activeId, ...ids.slice(index)];
};

export const moveItem = (state, activeId, fromContainer, toContainer, overId) => {
  if (!fromContainer || !toContainer) return state;

  if (fromContainer === toContainer) {
    const items = fromContainer === POOL_ID ? state.unrankedItemIds : state.tierItems[fromContainer] || [];
    const oldIndex = items.indexOf(activeId);
    const newIndex = items.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return state;
    const nextItems = arrayMove(items, oldIndex, newIndex);
    if (fromContainer === POOL_ID) return { ...state, unrankedItemIds: nextItems };
    return { ...state, tierItems: { ...state.tierItems, [fromContainer]: nextItems } };
  }

  const sourceItems = fromContainer === POOL_ID ? state.unrankedItemIds : state.tierItems[fromContainer] || [];
  const destinationItems = toContainer === POOL_ID ? state.unrankedItemIds : state.tierItems[toContainer] || [];
  const cleanedSource = withoutItem(sourceItems, activeId);
  const cleanedDestination = withoutItem(destinationItems, activeId);
  const nextDestination = insertItem(cleanedDestination, activeId, overId);

  const nextState = {
    ...state,
    unrankedItemIds: state.unrankedItemIds,
    tierItems: { ...state.tierItems }
  };

  if (fromContainer === POOL_ID) nextState.unrankedItemIds = cleanedSource;
  else nextState.tierItems[fromContainer] = cleanedSource;

  if (toContainer === POOL_ID) nextState.unrankedItemIds = nextDestination;
  else nextState.tierItems[toContainer] = nextDestination;

  return nextState;
};

export const filterUnrankedByCategory = (state, itemsById) => {
  if (!state || state.selectedCategoryId === 'all') return state?.unrankedItemIds || [];
  return state.unrankedItemIds.filter((id) => itemsById.get(id)?.categoryIds?.includes(state.selectedCategoryId));
};

export const rankedCount = (state) => Object.values(state?.tierItems || {}).reduce((total, ids) => total + ids.length, 0);

export const shuffle = (ids) => {
  const next = [...ids];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};
