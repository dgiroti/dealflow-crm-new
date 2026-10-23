import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { LoginInput, RegisterInput } from '@dealflow/shared';
import * as api from '../../lib/api';
import { AuthContext, type AuthState } from './auth-context';

export default function AuthProvider({ children }: { children: ReactNode }) {
    // Nobody is logged in when the app starts (Step 7 will change this)
  const [state, setState] = useState<AuthState>({ status: 'unauthenticated' });

   // Log in with the API, then REMEMBER the user
  const logIn = useCallback(async (input: LoginInput) => {
    const { user } = await api.login(input);
    setState({ status: 'authenticated', user });
  }, []);

  // Same for signing up
  const signUp = useCallback(async (input: RegisterInput) => {
    const { user } = await api.register(input);
    setState({ status: 'authenticated', user });
  }, []);

  // Bundle everything into one value for the context
  const value = useMemo(() => ({ state, logIn, signUp }), [state, logIn, signUp]);

  // Every component inside {children} can now call useAuth()
  return <AuthContext value={value}>{children}</AuthContext>;

}