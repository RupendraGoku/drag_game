export function GenreStatusBadge({ status, active }) {
  const statusClasses =
    status === 'published' ? 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' : 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]';
  const activeClasses = active ? 'bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]' : 'bg-[#f1f5f9] text-[#475569] border-[#d8dee7]';

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`rounded-full border px-2 py-1 text-xs font-bold capitalize ${statusClasses}`}>{status}</span>
      <span className={`rounded-full border px-2 py-1 text-xs font-bold ${activeClasses}`}>{active ? 'Active' : 'Inactive'}</span>
    </div>
  );
}
