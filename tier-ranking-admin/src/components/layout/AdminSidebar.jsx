import { BarChart3, Gamepad2, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/genres', label: 'Genres', icon: Gamepad2 },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-[#d8dee7] bg-white lg:block">
      <div className="border-b border-[#d8dee7] px-5 py-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[#2563eb]">Tier Ranking</p>
        <h1 className="mt-1 text-xl font-black text-[#111827]">Admin</h1>
      </div>
      <nav className="p-3" aria-label="Admin navigation">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold ${
                  isActive ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'text-[#334155] hover:bg-[#f1f5f9]'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
