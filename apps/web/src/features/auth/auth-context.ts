import { createContext, useContext } from 'react';
import type { AuthUser, LoginInput, RegisterInput } from '@dealflow/shared';
// The app is always in exactly ONE of these states.
// (In Step 7 we'll add a third one: "loading".)
export type AuthState =
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' };

  // Everything the AuthProvider shares with the rest of the app
export type AuthContextValue = {
  state: AuthState;
  logIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
};

// The shared "box". It starts empty (null) until AuthProvider fills it.
export const AuthContext = createContext<AuthContextValue | null>(null);

// Any component calls useAuth() to open the box
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
     if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

// For pages inside the app layout, where a user is guaranteed to be logged in.
// Returns the user directly, so pages don't have to check the status themselves.
export function useCurrentUser(): AuthUser {
  const { state } = useAuth();
  if (state.status !== 'authenticated') {
    throw new Error('useCurrentUser must be used on pages inside the app layout');
  }
  return state.user;
}