import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-10 text-center sm:px-6">
      <section className="surface p-8">
        <p className="text-sm font-black uppercase text-[#2563eb]">404</p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">Page not found</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#64748b]">The page you opened does not exist or is no longer available.</p>
        <Link className="btn btn-primary focus-ring mt-6" to="/">
          Go Home
        </Link>
      </section>
    </div>
  );
}
