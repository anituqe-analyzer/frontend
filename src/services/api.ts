import { getAuthToken, setAuthToken, clearAuthToken, getAuthHeaders, getAuthHeadersWithContentType } from './authToken';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
// const AI_API_BASE_URL = (import.meta.env.VITE_AI_API_URL ?? 'https://hatamo-antiqueauthbackend.hf.space').replace(
//   /\/$/,
//   ''
// );

export class ApiError extends Error {
  status: number;

  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Re-export token functions for backward compatibility
export const getStoredToken = getAuthToken;
export const storeToken = setAuthToken;
export const clearStoredToken = clearAuthToken;

function unwrapData<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function coerceArray<T>(payload: unknown, nestedKeys: Array<keyof Record<string, unknown>> = []): T[] | null {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    for (const key of nestedKeys) {
      const candidate = (payload as Record<string, unknown>)[key as string];

      if (Array.isArray(candidate)) {
        return candidate as T[];
      }
    }
  }

  return null;
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

function derivePlatform(link?: string | null): string | null {
  if (!link) return null;

  try {
    const url = new URL(link);

    return url.hostname.replace(/^www\./, '');
  } catch (error) {
    console.warn('Nie udało się wyznaczyć platformy z linku', error);

    return 'Zewnętrzna aukcja';
  }
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1520223297774-895473945990?w=800&auto=format&fit=crop&q=60',
];

function normalizeAuction(raw: BackendAuction): Auction {
  const price = parseNumber(raw.price);
  const imageGallery = raw.images && raw.images.length > 0 ? raw.images : FALLBACK_IMAGES;

  return {
    id: raw.id,
    title: raw.title,
    description_text: raw.description,
    price,
    currency: raw.currency ?? 'USD',
    external_link: raw.external_link,
    verification_status: raw.verification_status,
    ai_score_authenticity: raw.ai_score_authenticity,
    ai_uncertainty_message: raw.ai_uncertainty_message,
    category_id: raw.category?.id ?? null,
    category_name: raw.category?.name ?? null,
    submitted_by_user_id: raw.submitted_by?.id ?? null,
    submitted_by_username: raw.submitted_by?.username ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    image: imageGallery[0],
    image_gallery: imageGallery,
    platform: derivePlatform(raw.external_link) ?? raw.category?.name ?? null,
    votes: null,
    votes_authentic: null,
    votes_fake: null,
    timeLeft: null,
  };
}

export type VerificationStatus =
  | 'pending'
  | 'pending_ai'
  | 'ai_verified'
  | 'ai_verified_authentic'
  | 'ai_verified_fake'
  | 'needs_human_verification'
  | 'community_verified'
  | 'expert_verified'
  | 'disputed'
  | 'fake'
  | 'rejected'
  | (string & {});

interface BackendAuctionCategory {
  id: number;
  name: string;
}

interface BackendAuctionUser {
  id: number;
  username: string;
}

interface BackendAuction {
  id: number;
  title: string;
  description: string;
  price: string | number | null;
  currency: string | null;
  external_link: string | null;
  verification_status: VerificationStatus;
  ai_score_authenticity: number | null;
  ai_uncertainty_message: string | null;
  category?: BackendAuctionCategory | null;
  submitted_by?: BackendAuctionUser | null;
  images?: string[] | null;
  created_at: string;
  updated_at: string;
}

interface CategoryDetailResponse {
  id: number;
  name: string;
  description?: string | null;
  auctions?: BackendAuction[];
  recent_auctions?: BackendAuction[];
  items?: BackendAuction[];
  data?: BackendAuction[];
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface Auction {
  id: number;
  submitted_by_user_id?: number | null;
  submitted_by_username?: string | null;
  external_link?: string | null;
  title: string;
  description_text: string;
  price?: number | null;
  currency?: string | null;
  verification_status?: VerificationStatus;
  ai_score_authenticity?: number | null;
  ai_uncertainty_message?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  created_at: string;
  updated_at: string;
  image?: string | null;
  image_gallery?: string[];
  platform?: string | null;
  votes?: number | null;
  votes_authentic?: number | null;
  votes_fake?: number | null;
  timeLeft?: string | null;
}

export interface Opinion {
  id: number;
  content: string;
  verdict: OpinionVerdict | null;
  author_type: OpinionAuthorType;
  score?: number | null;
  user?: OpinionUser;
  auction?: OpinionAuction;
  votes_count?: number;
  created_at: string;
  user_avatar?: string | null;
  body?: string | null;
}

export type OpinionAuthorType = 'user' | 'expert';

export interface OpinionUser {
  id: number;
  username: string;
  role?: UserRole;
}

export interface OpinionAuction {
  id: number;
  title: string;
}

export type OpinionVerdict = 'authentic' | 'fake' | 'uncertain';

export type UserRole = 'user' | 'expert' | 'admin';

export interface User {
  id: number;
  email: string;
  username?: string;
  role?: UserRole;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface CreateAuctionPayload {
  external_link: string;
  title: string;
  description_text: string;
  price?: number;
  currency?: string;
  category_id: number;
  image?: string;
  platform?: string;
}

export interface AuctionFilters {
  categoryId?: number;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface VoteResponse {
  votes_authentic: number;
  votes_fake: number;
}

export interface OpinionVotePayload {
  vote_type: 'upvote' | 'downvote';
}

export async function login(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Login failed', response.status, error);
  }

