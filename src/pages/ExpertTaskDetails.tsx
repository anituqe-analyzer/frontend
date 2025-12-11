import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ImageMagnifier } from '@/components/ui/image-magnifier';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ShieldQuestion,
  Calendar,
  User,
  ExternalLink,
  MessageSquare,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

// Mock data for a specific task
const TASK_DETAILS = {
  id: 101,
  title: 'Szabla wz. 21 - weryfikacja sygnatury',
  description:
    'Proszę o weryfikację autentyczności szabli wz. 21. Sprzedający twierdzi, że to oryginał z 1925 roku, ale mam wątpliwości co do sygnatury na głowni. Załączam zdjęcia detali.',
  images: [
    'https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=800&auto=format&fit=crop&q=60',
  ],
  user: {
    name: 'Jan Kowalski',
    username: 'jan_kowalski',
    avatar: 'JK',
    reputation: 'Początkujący',
  },
  date: '2025-11-20',
  platform: 'Allegro',
  url: 'https://allegro.pl/oferta/przykladowa-szabla',
  aiAnalysis: {
    score: 45,
    confidence: 'Niska',
    flags: [
      {
        type: 'warning',
        message: 'Nietypowy kształt sygnatury dla tego rocznika',
      },
      { type: 'success', message: 'Materiały zgodne z epoką' },
      {
        type: 'danger',
        message: 'Podejrzana patyna (możliwe postarzanie chemiczne)',
      },
    ],
  },
  history: [
    {
      user: 'System AI',
      action: 'Wstępna analiza',
      date: '2025-11-20 14:30',
      comment: 'Wykryto nieścisłości w sygnaturze.',
    },
    {
      user: 'Marek Nowak (Ekspert)',
      action: 'Komentarz',
      date: '2025-11-20 16:15',
      comment: 'Potrzebuję lepszego zdjęcia rękojeści od spodu.',
    },
  ],
};

export function ExpertTaskDetails() {
  const { id } = useParams();
  const [ selectedImageIndex, setSelectedImageIndex ] = useState(0);
  const [ isLightboxOpen, setIsLightboxOpen ] = useState(false);

  // In a real app, we would fetch data based on ID
  const task = TASK_DETAILS;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do panelu
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
              <Badge variant="outline" className="text-sm">
                ID: {id}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" /> {task.user.name} (@
                {task.user.username})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {task.date}
              </span>
              <a
                href={task.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Link do oferty ({task.platform})
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Dyskusja
            </Button>
            <Button variant="destructive" className="gap-2">
              <XCircle className="h-4 w-4" /> Oznacz jako falsyfikat
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4" /> Potwierdź autentyczność
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-muted/60 shadow-sm">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <ImageMagnifier src={task.images[selectedImageIndex]} alt="Main view" />
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
                      src={task.images[selectedImageIndex]}
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

                    {task.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === 0 ? task.images.length - 1 : prev - 1));
                          }}
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === task.images.length - 1 ? 0 : prev + 1));
                          }}
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>
                      </>
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      {selectedImageIndex + 1} / {task.images.length}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-4 gap-2 p-2 bg-muted/20">
              {task.images.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    'aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all',
                    selectedImageIndex === i
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-primary/50'
                  )}
                  onClick={() => setSelectedImageIndex(i)}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opis zgłoszenia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">{task.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analysis & Details */}
        <div className="space-y-6">
          {/* AI Analysis Card */}
          <Card className="border-primary/20 shadow-md overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-primary/10">
              <h3 className="font-semibold flex items-center gap-2 text-primary">
                <ShieldQuestion className="h-5 w-5" /> Analiza AI 2.0
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-sm text-muted-foreground">Wskaźnik autentyczności</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-yellow-600">{task.aiAnalysis.score}%</span>
                </div>
                <Progress
                  value={task.aiAnalysis.score}
                  className="h-3"
                  style={{ '--primary': '45.4 93.4% 47.5%' } as React.CSSProperties}
                />
                <p className="text-sm font-medium text-yellow-600">Wynik niejednoznaczny</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Wykryte cechy:</h4>
                <ul className="space-y-2">
                  {task.aiAnalysis.flags.map((flag, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      {flag.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />}
                      {flag.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                      {flag.type === 'danger' && <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />}
                      <span className="text-muted-foreground">{flag.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zgłaszający</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{task.user.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.user.name}</p>
                  <p className="text-sm text-muted-foreground">Reputacja: {task.user.reputation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History/Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historia weryfikacji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 border-l space-y-6">
                {task.history.map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                      <span className="font-medium text-sm">{event.user}</span>
                      <span className="text-sm text-muted-foreground">{event.action}</span>
                      {event.comment && (
                        <p className="text-sm bg-muted/50 p-2 rounded mt-1 italic">"{event.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
