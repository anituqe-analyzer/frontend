import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 dark:bg-pink-900/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-24 text-center md:py-32 relative z-10">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-8">
          Nowość: Weryfikacja AI 2.0
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          Sprawdź autentyczność{" "}
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            antyku
          </span>
        </h1>
        <p className="mb-10 max-w-[800px] text-muted-foreground md:text-xl leading-relaxed">
          Wklej link do aukcji lub oferty, a nasza sztuczna inteligencja
          wstępnie oceni przedmiot. W razie wątpliwości pomogą nasi eksperci.
        </p>

        <div className="flex w-full max-w-4xl items-center space-x-2 rounded-xl border border-border/50 bg-background/60 backdrop-blur-xl p-2 shadow-2xl ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all hover:border-primary/50 hover:bg-background/80">
          <Search className="ml-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Wklej link do oferty (np. Allegro, OLX, eBay)..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg bg-transparent h-12"
          />
          <Button
            size="lg"
            className="px-8 h-12 rounded-lg text-base shadow-md transition-transform active:scale-95 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            Analizuj
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Allegro
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            OLX
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            eBay
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            Catawiki
          </span>
        </div>
      </div>
    </div>
  );
}
