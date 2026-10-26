import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LoginInput, RegisterInput } from '@dealflow/shared';
import * as api from '../../lib/api';
import { AuthContext, type AuthState } from './auth-context';
import { useQueryClient } from '@tanstack/react-query';

export default function AuthProvider({ children }: { children: ReactNode }) {
  // Nobody is logged in when the app starts (Step 7 will change this)
  const [state, setState] = useState<AuthState>({ status: 'unauthenticated' });
   const queryClient = useQueryClient();

  // Log in with the API, then REMEMBER the user
  const logIn = useCallback(async (input: LoginInput) => {
    const { user } = await api.login(input);
    setState({ status: 'authenticated', user });
  }, []);

  const logOut = useCallback(async () => {
    await api.logout();
    // Remove all cached API data, so the next person on this computer can't see it
    queryClient.clear();
    setState({ status: 'unauthenticated' });
  }, [queryClient]);

  // Same for signing up
  const signUp = useCallback(async (input: RegisterInput) => {
    const { user } = await api.register(input);
    setState({ status: 'authenticated', user });
  }, []);

  // Bundle everything into one value for the context
  const value = useMemo(() => ({ state, logIn, signUp, logOut }), [state, logIn, signUp, logOut]);

  // Every component inside {children} can now call useAuth()
  return <AuthContext value={value}>{children}</AuthContext>;
}
