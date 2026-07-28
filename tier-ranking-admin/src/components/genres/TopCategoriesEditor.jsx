import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { TopCategoryEditorRow } from './TopCategoryEditorRow.jsx';

const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const tint = (colour = '#111827') => (/^#[0-9a-f]{6}$/i.test(colour) ? `${colour}18` : '#f8fafc');

export function TopCategoriesEditor({ categories, setCategories, serverErrors, markDirty }) {
  const activeCategories = categories.filter((category) => category.isActive !== false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const update = (next) => {
    setCategories(next.map((category, order) => ({ ...category, order })));
    markDirty();
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((category) => category.id === active.id);
    const newIndex = categories.findIndex((category) => category.id === over.id);
    update(arrayMove(categories, oldIndex, newIndex));
  };

  const addCategory = () => {
    update([
      ...categories,
      {
        id: newId(),
        name: `Category ${categories.length + 1}`,
        colour: '#2563eb',
        order: categories.length,
        isActive: true
      }
    ]);
  };

  const duplicateNames = categories
    .map((category) => category.name.trim().toLowerCase())
    .filter((name, index, all) => name && all.indexOf(name) !== index);

  return (
    <section className="surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#111827]">2. Ranking Columns</h2>
          <p className="mt-1 text-sm text-[#64748b]">These labels appear across the top of the ranking board.</p>
        </div>
        <button type="button" className="btn btn-secondary focus-ring" onClick={addCategory}>
          <Plus size={16} aria-hidden="true" />
          Add Category
        </button>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={categories.map((category) => category.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <TopCategoryEditorRow
                key={category.id}
                category={category}
                onChange={(next) => update(categories.map((item, itemIndex) => (itemIndex === index ? next : item)))}
                onDelete={() => update(categories.filter((item) => item.id !== category.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {duplicateNames.length ? <p className="mt-3 text-sm font-semibold text-[#dc2626]">Category names must be unique.</p> : null}
      {serverErrors.topCategories ? <p className="mt-3 text-sm font-semibold text-[#dc2626]">{serverErrors.topCategories}</p> : null}
      <div className="mt-5 overflow-x-auto rounded-lg border border-[#d8dee7] bg-[#f8fafc] p-3">
        <div className="grid min-w-max overflow-hidden rounded-lg border border-[#d8dee7] bg-white" style={{ gridTemplateColumns: `repeat(${Math.max(activeCategories.length, 1)}, minmax(104px, 1fr))` }}>
          {activeCategories.map((category) => (
            <span key={category.id} className="grid h-14 place-items-center border-r border-[#d8dee7] px-3 text-center text-sm font-black lowercase last:border-r-0" style={{ background: tint(category.colour), color: category.colour }}>
              {category.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