  return response.json() as Promise<LoginResponse>;
}

export async function getCurrentUser(token?: string | null) {
  const authToken = token ?? getAuthToken();
  const headers: HeadersInit = authToken
    ? { accept: 'application/json', authorization: `Bearer ${authToken}` }
    : { accept: 'application/json' };

  const response = await fetch(`${API_BASE_URL}/user`, { headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to get user', response.status, error);
  }

  return response.json() as Promise<User>;
}

export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to fetch categories', response.status, error);
  }

  const data = (await response.json()) as Category[] | { data: Category[] } | { categories?: Category[] };
  const normalized = unwrapData(data);
  const list = coerceArray<Category>(normalized, ['categories', 'items', 'results']);
  if (list) return list;

  return [];
}

export async function getAuctions(filters: AuctionFilters = {}) {
  if (filters.categoryId) {
    const response = await fetch(`${API_BASE_URL}/categories/${filters.categoryId}`, { headers: getAuthHeaders() });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(error.message || 'Failed to fetch auctions', response.status, error);
    }

    const category = (await response.json()) as CategoryDetailResponse;
    const normalizedList =
      coerceArray<BackendAuction>(category, ['auctions', 'recent_auctions', 'items', 'data']) ??
      (Array.isArray(category.recent_auctions) ? category.recent_auctions : null);

    if (normalizedList) {
      return normalizedList.map(normalizeAuction);
    }

    return [];
  }

  const response = await fetch(`${API_BASE_URL}/auctions`, { headers: getAuthHeaders() });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to fetch auctions', response.status, error);
  }

  const data = (await response.json()) as
    | BackendAuction[]
    | { data: BackendAuction[] }
    | { auctions?: BackendAuction[] };
  const normalized = unwrapData(data);
  const list = coerceArray<BackendAuction>(normalized, ['auctions', 'items', 'results']);

  if (list) {
    return list.map(normalizeAuction);
  }

  return [];
}

export async function getAuctionById(id: number) {
  const response = await fetch(`${API_BASE_URL}/auctions/${id}`, { headers: getAuthHeaders() });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to fetch auction', response.status, error);
  }

  const raw = (await response.json()) as BackendAuction;
  return normalizeAuction(raw);
}

