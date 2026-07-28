import { KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { create } from 'zustand';
import { clearProgress, loadProgress, saveProgress, saveRecentlyPlayed } from '../utils/storageHelpers.js';
import { findContainer, getCategoryCellId, getGenreId, POOL_ID } from '../utils/dragHelpers.js';
import {
  activeCategories,
  activeTiers,
  buildInitialGameState,
  filterUnrankedByCategory,
  itemMap,
  moveItem,
  rankedCount,
  shuffle
} from '../utils/rankingHelpers.js';
import { useEffect, useMemo, useRef, useState } from 'react';

const useRankingStore = create((set) => ({
  state: null,
  activeId: null,
  setState: (state) => set({ state }),
  patchState: (updater) => set((current) => ({ state: updater(current.state) })),
  setActiveId: (activeId) => set({ activeId })
}));

export const useRankingGame = (genre) => {
  const { state, setState, patchState, activeId, setActiveId } = useRankingStore();
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [restoredFromSave, setRestoredFromSave] = useState(false);
  const didInit = useRef(false);

  const tiers = useMemo(() => activeTiers(genre), [genre]);
  const categories = useMemo(() => activeCategories(genre), [genre]);
  const itemsById = useMemo(() => itemMap(genre), [genre]);
  const dropZoneIds = useMemo(
    () => tiers.flatMap((tier) => categories.map((category) => getCategoryCellId(tier.id, category.id))),
    [tiers, categories]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const id = getGenreId(genre);
    const saved = loadProgress(id);
    const initial = buildInitialGameState(genre, saved);
    didInit.current = false;
    setState(initial);
    setRestoredFromSave(saved && saved.genreVersion === genre.version);
    saveRecentlyPlayed(genre);
  }, [genre, setState]);

  useEffect(() => {
    if (!state) return;
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    saveProgress(state.genreId, state);
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [state]);

  const filteredUnrankedItemIds = useMemo(() => filterUnrankedByCategory(state, itemsById), [state, itemsById]);
  const totalRanked = rankedCount(state);
  const totalItems = itemsById.size;
  const isComplete = totalItems > 0 && totalRanked === totalItems;
  const activeItem = activeId ? itemsById.get(activeId) : null;

  const setSelectedCategoryId = (categoryId) => {
    patchState((current) => ({ ...current, selectedCategoryId: categoryId }));
  };

  const resetRanking = () => {
    clearProgress(getGenreId(genre));
    setState(buildInitialGameState(genre, null));
    setLastSavedAt('');
  };

  const clearSavedProgress = () => {
    clearProgress(getGenreId(genre));
    setLastSavedAt('');
  };

  const shuffleRemaining = () => {
    patchState((current) => ({ ...current, unrankedItemIds: shuffle(current.unrankedItemIds) }));
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragCancel = () => setActiveId(null);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !state) return;

    const fromContainer = findContainer(state, dropZoneIds, active.id);
    const toContainer = findContainer(state, dropZoneIds, over.id);
    if (!fromContainer || !toContainer) return;

    patchState((current) => moveItem(current, active.id, fromContainer, toContainer, over.id));
  };

  return {
    sensors,
    state,
    tiers,
    categories,
    itemsById,
    filteredUnrankedItemIds,
    totalRanked,
    totalItems,
    isComplete,
    activeItem,
    lastSavedAt,
    restoredFromSave,
    poolId: POOL_ID,
    setSelectedCategoryId,
    resetRanking,
    clearSavedProgress,
    shuffleRemaining,
    handleDragStart,
    handleDragCancel,
    handleDragEnd
  };
};
