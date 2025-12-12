/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestedPath, setRequestedPath] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);

      return;
    }

    let isMounted = true;
    setIsLoading(true);

    api
      .getCurrentUser(token)
      .then((data) => {
        if (!isMounted) return;
        setUser(data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać danych użytkownika');
        clearStoredToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const { token, user: authenticatedUser } = await api.login(payload);
      storeToken(token);
      setToken(token);
      const resolvedUser = authenticatedUser ?? (await api.getCurrentUser(token));
      setUser(resolvedUser);
      setAuthModalOpen(false);
      setRequestedPath(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nie udało się zalogować';
      setError(message);
      clearStoredToken();
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
    setAuthModalOpen(false);
    setRequestedPath(null);
  }, []);

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
      isAuthenticating,
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
      isAuthenticating,
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