export async function createAuction(payload: CreateAuctionPayload) {
  const { description_text, ...rest } = payload;
  const response = await fetch(`${API_BASE_URL}/auctions`, {
    method: 'POST',
    headers: getAuthHeadersWithContentType(),
    body: JSON.stringify({
      auction: {
        ...rest,
        description_text,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to create auction', response.status, error);
  }

  const raw = (await response.json()) as BackendAuction;
  return normalizeAuction(raw);
}

export async function getAuctionOpinions(auctionId: number) {
  const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/opinions`, { headers: getAuthHeaders() });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to fetch opinions', response.status, error);
  }

  const data = (await response.json()) as
    | Opinion[]
    | { data: Opinion[] }
    | { opinions?: Opinion[] }
    | { items?: Opinion[] };
  const normalized = unwrapData(data);
  const list = coerceArray<Opinion>(normalized, ['opinions', 'items', 'results']);
  if (list) return list;
  if (Array.isArray(normalized)) return normalized;
  return [];
}

export async function createOpinion(auctionId: number, content: string, verdict: OpinionVerdict = 'uncertain') {
  const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/opinions`, {
    method: 'POST',
    headers: getAuthHeadersWithContentType(),
    body: JSON.stringify({
      opinion: {
        content,
        verdict,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to create opinion', response.status, error);
  }

  return response.json() as Promise<Opinion>;
}

export async function voteOpinion(opinionId: number, payload: OpinionVotePayload) {
  const response = await fetch(`${API_BASE_URL}/opinions/${opinionId}/vote`, {
    method: 'POST',
    headers: getAuthHeadersWithContentType(),
    body: JSON.stringify({ vote: payload }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || 'Failed to vote on opinion', response.status, error);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

// Note: Auction voting endpoint not documented in API
// export async function voteAuction(auctionId: number, voteType: 'authentic' | 'fake'): Promise<VoteResponse> {
//   const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/vote`, {
//     method: 'POST',
//     headers: getAuthHeadersWithContentType(),
//     body: JSON.stringify({
//       vote: {
//         vote_type: voteType === 'authentic' ? 1 : -1,
//       },
//     }),
//   });
//
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}));
//     throw new ApiError(error.message || 'Failed to vote on auction', response.status, error);
//   }
//
//   return response.json() as Promise<VoteResponse>;
// }

// ==============================================
// AI API - Auction Authenticity Evaluation
// ==============================================

export interface AIPredictPayload {
  image: File;
  title: string;
  description: string;
}

export interface AIPredictResponse {
  status: 'success' | 'error';
  original_probability: number;
  scam_probability: number;
  replica_probability: number;
  verdict: 'ORIGINAL' | 'SCAM' | 'REPLICA' | 'UNCERTAIN';
  confidence: number;
  margin: number;
  message?: string;
  error?: string;
}

export interface AIEnsemblePredictPayload {
  images: File[];
  title: string;
  description: string;
}

export interface AIEnsemblePredictResponse {
  status: 'success' | 'error';
  image_count: number;
  original_probability: number;
  scam_probability: number;
  replica_probability: number;
  verdict: 'ORIGINAL' | 'SCAM' | 'REPLICA' | 'UNCERTAIN';
  confidence: number;
  margin: number;
  per_image_probs?: number[][];
  error?: string;
}

export interface AIValidateUrlPayload {
  url: string;
  max_images?: number;
}

export interface AIValidateUrlResponse {
  status: 'success' | 'error';
  url?: string;
  title?: string;
  platform?: string;
  total_images_available?: number;
  requested_max_images?: number;
  image_count_used?: number;
  original_probability?: number;
  scam_probability?: number;
  replica_probability?: number;
  verdict?: 'ORIGINAL' | 'SCAM' | 'REPLICA' | 'UNCERTAIN';
  confidence?: number;
  margin?: number;
  error?: string;
  traceback?: string;
}

/**
 * Ocena autentyczności aukcji na podstawie pojedynczego zdjęcia
 *
 * MOCK: Backend AI obecnie niedostępny - zwraca przykładowe dane
 */
export async function predictAuctionAuthenticity(_payload: AIPredictPayload): Promise<AIPredictResponse> {
  // MOCK: Symulacja opóźnienia API
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // MOCK: Generowanie losowych prawdopodobieństw
  const originalProb = Math.random() * 0.4 + 0.5; // 0.5-0.9
  const scamProb = Math.random() * 0.2;
  const replicaProb = 1 - originalProb - scamProb;

  const probs = {
    ORIGINAL: originalProb,
    SCAM: scamProb,
    REPLICA: replicaProb,
  };

  const verdict = Object.keys(probs).reduce((a, b) =>
    probs[a as keyof typeof probs] > probs[b as keyof typeof probs] ? a : b
  ) as 'ORIGINAL' | 'SCAM' | 'REPLICA';

  return {
    status: 'success',
    original_probability: originalProb,
    scam_probability: scamProb,
    replica_probability: replicaProb,
    verdict: verdict,
    confidence: Math.max(originalProb, scamProb, replicaProb),
    margin: Math.max(originalProb, scamProb, replicaProb) - Math.min(originalProb, scamProb, replicaProb),
    message: `Aukcja ma ${Math.round(Math.max(originalProb, scamProb, replicaProb) * 100)}% pewności: ${verdict}`,
  };

  // PRAWDZIWE WYWOŁANIE API (wyłączone)
  // const formData = new FormData();
  // formData.append('image', payload.image);
  // formData.append('title', payload.title);
  // formData.append('description', payload.description);
  //
  // const response = await fetch(`${AI_API_BASE_URL}/predict`, {
  //   method: 'POST',
  //   body: formData,
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json().catch(() => ({}));
  //   throw new ApiError(error.error || 'AI prediction failed', response.status, error);
  // }
  //
  // return response.json() as Promise<AIPredictResponse>;
}

/**
 * Ocena autentyczności aukcji na podstawie wielu zdjęć (ensemble)
 *
 * MOCK: Backend AI obecnie niedostępny - zwraca przykładowe dane
 */
export async function predictAuctionAuthenticityEnsemble(
  payload: AIEnsemblePredictPayload
): Promise<AIEnsemblePredictResponse> {
  // MOCK: Symulacja opóźnienia API
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // MOCK: Generowanie losowych prawdopodobieństw (wyższe dla authentic przy większej liczbie zdjęć)
  const imageCount = payload.images.length;
  const bonus = Math.min(imageCount * 0.05, 0.2); // Bonus za więcej zdjęć

  const originalProb = Math.random() * 0.3 + 0.5 + bonus; // 0.5-1.0
  const scamProb = Math.random() * 0.15;
  const replicaProb = Math.max(0, 1 - originalProb - scamProb);

  const normalized = originalProb + scamProb + replicaProb;
  const finalOriginal = originalProb / normalized;
  const finalScam = scamProb / normalized;
  const finalReplica = replicaProb / normalized;

  const probs = {
    ORIGINAL: finalOriginal,
    SCAM: finalScam,
    REPLICA: finalReplica,
  };

  const verdict = Object.keys(probs).reduce((a, b) =>
    probs[a as keyof typeof probs] > probs[b as keyof typeof probs] ? a : b
  ) as 'ORIGINAL' | 'SCAM' | 'REPLICA';

  // MOCK: Generowanie per-image probs
  const perImageProbs = payload.images.map(() => [Math.random() * 0.4 + 0.4, Math.random() * 0.2, Math.random() * 0.2]);

  return {
    status: 'success',
    image_count: imageCount,
    original_probability: finalOriginal,
    scam_probability: finalScam,
    replica_probability: finalReplica,
    verdict: verdict,
    confidence: Math.max(finalOriginal, finalScam, finalReplica),
    margin: Math.max(finalOriginal, finalScam, finalReplica) - Math.min(finalOriginal, finalScam, finalReplica),
    per_image_probs: perImageProbs,
  };

  // PRAWDZIWE WYWOŁANIE API (wyłączone)
  // const formData = new FormData();
  //
  // for (const image of payload.images) {
  //   formData.append('images', image);
  // }
  //
  // formData.append('title', payload.title);
  // formData.append('description', payload.description);
  //
  // const response = await fetch(`${AI_API_BASE_URL}/predict_ensemble`, {
  //   method: 'POST',
  //   body: formData,
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json().catch(() => ({}));
  //   throw new ApiError(error.error || 'AI ensemble prediction failed', response.status, error);
  // }
  //
  // return response.json() as Promise<AIEnsemblePredictResponse>;
}

/**
 * Walidacja aukcji bezpośrednio z URL (scraping + ocena AI)
 * Obsługuje platformy: Allegro, OLX, eBay
 *
 * MOCK: Backend AI obecnie niedostępny - zwraca przykładowe dane
 */
export async function validateAuctionFromUrl(payload: AIValidateUrlPayload): Promise<AIValidateUrlResponse> {
  // MOCK: Symulacja opóźnienia API (scraping + analiza)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // MOCK: Wykrycie platformy z URL
  let platform = 'nieznana';
  if (payload.url.includes('allegro')) platform = 'Allegro';
  else if (payload.url.includes('olx')) platform = 'OLX';
  else if (payload.url.includes('ebay')) platform = 'eBay';

  // MOCK: Generowanie tytułu na podstawie platformy
  const titles = {
    Allegro: 'Antyczny zegar ścienny z XIX wieku',
    OLX: 'Stara porcelanowa figurka',
    eBay: 'Vintage pocket watch',
    nieznana: 'Przedmiot antykwaryczny',
  };

  const maxImages = payload.max_images || 3;
  const totalAvailable = Math.floor(Math.random() * 5) + 3; // 3-7 zdjęć
  const imagesUsed = Math.min(maxImages, totalAvailable);

  // MOCK: Generowanie prawdopodobieństw
  const originalProb = Math.random() * 0.35 + 0.55; // 0.55-0.9
  const scamProb = Math.random() * 0.15;
  const replicaProb = Math.max(0, 1 - originalProb - scamProb);

  const normalized = originalProb + scamProb + replicaProb;
  const finalOriginal = originalProb / normalized;
  const finalScam = scamProb / normalized;
  const finalReplica = replicaProb / normalized;

  const maxProb = Math.max(finalOriginal, finalScam, finalReplica);
  const sortedProbs = [finalOriginal, finalScam, finalReplica].sort((a, b) => b - a);
  const margin = sortedProbs[0] - sortedProbs[1];

  let verdict: 'ORIGINAL' | 'SCAM' | 'REPLICA' | 'UNCERTAIN' = 'UNCERTAIN';
  if (maxProb >= 0.6 && margin >= 0.15) {
    if (finalOriginal === maxProb) verdict = 'ORIGINAL';
    else if (finalScam === maxProb) verdict = 'SCAM';
    else verdict = 'REPLICA';
  }

  return {
    status: 'success',
    url: payload.url,
    title: titles[platform as keyof typeof titles],
    platform: platform,
    total_images_available: totalAvailable,
    requested_max_images: maxImages,
    image_count_used: imagesUsed,
    original_probability: finalOriginal,
    scam_probability: finalScam,
    replica_probability: finalReplica,
    verdict: verdict,
    confidence: maxProb,
    margin: margin,
  };

  // PRAWDZIWE WYWOŁANIE API (wyłączone)
  // const formData = new FormData();
  // formData.append('url', payload.url);
  //
  // if (payload.max_images !== undefined) {
  //   formData.append('max_images', payload.max_images.toString());
  // }
  //
  // const response = await fetch(`${AI_API_BASE_URL}/validate_url`, {
  //   method: 'POST',
  //   body: formData,
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json().catch(() => ({}));
  //   throw new ApiError(error.error || 'URL validation failed', response.status, error);
  // }
  //
  // return response.json() as Promise<AIValidateUrlResponse>;
}

/**
 * Health check AI API
 *
 * MOCK: Backend AI obecnie niedostępny - zwraca mock status
 */
export async function checkAIApiHealth(): Promise<{ status: string; message: string }> {
  // MOCK: Symulacja sprawdzenia statusu
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    status: 'ok',
    message: 'AI API running (MOCK MODE)',
  };

  // PRAWDZIWE WYWOŁANIE API (wyłączone)
  // const response = await fetch(`${AI_API_BASE_URL}/health`);
  //
  // if (!response.ok) {
  //   throw new ApiError('AI API health check failed', response.status);
  // }
  //
  // return response.json();
}

export const api = {
  login,
  getCurrentUser,
  getCategories,
  getAuctions,
  getAuctionById,
  createAuction,
  getAuctionOpinions,
  createOpinion,
  voteOpinion,
  // voteAuction, // Not in API documentation
  getStoredToken,
  storeToken,
  clearStoredToken,
  // AI API
  predictAuctionAuthenticity,
  predictAuctionAuthenticityEnsemble,
  validateAuctionFromUrl,
  checkAIApiHealth,
};
