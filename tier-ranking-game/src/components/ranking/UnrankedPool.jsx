import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { DraggableImageCard } from './DraggableImageCard.jsx';

export function UnrankedPool({ poolId, itemIds, unfilteredCount, selectedCategory, onClearFilter, itemsById, categories }) {
  const { setNodeRef, isOver } = useDroppable({ id: poolId });

  return (
    <section className="mt-3 rounded-lg border border-[#d8dee7] bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-[#111827]">Unranked Image Pool</h2>
          <p className="mt-0.5 text-xs text-[#64748b]">
            {unfilteredCount} remaining
            {selectedCategory ? ` in ${selectedCategory.name}` : ''}
          </p>
        </div>
        {selectedCategory ? (
          <button className="btn btn-secondary focus-ring" type="button" onClick={onClearFilter}>
            Clear Filter
          </button>
        ) : null}
      </div>
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div ref={setNodeRef} className={`min-h-32 rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-2 ${isOver ? 'ring-2 ring-[#2563eb]' : ''}`}>
          {itemIds.length ? (
            <div className="card-grid grid gap-2">
              {itemIds.map((id) => {
                const item = itemsById.get(id);
                return item ? <DraggableImageCard key={id} item={item} /> : null;
              })}
            </div>
          ) : (
            <div className="grid min-h-24 place-items-center text-center text-xs font-bold text-[#94a3b8]">
              {selectedCategory ? 'No remaining images match this category.' : 'All images have been ranked.'}
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
