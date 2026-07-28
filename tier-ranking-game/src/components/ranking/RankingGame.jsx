import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { DragOverlayCard } from './DragOverlayCard.jsx';
import { RankingBoard } from './RankingBoard.jsx';
import { RankingHeader } from './RankingHeader.jsx';
import { RankingToolbar } from './RankingToolbar.jsx';
import { UnrankedPool } from './UnrankedPool.jsx';
import { useRankingGame } from '../../hooks/useRankingGame.js';

export function RankingGame({ genre }) {
  const boardRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const game = useRankingGame(genre);

  if (!game.state) return null;

  const selectedCategory =
    game.state.selectedCategoryId === 'all' ? null : game.categories.find((category) => category.id === game.state.selectedCategoryId);

  const exportRanking = async () => {
    if (!boardRef.current) return;
    try {
      const dataUrl = await toPng(boardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `${genre.slug}-ranking.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Ranking exported');
    } catch (_error) {
      toast.error('Export failed');
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
      <DndContext
        sensors={game.sensors}
        collisionDetection={closestCenter}
        onDragStart={game.handleDragStart}
        onDragCancel={game.handleDragCancel}
        onDragEnd={game.handleDragEnd}
      >
        <div className="rounded-lg border border-[#d8dee7] bg-white p-2 shadow-sm sm:p-3">
          <div ref={boardRef} className="rounded-md bg-white p-1.5 sm:p-2.5" id="ranked-board-export">
            <RankingHeader genre={genre} ranked={game.totalRanked} total={game.totalItems} complete={game.isComplete} lastSavedAt={game.lastSavedAt} />
            <div className="mt-3">
              <RankingBoard
                tiers={game.tiers}
                state={game.state}
                itemsById={game.itemsById}
                categories={game.categories}
                selectedCategoryId={game.state.selectedCategoryId}
                onSelectCategory={game.setSelectedCategoryId}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <RankingToolbar
              onReset={() => setConfirmReset(true)}
              onShuffle={game.shuffleRemaining}
              onClearSaved={() => {
                game.clearSavedProgress();
                toast.success('Saved progress cleared');
              }}
              onExport={exportRanking}
              exportDisabled={!game.isComplete}
            />
            {game.restoredFromSave ? <p className="text-xs font-bold text-[#16a34a]">Saved progress restored</p> : null}
          </div>
          <UnrankedPool
            poolId={game.poolId}
            itemIds={game.filteredUnrankedItemIds}
            unfilteredCount={game.state.unrankedItemIds.length}
            selectedCategory={selectedCategory}
            onClearFilter={() => game.setSelectedCategoryId('all')}
            itemsById={game.itemsById}
            categories={game.categories}
          />
        </div>
        <DragOverlay>
          <DragOverlayCard item={game.activeItem} />
        </DragOverlay>
      </DndContext>
      <ConfirmDialog
        open={confirmReset}
        title="Start again?"
        message="This resets every image back to the unranked pool for this genre."
        confirmLabel="Reset Ranking"
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          game.resetRanking();
          setConfirmReset(false);
          toast.success('Ranking reset');
        }}
      />
    </section>
  );
}
