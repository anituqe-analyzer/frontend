import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
} from "lucide-react";

const MOCK_OFFERS = [
  {
    id: 1,
    title: "Szabla polska wz. 1934 Ludwikówka",
    image:
      "https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    score: 98,
    status: "verified",
    platform: "Allegro",
    timeLeft: "2 dni",
    votes: 12,
  },
  {
    id: 2,
    title: "Złoty pierścionek z szafirem XIXw.",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    score: 12,
    status: "fake",
    platform: "OLX",
    timeLeft: "5 godz.",
    votes: -5,
  },
  {
    id: 3,
    title: "Stara maszyna do pisania Underwood",
    image:
      "https://images.unsplash.com/photo-1520223297774-895473945990?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    score: 45,
    status: "pending",
    platform: "Lokalnie",
    timeLeft: "1 dzień",
    votes: 2,
  },
  {
    id: 4,
    title: "Moneta 5 zł 1930 Sztandar",
    image:
      "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    score: 92,
    status: "verified",
    platform: "Allegro",
    timeLeft: "3 dni",
    votes: 8,
  },
];

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Wysokie prawdopodobieństwo";
  if (score >= 50) return "Niejednoznaczny";
  return "Wysokie ryzyko";
};

export function RecentOffers() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">
          Ostatnio sprawdzane oferty
        </h2>
        <Button variant="link">Zobacz wszystkie</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {MOCK_OFFERS.map((offer) => (
          <Card
            key={offer.id}
            className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted/60"
          >
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={offer.image}
                alt={offer.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-2 right-2 z-10">
                {offer.status === "verified" && (
                  <Badge className="bg-green-500/90 backdrop-blur-sm hover:bg-green-600 shadow-sm">
                    <CheckCircle className="mr-1 h-3 w-3" /> Autentyk
                  </Badge>
                )}
                {offer.status === "fake" && (
                  <Badge
                    variant="destructive"
                    className="opacity-90 backdrop-blur-sm shadow-sm"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" /> Falsyfikat
                  </Badge>
                )}
                {offer.status === "pending" && (
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
              <CardTitle className="line-clamp-2 text-base mb-2">
                {offer.title}
              </CardTitle>

              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {offer.score >= 80 ? (
                      <ShieldCheck className="h-3 w-3 text-green-500" />
                    ) : offer.score >= 50 ? (
                      <ShieldQuestion className="h-3 w-3 text-yellow-500" />
                    ) : (
                      <ShieldAlert className="h-3 w-3 text-red-500" />
                    )}
                    Autentyczność
                  </span>
                  <span
                    className={`font-bold ${
                      offer.score >= 80
                        ? "text-green-600"
                        : offer.score >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {offer.score}%
                  </span>
                </div>
                <Progress
                  value={offer.score}
                  className="h-2 bg-muted"
                  // Using a custom class to override the indicator color via CSS variable or direct child selector if possible,
                  // but since we can't easily pass classes to the indicator without modifying the component,
                  // we'll use the [&>div] selector which targets the first child (the indicator)
                  style={
                    {
                      "--primary":
                        offer.score >= 80
                          ? "142.1 76.2% 36.3%"
                          : offer.score >= 50
                          ? "45.4 93.4% 47.5%"
                          : "0 84.2% 60.2%",
                    } as React.CSSProperties
                  }
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {getScoreLabel(offer.score)}
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
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Szczegóły
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
