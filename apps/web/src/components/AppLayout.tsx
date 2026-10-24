import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../features/auth/auth-context';

// The links in the sidebar, as data (like the dashboard's cards)
const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/companies', label: 'Companies' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/deals', label: 'Deals' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/settings', label: 'Settings' },
];

export default function AppLayout() {
  const { state } = useAuth();

  // Temporary guard: in Step 8, this becomes an automatic redirect to /login
  if (state.status !== 'authenticated') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-600">You're not logged in.</p>
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Go to the login page
        </Link>
      </main>
    );
  }

  const { user } = state;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <aside className="border-b border-gray-200 bg-white md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col p-4">
          {/* ── Workspace name ── */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              DealFlow
            </p>
            <p className="truncate font-semibold text-gray-900">{user.organization.name}</p>
          </div>
          {/* ── Navigation ── */}
          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {/* ── Who's logged in (the logout button comes in Step 12) ── */}
          <div className="mt-6 border-t border-gray-200 pt-4 md:mt-auto">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs capitalize text-gray-500">{user.role}</p>
          </div>
        </div>
      </aside>
      {/* ── The current page appears here ── */}
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
