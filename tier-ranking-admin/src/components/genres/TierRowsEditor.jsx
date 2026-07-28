import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { RotateCcw, Plus } from 'lucide-react';
import { TierRowEditor } from './TierRowEditor.jsx';

const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

export const defaultTiers = [
  ['God Tier', '#fef3c7', '#92400e'],
  ['Excellent', '#dcfce7', '#166534'],
  ['Good', '#dbeafe', '#1d4ed8'],
  ['Overrated', '#fee2e2', '#991b1b'],
  ['Worst', '#f1f5f9', '#334155']
].map(([label, backgroundColour, textColour], order) => ({
  id: newId(),
  label,
  backgroundColour,
  textColour,
  order,
  isActive: true
}));

export function TierRowsEditor({ tiers, setTiers, serverErrors, markDirty }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const update = (next) => {
    setTiers(next.map((tier, order) => ({ ...tier, order })));
    markDirty();
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = tiers.findIndex((tier) => tier.id === active.id);
    const newIndex = tiers.findIndex((tier) => tier.id === over.id);
    update(arrayMove(tiers, oldIndex, newIndex));
  };

  const enabledCount = tiers.filter((tier) => tier.isActive !== false).length;

  return (
    <section className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#111827]">3. Left Ranking Rows</h2>
          <p className="mt-1 text-sm text-[#64748b]">The editable row labels and colours shown on the left of the board.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-secondary focus-ring"
            onClick={() =>
              update([
                ...tiers,
                {
                  id: newId(),
                  label: `Row ${tiers.length + 1}`,
                  backgroundColour: '#f8fafc',
                  textColour: '#111827',
                  order: tiers.length,
                  isActive: true
                }
              ])
            }
          >
            <Plus size={16} aria-hidden="true" />
            Add Row
          </button>
          <button type="button" className="btn btn-secondary focus-ring" onClick={() => update(defaultTiers.map((tier) => ({ ...tier, id: newId() })))}>
            <RotateCcw size={16} aria-hidden="true" />
            Restore Defaults
          </button>
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={tiers.map((tier) => tier.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <TierRowEditor
                key={tier.id}
                tier={tier}
                onChange={(next) => update(tiers.map((item, itemIndex) => (itemIndex === index ? next : item)))}
                onDelete={() => update(tiers.filter((item) => item.id !== tier.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {enabledCount < 2 ? <p className="mt-3 text-sm font-semibold text-[#dc2626]">At least two enabled rows are required.</p> : null}
      {serverErrors.tiers ? <p className="mt-3 text-sm font-semibold text-[#dc2626]">{serverErrors.tiers}</p> : null}
    </section>
  );
}
