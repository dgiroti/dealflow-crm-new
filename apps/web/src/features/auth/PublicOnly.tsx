import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './auth-context';

// Only accept addresses inside our own app (like "/settings").
// Anything else falls back to the dashboard.
function safeRedirectPath(value: unknown): string {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }
  return '/dashboard';
}

export default function PublicOnly() {
  const { state } = useAuth();
  const location = useLocation();

  if (state.status === 'authenticated') {
    // Logged in: go where they originally wanted to go (saved by RequireAuth), or the dashboard
    const from = (location.state as { from?: unknown } | null)?.from;
    return <Navigate to={safeRedirectPath(from)} replace />;
  }

  // Logged out: show the login or sign-up page
  return <Outlet />;
}
