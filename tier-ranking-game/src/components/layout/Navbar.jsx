import { Gamepad2, HelpCircle, List } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d8dee7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-12 max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
        <Link to="/" className="flex items-center gap-2 text-base font-black text-[#111827]">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#2563eb] text-white">
            <Gamepad2 size={17} aria-hidden="true" />
          </span>
          Tier Ranking
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          <NavLink className={({ isActive }) => `btn focus-ring px-3 ${isActive ? 'btn-primary' : 'btn-secondary'}`} to="/genres">
            <List size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Genres</span>
          </NavLink>
          <NavLink className={({ isActive }) => `btn focus-ring px-3 ${isActive ? 'btn-primary' : 'btn-secondary'}`} to="/how-to-play">
            <HelpCircle size={14} aria-hidden="true" />
            <span className="hidden sm:inline">How to Play</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
