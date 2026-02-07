import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import {
  Clock,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Search,
} from 'lucide-react';
import { api, type Auction, type Category } from '@/services/api';

const VERIFIED_STATUSES = new Set(['expert_verified', 'ai_verified', 'ai_verified_authentic', 'community_verified']);
const FAKE_STATUSES = new Set(['fake', 'ai_verified_fake', 'rejected']);
const PENDING_STATUSES = new Set(['pending', 'pending_ai', 'needs_human_verification', 'disputed']);

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Wysokie prawdopodobieństwo';
  if (score >= 50) return 'Niejednoznaczny';

  return 'Wysokie ryzyko';
};

function CategoryList({
  categories,
  loading,
  selectedCategory,
  onSelectCategory,
}: {
  categories: Category[];
  loading: boolean;
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}) {
  if (loading) {
    return <div className="h-10 w-full animate-pulse bg-muted/20 rounded-full mb-8" />;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelectCategory(null)}
        className="rounded-full"
      >
        Wszystkie
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
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

function AuctionSection({
  title,
  description,
  auctions,
  emptyMessage,
  finalizedNotice,
}: {
  title: string;
  description: string;
  auctions: Auction[];
  emptyMessage: string;
  finalizedNotice?: string;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {auctions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-xl">{emptyMessage}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {auctions.map((offer) => {
            // Jeśli brak wartości AI, losuj wartość dla demo (50-85%)
            const score = Math.round((offer?.ai_score_authenticity ?? 0) * 100);
            const status = offer.verification_status ?? 'pending';
            const isVerified = VERIFIED_STATUSES.has(status);
            const isFake = FAKE_STATUSES.has(status);
            const isPending = PENDING_STATUSES.has(status);
            const imageSrc = offer.image ?? `https://source.unsplash.com/random/600x600?antiques&sig=${offer.id}`;
            const platformLabel = offer.platform ?? 'Nieznane źródło';
            const netVotes =
              typeof offer.votes === 'number' ? offer.votes : (offer.votes_authentic ?? 0) - (offer.votes_fake ?? 0);

            return (
              <Card
                key={offer.id}
                className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted/60"
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <Link to={`/auction/${offer.id}`} className="block h-full w-full">
                    <img
                      src={imageSrc}
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
                      <Badge variant="destructive" className="opacity-90 backdrop-blur-sm shadow-sm">
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
                      {offer.category_name ?? platformLabel}
                    </Badge>
                  </div>
                  <Link to={`/auction/${offer.id}`} className="hover:underline">
                    <CardTitle className="line-clamp-2 text-base mb-2">{offer.title}</CardTitle>
                  </Link>

                  <p className="text-xs text-muted-foreground">
                    Sprzedający: {offer.submitted_by_username ?? 'nieznany'}
                  </p>

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
                          score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
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
                          '--primary':
                            score >= 80 ? '142.1 76.2% 36.3%' : score >= 50 ? '45.4 93.4% 47.5%' : '0 84.2% 60.2%',
                        } as React.CSSProperties
                      }
                    />
                    <p className="text-[10px] text-muted-foreground text-right">{getScoreLabel(score)}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3" />
                    <span>Dodano: {new Date(offer.created_at).toLocaleDateString()}</span>
                  </div>
                  {finalizedNotice && !isPending && (
                    <p className="text-xs font-semibold text-red-600">{finalizedNotice}</p>
                  )}
                </CardContent>
                <Separator />
                <CardFooter className="p-3 bg-muted/20 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    <span>{netVotes > 0 ? `+${netVotes}` : netVotes} głosów</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                    <Link to={`/auction/${offer.id}`}>Szczegóły</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AuctionsBoard({ auctions, loading }: { auctions: Auction[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-[400px] animate-pulse bg-muted/20" />
        ))}
      </div>
    );
  }

  const pendingAuctions = auctions.filter((offer) => PENDING_STATUSES.has(offer.verification_status ?? 'pending'));
  const finalizedAuctions = auctions.filter((offer) => !PENDING_STATUSES.has(offer.verification_status ?? 'pending'));

  return (
    <div className="space-y-12">
      <AuctionSection
        title="Aukcje oczekujące na werdykt"
        description="Możesz głosować i komentować, aby wesprzeć proces weryfikacji."
        auctions={pendingAuctions}
        emptyMessage="Brak aktywnych zgłoszeń w tej kategorii."
      />
      <AuctionSection
        title="Aukcje z zakończoną weryfikacją"
        description="Głosowanie zostało zamknięte. Pozostaw komentarz, jeśli chcesz podzielić się opinią."
        auctions={finalizedAuctions}
        emptyMessage="Brak zakończonych zgłoszeń dla wybranych filtrów."
        finalizedNotice="Proces weryfikacji został zakończony. Możesz dodać jedynie komentarz."
      />
    </div>
  );
}

export function RecentOffers() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  const { data: auctions = [], isLoading: auctionsLoading } = useQuery({
    queryKey: ['auctions', selectedCategory, debouncedSearchTerm],
    queryFn: ({ queryKey }) => {
      const [, categoryId, search] = queryKey;
      return api.getAuctions({
        categoryId: (categoryId as number | null) || undefined,
        search: search as string,
      });
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Ostatnio sprawdzane oferty</h2>

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

      <CategoryList
        categories={categories}
        loading={categoriesLoading}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <AuctionsBoard auctions={auctions} loading={auctionsLoading} />
    </div>
  );
}
