/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, clearStoredToken, getStoredToken, storeToken, type LoginPayload, type User } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  requireAuth: (path?: string | null) => void;
  requestedPath: string | null;
  clearRequestedPath: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestedPath, setRequestedPath] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const currentUserQuery = useQuery({
    queryKey: ['currentUser', token],
    queryFn: () => api.getCurrentUser(token),
    enabled: Boolean(token),
    retry: 1,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => api.login(payload),
    onMutate: () => {
      setError(null);
    },
    onSuccess: async (data) => {
      storeToken(data.token);
      setToken(data.token);
      setAuthModalOpen(false);
      setRequestedPath(null);

      if (data.user) {
        queryClient.setQueryData(['currentUser', data.token], data.user);
        setUser(data.user);
      } else {
        const fetchedUser = await queryClient.fetchQuery({
          queryKey: ['currentUser', data.token],
          queryFn: () => api.getCurrentUser(data.token),
        });
        setUser(fetchedUser);
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Nie udało się zalogować';
      setError(message);
      clearStoredToken();
      setToken(null);
      setUser(null);
    },
  });

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(currentUserQuery.isLoading);

    if (currentUserQuery.data) {
      setUser(currentUserQuery.data);
      setIsLoading(false);
    }

    if (currentUserQuery.error) {
      const message =
        currentUserQuery.error instanceof Error
          ? currentUserQuery.error.message
          : 'Nie udało się pobrać danych użytkownika';
      setError(message);
      clearStoredToken();
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, [token, currentUserQuery.data, currentUserQuery.error, currentUserQuery.isLoading]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation]
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
    setAuthModalOpen(false);
    setRequestedPath(null);
    queryClient.removeQueries({ queryKey: ['currentUser'] });
  }, [queryClient]);

  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const requireAuth = useCallback((path?: string | null) => {
    if (path) {
      setRequestedPath(path);
    }
    setAuthModalOpen(true);
  }, []);

  const clearRequestedPath = useCallback(() => {
    setRequestedPath(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticating: loginMutation.isPending,
      error,
      login,
      logout,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      requestedPath,
      clearRequestedPath,
    }),
    [
      user,
      token,
      isLoading,
      loginMutation.isPending,
      error,
      login,
      logout,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      requestedPath,
      clearRequestedPath,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
