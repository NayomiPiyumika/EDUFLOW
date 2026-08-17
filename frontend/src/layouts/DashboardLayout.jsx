import { NavLink, Outlet } from 'react-router-dom';
import { GraduationCap, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Shared shell: sidebar navigation + top bar.
 * `navItems` is role-specific and passed in by AdminLayout / TeacherLayout / StudentLayout.
 */
export default function DashboardLayout({ navItems, roleLabel }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">EduFlow</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-slate-800" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
