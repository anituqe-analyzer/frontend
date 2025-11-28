import { useState, useEffect, use, Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import {
  Clock,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Search,
} from "lucide-react";
import { mockApi, type Auction, type Category } from "@/services/mockApi";

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Wysokie prawdopodobieństwo";
  if (score >= 50) return "Niejednoznaczny";
  return "Wysokie ryzyko";
};

function CategoryList({
  categoriesPromise,
  selectedCategory,
  onSelectCategory,
}: {
  categoriesPromise: Promise<Category[]>;
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}) {
  const categories = use(categoriesPromise);

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(null)}
        className="rounded-full"
      >
        Wszystkie
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className="rounded-full"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

function AuctionGrid({
  auctionsPromise,
}: {
  auctionsPromise: Promise<Auction[]>;
}) {
  const auctions = use(auctionsPromise);

  if (auctions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nie znaleziono ofert spełniających kryteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {auctions.map((offer) => {
        const score = offer.ai_score_authenticity
          ? Math.round(offer.ai_score_authenticity * 100)
          : 0;
        const isVerified =
          offer.verification_status === "expert_verified" ||
          offer.verification_status === "ai_verified_authentic" ||
          offer.verification_status === "community_verified";
        const isFake =
          offer.verification_status === "ai_verified_fake" ||
          offer.verification_status === "rejected";
        const isPending =
          offer.verification_status === "pending_ai" ||
          offer.verification_status === "needs_human_verification";

        return (
          <Card
            key={offer.id}
            className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted/60"
          >
            <div className="aspect-square relative overflow-hidden bg-muted">
              <Link to={`/auction/${offer.id}`} className="block h-full w-full">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute top-2 right-2 z-10">
                {isVerified && (
                  <Badge className="bg-green-500/90 backdrop-blur-sm hover:bg-green-600 shadow-sm">
                    <CheckCircle className="mr-1 h-3 w-3" /> Autentyk
                  </Badge>
                )}
                {isFake && (
                  <Badge
                    variant="destructive"
                    className="opacity-90 backdrop-blur-sm shadow-sm"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" /> Falsyfikat
                  </Badge>
                )}
                {isPending && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100/90 text-yellow-800 hover:bg-yellow-200 backdrop-blur-sm shadow-sm"
                  >
                    <Clock className="mr-1 h-3 w-3" /> Weryfikacja
                  </Badge>
                )}
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-xs font-normal">
                  {offer.platform}
                </Badge>
              </div>
              <Link to={`/auction/${offer.id}`} className="hover:underline">
                <CardTitle className="line-clamp-2 text-base mb-2">
                  {offer.title}
                </CardTitle>
              </Link>

              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {score >= 80 ? (
                      <ShieldCheck className="h-3 w-3 text-green-500" />
                    ) : score >= 50 ? (
                      <ShieldQuestion className="h-3 w-3 text-yellow-500" />
                    ) : (
                      <ShieldAlert className="h-3 w-3 text-red-500" />
                    )}
                    Autentyczność
                  </span>
                  <span
                    className={`font-bold ${
                      score >= 80
                        ? "text-green-600"
                        : score >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {score}%
                  </span>
                </div>
                <Progress
                  value={score}
                  className="h-2 bg-muted"
                  style={
                    {
                      "--primary":
                        score >= 80
                          ? "142.1 76.2% 36.3%"
                          : score >= 50
                          ? "45.4 93.4% 47.5%"
                          : "0 84.2% 60.2%",
                    } as React.CSSProperties
                  }
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {getScoreLabel(score)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-3 w-3" />
                <span>Koniec za: {offer.timeLeft}</span>
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="p-3 bg-muted/20 flex justify-between items-center">
              <div className="flex items-center gap-1 text-sm font-medium">
                <ThumbsUp className="h-4 w-4 text-primary" />
                <span>
                  {offer.votes > 0 ? `+${offer.votes}` : offer.votes} głosów
                </span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                <Link to={`/auction/${offer.id}`}>Szczegóły</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export function RecentOffers() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categoriesPromise = useMemo(() => mockApi.getCategories(), []);

  const auctionsPromise = useMemo(() => {
    return mockApi.getAuctions({
      categoryId: selectedCategory || undefined,
      search: debouncedSearchTerm,
    });
  }, [selectedCategory, debouncedSearchTerm]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Ostatnio sprawdzane oferty
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj ofert..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="h-10 w-full animate-pulse bg-muted/20 rounded-full mb-8" />
        }
      >
        <CategoryList
          categoriesPromise={categoriesPromise}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-[400px] animate-pulse bg-muted/20" />
            ))}
          </div>
        }
      >
        <AuctionGrid auctionsPromise={auctionsPromise} />
      </Suspense>
    </div>
  );
}
