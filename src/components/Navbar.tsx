import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, isLoading, logout, openAuthModal } = useAuth();
  const initialsSource = user?.username ?? user?.email ?? '';
  const initials = initialsSource
    .split(/\s|-|_|\./)
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const userLabel = user?.username ?? user?.email ?? '';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="AntiqueVerify" className="h-8 w-8" />
          </Link>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link to="/dashboard">Panel użytkownika</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link to="/o-projekcie">O projekcie</Link>
          </Button>
          <div className="ml-2">
            {isLoading ? (
              <div className="h-10 w-24 rounded-full bg-muted/60 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border bg-background/80 px-2 py-1 text-sm font-medium shadow-sm transition hover:border-primary/40">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block max-w-[120px] truncate">{userLabel}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Zalogowano</DropdownMenuLabel>
                  <div className="px-2 pb-2 text-xs text-muted-foreground">{user?.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    variant="destructive"
                    className="text-destructive flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={openAuthModal}>
                Zaloguj się
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
