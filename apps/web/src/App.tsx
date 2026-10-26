import { Link, Navigate, Route, Routes } from 'react-router';
import DashboardPage from './features/dashboard/DashboardPage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ComingSoon from './components/ComingSoon';
import AppLayout from './components/AppLayout';
import PublicOnly from './features/auth/PublicOnly';
import RequireAuth from './features/auth/RequireAuth';

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
      <p className="text-gray-600">The login form comes in Step 4.</p>
      <Link to="/" className="text-indigo-600 hover:underline">
        Go Home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      {/* CHANGED: "/" now goes to the dashboard. If you're logged out,
          RequireAuth then sends you on to the login page. */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* NEW: only for logged-OUT visitors */}
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* NEW: a "layout route". It has no path of its own; every route inside it
          is drawn inside AppLayout, wherever AppLayout puts <Outlet /> */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/companies"
            element={<ComingSoon title="Companies" availableIn="Milestone 2" />}
          />
          <Route
            path="/contacts"
            element={<ComingSoon title="Contacts" availableIn="Milestone 2" />}
          />
          <Route path="/deals" element={<ComingSoon title="Deals" availableIn="Milestone 3" />} />
          <Route path="/tasks" element={<ComingSoon title="Tasks" availableIn="Milestone 4" />} />
          <Route path="/settings" element={<ComingSoon title="Settings" availableIn="Step 11" />} />
        </Route>
      </Route>

      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      {/* "*" matches everything, so it must come last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
