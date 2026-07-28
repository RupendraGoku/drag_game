import { Outlet } from 'react-router-dom';
import { AdminHeader } from './AdminHeader.jsx';
import { AdminSidebar } from './AdminSidebar.jsx';

export function AdminLayout() {
  return (
    <div className="admin-shell flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
