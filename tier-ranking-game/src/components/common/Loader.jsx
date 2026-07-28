export function Loader({ label = 'Loading' }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="flex items-center gap-3 rounded-lg border border-[#d8dee7] bg-white px-4 py-3 text-sm font-bold text-[#334155] shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d8dee7] border-t-[#2563eb]" />
        {label}
      </div>
    </div>
  );
}
