import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, requireAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      requireAuth(location.pathname);
    }
  }, [isLoading, user, location.pathname, requireAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full py-24">
        <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 py-24 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Wymagane logowanie</h2>
          <p className="text-muted-foreground">
            Zaloguj się, aby uzyskać dostęp do tej sekcji. Po pomyślnym logowaniu powrócisz automatycznie do wybranej
            strony.
          </p>
        </div>
        <Button size="lg" onClick={() => requireAuth(location.pathname)}>
          Otwórz panel logowania
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
