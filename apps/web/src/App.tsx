import { Link, Route, Navigate, Routes } from 'react-router';
import DashboardPage from './features/dashboard/DashboardPage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';

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
      {/* NEW: visiting "/" sends you straight to the login page */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* "*" matches everything, so it must come last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
