import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { DraggableImageCard } from './DraggableImageCard.jsx';

export function TierDropZone({ dropZoneId, tier, category, itemIds, itemsById, className = '' }) {
  const { setNodeRef, isOver } = useDroppable({ id: dropZoneId });

  return (
    <SortableContext items={itemIds} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`min-h-[92px] min-w-0 bg-white p-1.5 sm:min-h-[118px] sm:p-2 ${className} ${
          isOver ? 'bg-[#eff6ff] ring-2 ring-inset ring-[#2563eb]' : ''
        }`}
        aria-label={`${tier.label} ${category.name} ranking column`}
      >
        {itemIds.length ? (
          <div className="flex flex-wrap gap-1.5">
            {itemIds.map((id) => {
              const item = itemsById.get(id);
              return item ? <DraggableImageCard key={id} item={item} compact /> : null;
            })}
          </div>
        ) : (
          <div className="grid h-full min-h-[76px] place-items-center rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] text-[11px] font-bold text-[#94a3b8] sm:min-h-[100px]">
            Drop
          </div>
        )}
      </div>
    </SortableContext>
  );
}
