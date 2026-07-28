export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="surface px-6 py-10 text-center">
      <h1 className="text-xl font-black text-[#111827]">{title}</h1>
      {message ? <p className="mx-auto mt-2 max-w-xl text-sm text-[#64748b]">{message}</p> : null}
      {onRetry ? (
        <button className="btn btn-primary focus-ring mt-5" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
