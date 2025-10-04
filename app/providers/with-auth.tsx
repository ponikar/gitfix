
import React from 'react';
import { useGitHubAuth } from '@/components/useGitHubAuth';

export const AuthContext = React.createContext<{ token: string | null, hasRepoScope: boolean, login: () => Promise<void> }>({ token: null, hasRepoScope: false, login: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, hasRepoScope, login } = useGitHubAuth();
  return <AuthContext.Provider value={{ token, hasRepoScope, login }}>{children}</AuthContext.Provider>;
}
