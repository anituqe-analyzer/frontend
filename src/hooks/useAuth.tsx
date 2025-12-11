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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ user, setUser ] = useState<User | null>(null);
  const [ token, setToken ] = useState<string | null>(() => getStoredToken());
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isAuthenticating, setIsAuthenticating ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);

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
  }, [ token ]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const { token } = await api.login(payload);
      storeToken(token);
      setToken(token);
      const currentUser = await api.getCurrentUser(token);
      setUser(currentUser);
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
    }),
    [ user, token, isLoading, isAuthenticating, error, login, logout ]
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
