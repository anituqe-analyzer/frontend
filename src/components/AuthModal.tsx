import { useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export function AuthModal() {
  const [ open, setOpen ] = useState(false);
  const { login, isAuthenticating, error } = useAuth();
  const [ formData, setFormData ] = useState({ email: '', password: '' });
  const [ localError, setLocalError ] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    try {
      await login(formData);
      setOpen(false);
      setFormData({ email: '', password: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nie udało się zalogować';
      setLocalError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Zaloguj się</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wejście do panelu</DialogTitle>
          <DialogDescription>
            Podaj dane logowania otrzymane od administratora, aby korzystać z panelu eksperta.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              required
            />
          </div>
          {(localError || error) && <p className="text-sm text-destructive">{localError || error}</p>}
          <Button type="submit" className="w-full" disabled={isAuthenticating}>
            {isAuthenticating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Logowanie...
              </span>
            ) : (
              'Zaloguj się'
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Nie masz konta? Skontaktuj się z administratorem systemu.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
