import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageMagnifier } from '@/components/ui/image-magnifier';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  useAuctionById,
  useAuctionOpinions,
  useCreateOpinion,
  useVoteOpinion,
} from '@/hooks/useApiQueries';
import {
  ArrowLeft,
  ShieldQuestion,
  Calendar,
  ExternalLink,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Globe,
  Tag,
} from 'lucide-react';

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&auto=format&fit=crop&q=60',
];

function PageSkeleton() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

function NotFoundBlock() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Nie znaleziono oferty</h2>
      <Link to="/">
        <Button>Wróć na stronę główną</Button>
      </Link>
    </div>
  );
}

function buildGallery(primaryImage?: string | null, gallery?: string[] | null) {
  if (gallery && gallery.length > 0) {
    return gallery;
  }

  if (primaryImage) {
    return [primaryImage, ...FALLBACK_GALLERY];
  }

  return FALLBACK_GALLERY;
}

export function AuctionDetails() {
  const { id } = useParams();
  const auctionId = Number(id);

  if (!auctionId) {
    return <NotFoundBlock />;
  }

  return <AuctionDetailsContent auctionId={auctionId} />;
}

function AuctionDetailsContent({ auctionId }: { auctionId: number }) {
  const { user, token } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newVerdict, setNewVerdict] = useState<'authentic' | 'fake' | 'unsure'>('unsure');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [opinionVoteState, setOpinionVoteState] = useState<Record<number, 'up' | 'down' | null>>({});
  const [opinionVoteError, setOpinionVoteError] = useState<string | null>(null);

  // React Query hooks
  const { data: auction, isLoading: auctionLoading, error: auctionError } = useAuctionById(auctionId);
  const { data: opinions = [], isLoading: opinionsLoading } = useAuctionOpinions(auctionId);
  const createOpinionMutation = useCreateOpinion();
  const voteOpinionMutation = useVoteOpinion();

  if (auctionLoading || opinionsLoading) {
    return <PageSkeleton />;
  }

  if (auctionError || !auction) {
    return <NotFoundBlock />;
  }

  const images = buildGallery(auction.image, auction.image_gallery);
  const priceCurrency = auction.currency ?? 'PLN';
  const numericPrice = typeof auction.price === 'number' ? auction.price : null;
  let formattedPrice: string | null = null;

  if (numericPrice !== null) {
    try {
      formattedPrice = new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: priceCurrency,
      }).format(numericPrice);
    } catch (error) {
      console.warn('Nie udało się sformatować ceny', error);
      formattedPrice = `${numericPrice.toFixed(2)} ${priceCurrency}`;
    }
  }
  const platformLabel = auction.platform ?? null;
  const categoryLabel = auction.category_name ?? platformLabel ?? 'Nieznana kategoria';
  const sourceLabel = platformLabel ?? 'Nieznane źródło';
  const submitterLabel = auction.submitted_by_username
    ? `@${auction.submitted_by_username}`
    : auction.submitted_by_user_id
      ? `Użytkownik #${auction.submitted_by_user_id}`
      : 'Anonimowy użytkownik';
  const submitterInitials = (
    auction.submitted_by_username ??
    (auction.submitted_by_user_id != null ? auction.submitted_by_user_id.toString() : 'AU')
  )
    .slice(0, 2)
    .toUpperCase();
  const createdDate = new Date(auction.created_at);
  const formattedCreationDatetime = Number.isNaN(createdDate.getTime())
    ? 'Brak danych'
    : createdDate.toLocaleString('pl-PL');
  const commentAvatarLabel = (user?.username ?? user?.email ?? 'TY').substring(0, 2).toUpperCase();
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    if (!user || !token) {
      setCommentError('Zaloguj się, aby dodać opinię.');
      return;
    }

    createOpinionMutation.mutate(
      { auctionId: auction.id, content: newComment.trim(), verdict: newVerdict },
      {
        onSuccess: () => {
          setNewComment('');
          setNewVerdict('unsure');
          setCommentError(null);
        },
        onError: (error) => {
          setCommentError(error instanceof Error ? error.message : 'Nie udało się dodać komentarza');
        },
      }
    );
  };

  const handleOpinionVote = (opinionId: number, direction: 'up' | 'down') => {
    if (!user || !token) {
      setOpinionVoteError('Zaloguj się, aby oceniać opinie.');
      return;
    }

    setOpinionVoteError(null);
    setOpinionVoteState((prev) => ({ ...prev, [opinionId]: direction }));

    voteOpinionMutation.mutate(
      {
        opinionId,
        payload: { vote_type: direction === 'up' ? 1 : -1 },
        auctionId: auction.id,
      },
      {
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'Nie udało się zarejestrować głosu';
          setOpinionVoteError(message);
        },
        onSettled: () => {
          setOpinionVoteState((prev) => ({ ...prev, [opinionId]: null }));
        },
      }
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Powrót do listy
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{auction.title}</h1>
              <Badge variant="outline" className="text-sm">
                ID: {auction.id}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <Badge className="bg-primary/10 text-primary border-primary/30 flex items-center gap-1">
                <Tag className="h-3 w-3" /> {categoryLabel}
              </Badge>
              {platformLabel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {platformLabel}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Dodano: {new Date(auction.created_at).toLocaleDateString()}
              </span>
              {auction.external_link && (
                <a
                  href={auction.external_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" /> Link do oferty
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
              <User className="h-4 w-4" />
              <span>Zgłoszone przez</span>
              <span className="font-semibold text-foreground">{submitterLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-muted/60 shadow-sm">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <ImageMagnifier src={images[selectedImageIndex]} alt="Main view" />
              <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-10"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center"
                  showCloseButton={false}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={images[selectedImageIndex]}
                      alt="Fullscreen view"
                      className="max-w-full max-h-full object-contain p-4"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                      onClick={() => setIsLightboxOpen(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>

                    {images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                          }}
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                          }}
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>
                      </>
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-4 gap-2 p-2 bg-muted/20">
              {images.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className={cn(
                    'aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all',
                    selectedImageIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-primary/50'
                  )}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opis przedmiotu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{auction.description_text}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Komentarze ({opinions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>{commentAvatarLabel}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder={user ? 'Dodaj komentarz...' : 'Zaloguj się, aby komentować'}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    className="min-h-20"
                    disabled={!user}
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-xs text-muted-foreground" htmlFor="opinion-verdict">
                      Werdykt
                    </label>
                    <select
                      id="opinion-verdict"
                      className="flex h-9 w-full sm:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newVerdict}
                      onChange={(event) => setNewVerdict(event.target.value as 'authentic' | 'fake' | 'unsure')}
                      disabled={!user}
                    >
                      <option value="authentic">Autentyk</option>
                      <option value="fake">Falsyfikat</option>
                      <option value="unsure">Niepewny</option>
                    </select>
                  </div>
                  {commentError && <p className="text-sm text-destructive">{commentError}</p>}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || createOpinionMutation.isPending || !user}
                    >
                      {createOpinionMutation.isPending ? (
                        'Wysyłanie...'
                      ) : (
                        <>
                          <Send className="mr-2 h-3 w-3" /> Wyślij
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Zaloguj się, aby brać udział w głosowaniu na opinie.
                </p>
              )}
              {opinionVoteError && <p className="text-sm text-destructive text-center">{opinionVoteError}</p>}

              <div className="space-y-6">
                {opinions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Brak komentarzy. Bądź pierwszy!</p>
                ) : (
                  opinions.map((opinion) => {
                    const displayName = opinion.user?.username?.trim() || 'Anonimowy użytkownik';
                    const initials = displayName.substring(0, 2).toUpperCase();
                    const roleLabel = opinion.user?.role ?? opinion.author_type ?? 'user';
                    const isExpertRole = roleLabel === 'expert' || roleLabel === 'admin';
                    const readableRole =
                      roleLabel === 'admin' ? 'Administrator' : roleLabel === 'expert' ? 'Ekspert' : 'Użytkownik';
                    const verdictLabel =
                      opinion.verdict === 'authentic'
                        ? 'Autentyk'
                        : opinion.verdict === 'fake'
                          ? 'Falsyfikat'
                          : 'Niepewny';
                    const verdictClass =
                      opinion.verdict === 'authentic'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : opinion.verdict === 'fake'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    const opinionScore = opinion.score ?? opinion.votes_count ?? 0;

                    return (
                      <div key={opinion.id} className="flex gap-4">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={opinion.user_avatar ?? undefined} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{displayName}</span>
                            <span className="text-xs text-muted-foreground">({readableRole})</span>
                            {isExpertRole && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-[10px] px-1.5 py-0 h-5"
                              >
                                <ShieldCheck className="mr-1 h-3 w-3" /> Zweryfikowany
                              </Badge>
                            )}
                            <Badge variant="secondary" className={`${verdictClass} text-[10px] px-1.5 py-0 h-5`}>
                              {verdictLabel}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(opinion.created_at).toLocaleDateString()}{' '}
                              {new Date(opinion.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {opinion.content ?? opinion.body ?? 'Brak treści'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                            <Badge variant="outline" className="text-[11px]">
                              Bilans głosów: {opinionScore > 0 ? `+${opinionScore}` : opinionScore}
                            </Badge>
                            <div className="flex gap-2 ml-auto">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => handleOpinionVote(opinion.id, 'up')}
                                disabled={!user || Boolean(opinionVoteState[opinion.id])}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" /> Popieram
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => handleOpinionVote(opinion.id, 'down')}
                                disabled={!user || Boolean(opinionVoteState[opinion.id])}
                              >
                                <ThumbsDown className="h-3 w-3 mr-1" /> Nie zgadzam się
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">Cena</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{formattedPrice ?? 'Cena niedostępna'}</div>
              <p className="text-sm text-muted-foreground">
                {formattedPrice ? `Waluta źródła: ${priceCurrency}` : 'Sprzedający nie podał kwoty początkowej'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zgłaszający</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{submitterInitials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium">{submitterLabel}</p>
                  <p className="text-sm text-muted-foreground">Dodano: {formattedCreationDatetime}</p>
                  <p className="text-xs text-muted-foreground">Źródło: {sourceLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Utworzono zgłoszenie
                </div>
                <div className="flex items-center gap-2">
                  <ShieldQuestion className="h-4 w-4 text-yellow-500" />
                  Analiza AI wykonana
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> {opinions.length} opinii społeczności
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
