import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

const EXPERT_TASKS = [
  {
    id: 101,
    title: "Szabla wz. 21 - weryfikacja sygnatury",
    image:
      "https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    user: "jan_kowalski",
    date: "2025-11-20",
    status: "pending",
    confidence: "45%",
  },
  {
    id: 102,
    title: "Obraz 'Pejzaż zimowy' - autentyczność",
    image:
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    user: "art_collector",
    date: "2025-11-19",
    status: "pending",
    confidence: "60%",
  },
];

const USER_OFFERS = [
  {
    id: 1,
    title: "Stara maszyna do pisania Underwood",
    status: "pending",
    date: "2025-11-21",
  },
  {
    id: 2,
    title: "Moneta 5 zł 1930 Sztandar",
    status: "verified",
    date: "2025-11-15",
  },
];

export function Dashboard() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Panel użytkownika
          </h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi zgłoszeniami i weryfikacjami.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Rola: Ekspert
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="my-offers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-offers">Moje zgłoszenia</TabsTrigger>
          <TabsTrigger value="expert-zone">Strefa Eksperta</TabsTrigger>
        </TabsList>

        <TabsContent value="my-offers">
          <Card>
            <CardHeader>
              <CardTitle>Twoje zgłoszenia</CardTitle>
              <CardDescription>
                Historia przedmiotów zgłoszonych przez Ciebie do weryfikacji.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {USER_OFFERS.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{offer.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Dodano: {offer.date}
                        </p>
                      </div>
                    </div>
                    <div>
                      {offer.status === "pending" && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Weryfikacja
                        </Badge>
                      )}
                      {offer.status === "verified" && (
                        <Badge className="bg-green-500">Zweryfikowano</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expert-zone">
          <Card className="border-muted/60 shadow-sm">
            <CardHeader>
              <CardTitle>Zadania dla eksperta</CardTitle>
              <CardDescription>
                Przedmioty wymagające Twojej oceny jako eksperta w kategorii
                "Militaria".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {EXPERT_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="group flex flex-col md:flex-row gap-6 p-4 border rounded-xl hover:bg-muted/30 hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="relative overflow-hidden rounded-lg w-full md:w-48 h-48 md:h-32 shrink-0">
                      <img
                        src={task.image}
                        alt={task.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Zgłaszający:{" "}
                            <span className="font-medium text-foreground">
                              {task.user}
                            </span>{" "}
                            • Data: {task.date}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="w-fit bg-background/50 backdrop-blur-sm"
                        >
                          AI Confidence:{" "}
                          <span
                            className={
                              parseInt(task.confidence) > 50
                                ? "text-green-600 ml-1 font-bold"
                                : "text-yellow-600 ml-1 font-bold"
                            }
                          >
                            {task.confidence}
                          </span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="shadow-sm"
                        >
                          <Link to={`/expert/task/${task.id}`}>
                            Zobacz szczegóły
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 shadow-sm"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Potwierdź
                          autentyczność
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="shadow-sm"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Oznacz jako
                          falsyfikat
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shadow-sm hover:bg-background"
                        >
                          <AlertCircle className="mr-2 h-4 w-4" /> Wymaga
                          dyskusji
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
