export function EmptyState({ title, message, action }) {
  return (
    <div className="surface px-6 py-10 text-center">
      <h2 className="text-lg font-bold text-[#111827]">{title}</h2>
      {message ? <p className="mx-auto mt-2 max-w-xl text-sm text-[#64748b]">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
