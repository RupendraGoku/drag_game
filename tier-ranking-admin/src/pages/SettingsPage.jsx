export function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#111827]">Settings</h1>
        <p className="mt-1 text-sm text-[#64748b]">Deployment values used by this dashboard.</p>
      </div>
      <section className="surface p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-bold text-[#334155]">API base URL</dt>
            <dd className="mt-1 break-all rounded-md bg-[#f8fafc] p-3 text-sm text-[#64748b]">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}</dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-[#334155]">Public game URL</dt>
            <dd className="mt-1 break-all rounded-md bg-[#f8fafc] p-3 text-sm text-[#64748b]">{import.meta.env.VITE_PUBLIC_GAME_URL || 'http://localhost:5173'}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
