import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useValidateAuctionFromUrl } from '@/hooks/useApiQueries';
import type { AIValidateUrlResponse } from '@/services/api';

export function AddAuction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const validateUrlMutation = useValidateAuctionFromUrl();
  const lastValidatedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const url = searchParams.get('url');
    if (!url) return;

    if (lastValidatedUrlRef.current === url) return;
    lastValidatedUrlRef.current = url;

    validateUrlMutation
      .mutateAsync({ url, max_images: 5 })
      .then((result) => {
        const response = result as AIValidateUrlResponse & {
          validation_result?: { auction?: { id?: number } };
          auction_id?: number;
          id?: number;
        };
        const auctionId = response.validation_result?.auction?.id ?? response.auction_id ?? response.id;

        if (auctionId) {
          navigate(`/auction/${auctionId}`);
        }
      })
      .catch((error) => {
        console.error('Error validating auction URL:', error);
      });
  }, [navigate, searchParams, validateUrlMutation]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="text-lg text-blue-600">Trwa analizowanie aukcji. Prosze czekac...</p>
    </div>
  );
}

