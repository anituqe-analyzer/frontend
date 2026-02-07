import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Loader2, ArrowLeft, Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useCategories, useCreateAuction } from '@/hooks/useApiQueries';
import {
  validateAuctionFromUrl,
  predictAuctionAuthenticityEnsemble,
  type AIValidateUrlResponse,
  type AIEnsemblePredictResponse,
} from '@/services/api';

export function AddAuction() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') ?? '';
  const navigate = useNavigate();

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createAuctionMutation = useCreateAuction();

  const [isScraping, setIsScraping] = useState(false);
  const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);
  const [aiResult, setAiResult] = useState<AIValidateUrlResponse | AIEnsemblePredictResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    external_link: initialUrl,
    title: '',
    description_text: '',
    price: '',
    currency: 'PLN',
    category_id: '',
  });

  const handleScrapeData = useCallback(async (url: string) => {
    setIsScraping(true);
    setIsEvaluatingAI(true);
    setAiError(null);
    setAiResult(null);

    try {
      // Wywołanie AI API do scrapowania i oceny
      const result = await validateAuctionFromUrl({ url, max_images: 5 });

      if (result.status === 'success') {
        setAiResult(result);

        // Wypełnienie formularza danymi ze scrapowania
        setFormData((prev) => ({
          ...prev,
          title: result.title || prev.title,
          description_text: `Platforma: ${result.platform}\n\nAutomatycznie pobrane z: ${url}`,
          // Możesz też próbować wyciągnąć cenę, jeśli scraper ją zwraca
        }));
      } else {
        setAiError(result.error || 'Nie udało się przetworzyć aukcji');
      }
    } catch (error) {
      console.error('Error scraping auction:', error);
      setAiError(error instanceof Error ? error.message : 'Wystąpił błąd podczas scrapowania');
    } finally {
      setIsScraping(false);
      setIsEvaluatingAI(false);
    }
  }, []);

  useEffect(() => {
    if (initialUrl) {
      setFormData((prev) => ({ ...prev, external_link: initialUrl }));
      handleScrapeData(initialUrl);
    }
  }, [initialUrl, handleScrapeData]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleManualScrape = () => {
    if (formData.external_link) {
      handleScrapeData(formData.external_link);
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedImages(Array.from(files));
      setAiResult(null);
      setAiError(null);
    }
  };

  const handleEvaluateImages = async () => {
    if (uploadedImages.length === 0 || !formData.title) {
      setAiError('Dodaj zdjęcia i wypełnij tytuł przed oceną');
      return;
    }

    setIsEvaluatingAI(true);
    setAiError(null);
    setAiResult(null);

    try {
      const result = await predictAuctionAuthenticityEnsemble({
        images: uploadedImages,
        title: formData.title,
        description: formData.description_text || '',
      });

      if (result.status === 'success') {
        setAiResult(result);
      } else {
        setAiError(result.error || 'Nie udało się ocenić aukcji');
      }
    } catch (error) {
      console.error('Error evaluating images:', error);
      setAiError(error instanceof Error ? error.message : 'Wystąpił błąd podczas oceny');
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let platform = 'Manual';

    if (formData.external_link) {
      try {
        platform = new URL(formData.external_link).host;
      } catch {
        platform = 'Manual';
      }
    }

    const priceValue = formData.price ? parseFloat(formData.price) : undefined;

    createAuctionMutation.mutate(
      {
        external_link: formData.external_link,
        title: formData.title,
        description_text: formData.description_text,
        price: priceValue,
        currency: formData.currency,
        category_id: parseInt(formData.category_id, 10),
        platform,
      },
      {
        onSuccess: () => {
          alert('Zgłoszenie zostało dodane!');
          navigate('/dashboard');
        },
        onError: (error) => {
          console.error('Error creating auction:', error);
          alert('Wystąpił błąd podczas dodawania zgłoszenia.');
        },
      }
    );
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Powrót
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Zgłoś przedmiot do weryfikacji</CardTitle>
          <CardDescription>
            Wypełnij formularz, aby dodać nowy przedmiot do analizy. Możesz wkleić link, aby pobrać dane automatycznie.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  {isScraping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Pobierz dane
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Obsługiwane platformy: Allegro, OLX, eBay. Automatycznie scrapuje i ocenia aukcję przez AI.
              </p>
            </div>

            {aiResult && (
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Wynik oceny AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Werdykt:</span>
                    <Badge
                      variant={
                        aiResult.verdict === 'ORIGINAL'
                          ? 'default'
                          : aiResult.verdict === 'UNCERTAIN'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-sm px-3 py-1"
                    >
                      {aiResult.verdict === 'ORIGINAL' && <CheckCircle className="mr-1 h-4 w-4" />}
                      {aiResult.verdict === 'UNCERTAIN' && <AlertCircle className="mr-1 h-4 w-4" />}
                      {(aiResult.verdict === 'SCAM' || aiResult.verdict === 'REPLICA') && (
                        <XCircle className="mr-1 h-4 w-4" />
                      )}
                      {aiResult.verdict === 'ORIGINAL' && 'Autentyczny'}
                      {aiResult.verdict === 'SCAM' && 'Oszustwo'}
                      {aiResult.verdict === 'REPLICA' && 'Replika'}
                      {aiResult.verdict === 'UNCERTAIN' && 'Niepewny'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Autentyczność</span>
                      <span className="font-medium">{Math.round((aiResult.original_probability || 0) * 100)}%</span>
                    </div>
                    <Progress value={(aiResult.original_probability || 0) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Oszustwo</span>
                      <span className="font-medium">{Math.round((aiResult.scam_probability || 0) * 100)}%</span>
                    </div>
                    <Progress value={(aiResult.scam_probability || 0) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Replika</span>
                      <span className="font-medium">{Math.round((aiResult.replica_probability || 0) * 100)}%</span>
                    </div>
                    <Progress value={(aiResult.replica_probability || 0) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Pewność</span>
                    <span className="text-sm font-semibold">{Math.round((aiResult.confidence || 0) * 100)}%</span>
                  </div>
                  {'image_count_used' in aiResult && (
                    <p className="text-xs text-muted-foreground">
                      Przeanalizowano {aiResult.image_count_used} z {aiResult.total_images_available} dostępnych zdjęć
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {aiError && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Błąd oceny AI</p>
                      <p className="text-sm">{aiError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Szczegóły przedmiotu</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Nazwa przedmiotu *</Label>
                <Input id="title" placeholder="np. Szabla wz. 34" value={formData.title} onChange={handleInputChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category_id">Kategoria *</Label>
                <select
                  id="category_id"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Ładowanie...' : 'Wybierz kategorię...'}</option>
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
                <Label htmlFor="description_text">Opis / Dodatkowe informacje</Label>
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
              type="submit"
              size="lg"
              disabled={createAuctionMutation.isPending || !formData.title || !formData.category_id}
            >
              {createAuctionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Dodaj zgłoszenie
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
