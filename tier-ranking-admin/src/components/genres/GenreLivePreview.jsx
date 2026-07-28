import { Fragment } from 'react';
import { REQUIRED_IMAGE_ITEMS } from '../../config/rankingConfig.js';

export function GenreLivePreview({ genre, viewport = 'desktop' }) {
  const widthClass = {
    desktop: 'max-w-5xl',
    tablet: 'max-w-3xl',
    mobile: 'max-w-sm'
  }[viewport];

  const categories = (genre.topCategories || []).filter((category) => category.isActive !== false);
  const tiers = (genre.tiers || []).filter((tier) => tier.isActive !== false);
  const items = genre.items || [];
  const columnTemplate = `110px repeat(${Math.max(categories.length, 1)}, minmax(88px, 1fr))`;
  const minWidth = 110 + categories.length * 88;
  const tint = (colour = '#111827') => (/^#[0-9a-f]{6}$/i.test(colour) ? `${colour}18` : '#f8fafc');

  return (
    <section className="surface p-5">
      <div className="mb-5">
        <h2 className="text-lg font-black text-[#111827]">5. Live Preview</h2>
        <p className="mt-1 text-sm text-[#64748b]">A protected preview matching the public board layout.</p>
      </div>
      <div className={`mx-auto rounded-lg border border-[#d8dee7] bg-[#f6f7f9] p-3 ${widthClass}`}>
        <div className="rounded-lg border border-[#d8dee7] bg-white p-4">
          <h3 className="text-xl font-black text-[#111827]">{genre.heading || 'Rank the Best Items'}</h3>
          {genre.description ? <p className="mt-1 text-sm text-[#64748b]">{genre.description}</p> : null}
          <div className="mt-4 overflow-x-auto rounded-lg border border-[#d8dee7]">
            <div className="grid bg-white" style={{ gridTemplateColumns: columnTemplate, minWidth }}>
              <div className="border-b border-r border-[#d8dee7]" aria-hidden="true" />
              {categories.map((category, categoryIndex) => {
                const isLastColumn = categoryIndex === categories.length - 1;
                const colour = category.colour || '#111827';

                return (
                  <div
                    key={category.id}
                    className={`grid min-h-16 place-items-center border-b border-[#d8dee7] px-2 text-center text-xs font-black lowercase leading-tight ${isLastColumn ? '' : 'border-r border-[#d8dee7]'}`}
                    style={{ background: tint(colour), color: colour }}
                  >
                    <span className="break-words">{category.name}</span>
                  </div>
                );
              })}
              {tiers.map((tier, tierIndex) => {
                const isLastRow = tierIndex === tiers.length - 1;

                return (
                  <Fragment key={tier.id}>
                    <div className={`flex min-h-20 items-center justify-center border-r border-[#d8dee7] px-3 text-center text-sm font-black ${isLastRow ? '' : 'border-b'}`} style={{ background: tier.backgroundColour, color: tier.textColour }}>
                      {tier.label}
                    </div>
                    {categories.map((category, categoryIndex) => {
                      const isLastColumn = categoryIndex === categories.length - 1;

                      return (
                        <div key={`${tier.id}-${category.id}`} className={`grid min-h-20 place-items-center bg-white p-2 ${isLastRow ? '' : 'border-b border-[#d8dee7]'} ${isLastColumn ? '' : 'border-r border-[#d8dee7]'}`}>
                          <span className="text-xs font-bold text-[#94a3b8]">Drop</span>
                        </div>
                      );
                    })}
                  </Fragment>
                );
              })}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.slice(0, REQUIRED_IMAGE_ITEMS).map((item) => (
              <div key={item.id} className="rounded-lg border border-[#d8dee7] bg-white p-2 shadow-sm">
                <img className="aspect-square w-full rounded-md object-cover" src={item.image?.url} alt={item.alt || item.title} />
                <p className="mt-2 truncate text-xs font-bold text-[#111827]">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
