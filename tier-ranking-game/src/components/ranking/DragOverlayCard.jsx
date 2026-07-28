export function DragOverlayCard({ item }) {
  if (!item) return null;
  return (
    <article className="w-24 overflow-hidden rounded-lg border border-[#d8dee7] bg-white p-1 shadow-xl">
      <img className="aspect-square w-full rounded-md object-cover" src={item.image?.url || '/image-fallback.svg'} alt="" />
    </article>
  );
}
