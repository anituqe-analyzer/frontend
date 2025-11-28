import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Loader2, ArrowLeft } from "lucide-react";
import { mockApi, type Category } from "@/services/mockApi";

export function AddAuction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    external_link: "",
    title: "",
    description_text: "",
    price: "",
    currency: "PLN",
    category_id: "",
  });

  useEffect(() => {
    mockApi.getCategories().then(setCategories);

    // Check for URL param
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setFormData((prev) => ({ ...prev, external_link: urlParam }));
      handleScrapeData(urlParam);
    }
  }, [searchParams]);

  const handleScrapeData = async (url: string) => {
    setIsScraping(true);
    // Simulate scraping delay
    setTimeout(() => {
      // Mock scraped data based on URL
      if (url.includes("allegro")) {
        setFormData((prev) => ({
          ...prev,
          title: "Przykładowy przedmiot z Allegro",
          description_text:
            "To jest automatycznie pobrany opis z aukcji Allegro...",
          price: "1250",
          currency: "PLN",
          category_id: "1", // Militaria
        }));
      } else if (url.includes("olx")) {
        setFormData((prev) => ({
          ...prev,
          title: "Znalezisko z OLX",
          description_text: "Opis pobrany z OLX...",
          price: "450",
          currency: "PLN",
          category_id: "6", // Inne
        }));
      }
      setIsScraping(false);
    }, 1500);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleManualScrape = () => {
    if (formData.external_link) {
      handleScrapeData(formData.external_link);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await mockApi.createAuction({
        submitted_by_user_id: 1, // Mock user ID
        external_link: formData.external_link,
        title: formData.title,
        description_text: formData.description_text,
        price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        category_id: parseInt(formData.category_id) || 6, // Default to 'Other'
        image:
          "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60", // Mock image
        platform: "Manual",
      });

      alert("Zgłoszenie zostało dodane!");
      navigate("/dashboard"); // Redirect to dashboard after success
    } catch (error) {
      console.error("Error creating auction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:pl-2 transition-all"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Powrót
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Zgłoś przedmiot do weryfikacji
          </CardTitle>
          <CardDescription>
            Wypełnij formularz, aby dodać nowy przedmiot do analizy. Możesz
            wkleić link, aby pobrać dane automatycznie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="external_link">Link do oferty (opcjonalnie)</Label>
            <div className="flex gap-2">
              <Input
                id="external_link"
                placeholder="https://allegro.pl/oferta/..."
                value={formData.external_link}
                onChange={handleInputChange}
              />
              <Button
                variant="secondary"
                onClick={handleManualScrape}
                disabled={isScraping || !formData.external_link}
              >
                {isScraping ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Pobierz dane
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Szczegóły przedmiotu
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Nazwa przedmiotu *</Label>
              <Input
                id="title"
                placeholder="np. Szabla wz. 34"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category_id">Kategoria *</Label>
              <select
                id="category_id"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.category_id}
                onChange={handleInputChange}
              >
                <option value="">Wybierz kategorię...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Cena</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Waluta</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  <option value="PLN">PLN</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="description_text">
                Opis / Dodatkowe informacje
              </Label>
              <Textarea
                id="description_text"
                placeholder="Opisz przedmiot, stan zachowania, wątpliwości..."
                className="min-h-[150px]"
                value={formData.description_text}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || !formData.category_id}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                Przetwarzanie...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Dodaj zgłoszenie
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
