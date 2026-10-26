import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './auth-context';

// Wraps every page that needs a logged-in user
export default function RequireAuth() {
  const { state } = useAuth();
  const location = useLocation(); // the address the visitor is trying to open

  if (state.status !== 'authenticated') {
    // Send them to the login page, and remember where they wanted to go.
    // "state" here is extra information carried along with the navigation.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // Logged in: show whichever page is inside this guard
  return <Outlet />;
}