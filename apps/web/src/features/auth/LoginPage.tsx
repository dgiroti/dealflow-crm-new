import { Link } from 'react-router';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
      <p className="text-gray-600">The login form comes in Step 4.</p>
      <Link to="/signup" className="text-indigo-600 hover:underline">
        New here? Sign up
      </Link>
    </main>
  );
}
