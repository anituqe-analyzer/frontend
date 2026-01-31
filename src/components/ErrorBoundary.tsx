import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Wystąpił problem</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Nie można załadować danych. Sprawdź połączenie z serwerem.
      </p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">
        Spróbuj ponownie
      </Button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
