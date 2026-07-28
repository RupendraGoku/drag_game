export function CompletionMessage({ complete }) {
  if (!complete) return null;
  return (
    <div className="rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-xs font-black text-[#166534]" role="status">
      Ranking Complete
    </div>
  );
}
