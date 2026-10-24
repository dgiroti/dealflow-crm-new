import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { registerSchema, type AuthUser } from '@dealflow/shared';
import { registerSchema } from '@dealflow/shared';
import { Alert, Button, TextField } from '../../components/ui';
import { applyServerErrors } from '../../lib/forms';
// import * as api from '../../lib/api';
// import { useState } from 'react';
import { useAuth } from './auth-context';

export default function SignupPage() {
  // const [createdUser, setCreatedUser] = useState<AuthUser | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register, // connects an input to the form
    setError,
    handleSubmit, // runs validation, then our function if everything is valid
    formState: { errors, isSubmitting },
  } = useForm({
    // Check the form with the SAME rules the API uses
    resolver: zodResolver(registerSchema),
    defaultValues: { workspaceName: '', name: '', email: '', password: '' },
  });

  // // Only runs when ALL fields pass the schema
  // const onSubmit = handleSubmit((values) => {
  //   const data= api.

  // });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      navigate('/dashboard');
      // const { user } = await api.register(values); // the function from Step 1
      // setCreatedUser(user);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  // // NEW: after a successful sign-up, show a confirmation instead of the form
  // if (createdUser) {
  //   return (
  //     <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
  //       <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
  //         <h1 className="text-2xl font-bold text-gray-900">Workspace created</h1>
  //         <p className="mt-2 text-gray-600">
  //           “{createdUser.organization.name}” is ready. You're signed in as {createdUser.name} (
  //           {createdUser.role}).
  //         </p>
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Create your workspace</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set up DealFlow for your sales team. You'll be the workspace admin.
        </p>

        {/* Lowercase <form>: the normal HTML form element */}
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {errors.root && <Alert>{errors.root.message}</Alert>}
          <TextField
            label="Workspace name"
            placeholder="Acme Sales"
            error={errors.workspaceName?.message}
            {...register('workspaceName')}
          />
          <TextField
            label="Your name"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="Work email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 12 characters. A short sentence works well."
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating workspace…' : 'Create workspace'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
