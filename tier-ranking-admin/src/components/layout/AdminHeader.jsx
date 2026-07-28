import { LogOut, Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export function AdminHeader() {
  const { admin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-[#d8dee7] bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="focus-ring rounded-md p-2 text-[#334155] hover:bg-[#f1f5f9] lg:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase text-[#64748b]">Control panel</p>
            <p className="text-sm font-bold text-[#111827]">{admin?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link className="btn btn-primary focus-ring hidden sm:inline-flex" to="/genres/create">
            <Plus size={16} aria-hidden="true" />
            Create Genre
          </Link>
          <button className="btn btn-secondary focus-ring" onClick={logout}>
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
