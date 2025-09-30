import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type AuthUser,
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest
} from '../api/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [forcedUnauthenticated, setForcedUnauthenticated] = useState(false);

  const { data: user, isLoading, refetch } = useQuery<AuthUser | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const result = await fetchCurrentUser();
        setForcedUnauthenticated(false);
        return result;
      } catch (error: unknown) {
        setForcedUnauthenticated(false);
        return null;
      }
    },
    staleTime: 60_000,
    retry: false
  });

  useEffect(() => {
    const handler = () => {
      setForcedUnauthenticated(true);
      queryClient.setQueryData(['auth', 'me'], null);
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const login = async (credentials: { email: string; password: string }) => {
      await loginRequest(credentials);
      setForcedUnauthenticated(false);
      await refetch();
    };

    const register = async (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      await registerRequest(payload);
      setForcedUnauthenticated(false);
      await refetch();
    };

    const logout = async () => {
      await logoutRequest();
      setForcedUnauthenticated(true);
      await refetch();
    };

    const refresh = async () => {
      await refetch();
    };

    return {
      user: forcedUnauthenticated ? null : user ?? null,
      isLoading,
      login,
      register,
      logout,
      refresh
    };
  }, [forcedUnauthenticated, isLoading, queryClient, refetch, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
