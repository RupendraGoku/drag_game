import { Fragment } from 'react';
import { getCategoryCellId } from '../../utils/dragHelpers.js';
import { TierDropZone } from './TierDropZone.jsx';
import { TierLabel } from './TierLabel.jsx';

const minColumnWidth = 108;

const tint = (colour = '#111827') => (/^#[0-9a-f]{6}$/i.test(colour) ? `${colour}18` : '#f8fafc');

export function RankingBoard({ tiers, state, itemsById, categories, selectedCategoryId, onSelectCategory }) {
  const columnTemplate = `92px repeat(${Math.max(categories.length, 1)}, minmax(${minColumnWidth}px, 1fr))`;
  const minWidth = 92 + categories.length * minColumnWidth;
  const selectCategory = (categoryId) => onSelectCategory(selectedCategoryId === categoryId ? 'all' : categoryId);

  return (
    <section className="overflow-x-auto rounded-lg border border-[#d8dee7]" aria-label="Tier ranking board">
      <div className="grid bg-white" style={{ gridTemplateColumns: columnTemplate, minWidth }}>
        <div className="border-b border-r border-[#d8dee7] bg-white" aria-hidden="true" />
        {categories.map((category, categoryIndex) => {
          const isActive = selectedCategoryId === category.id;
          const isLastColumn = categoryIndex === categories.length - 1;
          const colour = category.colour || '#111827';

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${isActive ? 'Clear' : 'Filter'} ${category.name} column`}
              className={`focus-ring flex min-h-[72px] items-center justify-center border-b border-[#d8dee7] px-2 text-center text-sm font-black lowercase leading-tight transition hover:brightness-[0.98] sm:min-h-[88px] sm:text-lg ${
                isLastColumn ? '' : 'border-r'
              }`}
              style={{
                background: tint(colour),
                color: colour,
                boxShadow: isActive ? 'inset 0 0 0 2px #111827' : undefined
              }}
              onClick={() => selectCategory(category.id)}
            >
              <span className="break-words">{category.name}</span>
            </button>
          );
        })}
        {tiers.map((tier, tierIndex) => {
          const isLastRow = tierIndex === tiers.length - 1;

          return (
            <Fragment key={tier.id}>
              <TierLabel tier={tier} className={`border-r border-[#d8dee7] ${isLastRow ? '' : 'border-b'}`} />
              {categories.map((category, categoryIndex) => {
                const dropZoneId = getCategoryCellId(tier.id, category.id);
                const isLastColumn = categoryIndex === categories.length - 1;

                return (
                  <TierDropZone
                    key={dropZoneId}
                    dropZoneId={dropZoneId}
                    tier={tier}
                    category={category}
                    itemIds={state.tierItems[dropZoneId] || []}
                    itemsById={itemsById}
                    className={`${isLastRow ? '' : 'border-b border-[#d8dee7]'} ${isLastColumn ? '' : 'border-r border-[#d8dee7]'}`}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
