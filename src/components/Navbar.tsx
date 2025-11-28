import { Link } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";
import { ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/80">
              AntiqueVerify
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
              Beta
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:inline-flex"
          >
            <Link to="/dashboard">Panel (Demo)</Link>
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            O projekcie
          </Button>
          <div className="ml-2">
            <AuthModal />
          </div>
        </div>
      </div>
    </nav>
  );
}
