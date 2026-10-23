// import { Link } from 'react-router';
// import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { loginSchema, type AuthUser } from '@dealflow/shared';
import { loginSchema } from '@dealflow/shared';
import { Alert, Button, TextField } from '../../components/ui';
import { applyServerErrors } from '../../lib/forms';
import { useAuth } from './auth-context';

export default function LoginPage() {
  // const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();
  const { logIn } = useAuth(); // NEW

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    // The shared login rules: a valid email, and a password that isn't empty
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await logIn(values); // CHANGED: logs in AND remembers the user
    //  await api.login(values); // the function from Step 1
      // setLoggedInUser(user);
      navigate('/dashboard')
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  // // After a successful login, show who you are instead of the form
  // if (loggedInUser) {
  //   return (
  //     <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
  //       <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
  //         <h1 className="text-2xl font-bold text-gray-900">Welcome back, {loggedInUser.name}</h1>
  //         <p className="mt-2 text-gray-600">
  //           You're logged in to “{loggedInUser.organization.name}” as {loggedInUser.role}.
  //         </p>
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome back to your workspace.</p>
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {/* For login, this shows "Invalid email or password" */}
          {errors.root && <Alert>{errors.root.message}</Alert>}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to DealFlow?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
            Create a workspace
          </Link>
        </p>
      </div>
    </main>
  );
}
