import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, Clock, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuctions } from '@/hooks/useApiQueries';

type StatusConfig = { label: string; className: string };

const PENDING_STATUSES = new Set(['pending', 'pending_ai', 'needs_human_verification', 'disputed']);

const STATUS_COPY: Record<string, StatusConfig> = {
  pending: {
    label: 'Weryfikacja',
    className: 'bg-yellow-100 text-yellow-800',
  },
  ai_verified: {
    label: 'Zweryfikowano AI',
    className: 'bg-blue-500 text-white',
  },
  expert_verified: {
    label: 'Zweryfikowano',
    className: 'bg-green-500 text-white',
  },
  fake: {
    label: 'Falsyfikat',
    className: 'bg-red-500 text-white',
  },
};

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const fallback: StatusConfig = {
    label: status,
    className: 'bg-muted text-foreground',
  };
  const config = STATUS_COPY[status] ?? fallback;

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score == null) return null;
  const percent = Math.round(score * 100);
  const isSafe = percent >= 70;
  const Icon = isSafe ? ShieldCheck : ShieldAlert;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={isSafe ? 'h-4 w-4 text-green-500' : 'h-4 w-4 text-yellow-500'} />
      <span>{percent}% pewności AI</span>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data: allAuctions = [], isLoading, error: queryError } = useAuctions({ perPage: 100 });

  const isExpert = useMemo(() => user?.role === 'expert' || user?.role === 'admin', [user?.role]);

  const myOffers = useMemo(
    () => allAuctions.filter((auction) => auction.submitted_by_user_id === user?.id),
    [allAuctions, user?.id]
  );

  const expertQueue = useMemo(
    () => allAuctions.filter((auction) => PENDING_STATUSES.has(auction.verification_status ?? 'pending')),
    [allAuctions]
  );

  const awaitingOffers = useMemo(
    () => myOffers.filter((offer) => PENDING_STATUSES.has(offer.verification_status ?? 'pending')),
    [myOffers]
  );

  const reviewedOffers = useMemo(
    () => myOffers.filter((offer) => !PENDING_STATUSES.has(offer.verification_status ?? 'pending')),
    [myOffers]
  );

  const error = queryError instanceof Error ? queryError.message : null;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel użytkownika</h1>
          <p className="text-muted-foreground">Zarządzaj swoimi zgłoszeniami i weryfikacjami.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Rola: {user?.role ?? 'nieznana'}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {user?.username ?? user?.email}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue={isExpert ? 'expert-zone' : 'my-offers'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-offers">Moje zgłoszenia</TabsTrigger>
          <TabsTrigger value="expert-zone" disabled={!isExpert}>
            Strefa Eksperta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-offers">
          <Card>
            <CardHeader>
              <CardTitle>Twoje zgłoszenia</CardTitle>
              <CardDescription>Historia przedmiotów zgłoszonych przez Ciebie do weryfikacji.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ładowanie zgłoszeń...
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {!isLoading && !error && myOffers.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                  <Clock className="h-10 w-10" />
                  <p>Nie masz jeszcze żadnych zgłoszeń.</p>
                  <Button variant="secondary" asChild>
                    <Link to="/add-auction">Dodaj pierwsze zgłoszenie</Link>
                  </Button>
                </div>
              )}
              {!isLoading && !error && myOffers.length > 0 && (
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">Aukcje oczekujące na ocenę</h3>
                        <p className="text-sm text-muted-foreground">
                          Te zgłoszenia wciąż czekają na głosy i komentarze.
                        </p>
                      </div>
                    </div>
                    {awaitingOffers.length === 0 ? (
                      <p className="text-sm text-muted-foreground border rounded-lg p-4">
                        Wszystkie Twoje zgłoszenia zostały już ocenione.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {awaitingOffers.map((offer) => (
                          <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <Link to={`/auction/${offer.id}`} className="font-medium hover:underline">
                                  {offer.title}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  Dodano: {new Date(offer.created_at).toLocaleDateString()}
                                </p>
                                <ScorePill score={offer.ai_score_authenticity ?? null} />
                              </div>
                            </div>
                            <StatusBadge status={offer.verification_status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">Zweryfikowane aukcje</h3>
                        <p className="text-sm text-muted-foreground">
                          Proces oceny został zakończony – możesz jedynie śledzić historię i komentarze.
                        </p>
                      </div>
                    </div>
                    {reviewedOffers.length === 0 ? (
                      <p className="text-sm text-muted-foreground border rounded-lg p-4">
                        Brak zakończonych zgłoszeń w tej chwili.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {reviewedOffers.map((offer) => (
                          <div key={offer.id} className="flex flex-col gap-2 p-4 border rounded-lg">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <Link to={`/auction/${offer.id}`} className="font-medium hover:underline">
                                    {offer.title}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    Dodano: {new Date(offer.created_at).toLocaleDateString()}
                                  </p>
                                  <ScorePill score={offer.ai_score_authenticity ?? null} />
                                </div>
                              </div>
                              <StatusBadge status={offer.verification_status} />
                            </div>
                            <p className="text-xs font-semibold text-red-600">
                              Proces weryfikacji tego zgłoszenia został zamknięty – głosowanie jest niedostępne.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expert-zone">
          <Card className="border-muted/60 shadow-sm">
            <CardHeader>
              <CardTitle>Zadania dla eksperta</CardTitle>
              <CardDescription>
                Przedmioty wymagające dodatkowej oceny. Lista obejmuje zgłoszenia ze statusem "pending" z ostatnich 100
                rekordów.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isExpert && (
                <p className="text-sm text-muted-foreground">
                  Musisz posiadać rolę eksperta lub administratora, aby przeglądać tę sekcję.
                </p>
              )}
              {isExpert && isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ładowanie zadań...
                </div>
              )}
              {isExpert && !isLoading && expertQueue.length === 0 && (
                <p className="text-sm text-muted-foreground">Brak zadań wymagających Twojej interwencji.</p>
              )}
              {isExpert && !isLoading && expertQueue.length > 0 && (
                <div className="grid gap-6">
                  {expertQueue.map((task) => (
                    <div
                      key={task.id}
                      className="group flex flex-col md:flex-row gap-6 p-4 border rounded-xl hover:bg-muted/30 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {task.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Kategoria:{' '}
                              <span className="font-medium text-foreground">{task.category_name ?? '—'}</span> • Dodano:{' '}
                              {new Date(task.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusBadge status={task.verification_status} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button asChild size="sm" variant="secondary" className="shadow-sm">
                            <Link to={`/auction/${task.id}`}>Zobacz szczegóły</Link>
                          </Button>
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 shadow-sm">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Potwierdź autentyczność
                          </Button>
                          <Button size="sm" variant="destructive" className="shadow-sm">
                            <XCircle className="mr-2 h-4 w-4" /> Oznacz jako falsyfikat
                          </Button>
                          <Button size="sm" variant="outline" className="shadow-sm hover:bg-background">
                            <AlertCircle className="mr-2 h-4 w-4" /> Wymaga dyskusji
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
