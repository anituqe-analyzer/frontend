const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
const TOKEN_STORAGE_KEY = 'antique_auth_token';

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

const isBrowser = typeof window !== 'undefined';

export function getStoredToken() {
  if (!isBrowser) return null;

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string) {
  if (!isBrowser) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  if (!isBrowser) return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const method = options.method ?? 'GET';
  const headers = new Headers(options.headers ?? {});
  const bodyIsFormData = options.body instanceof FormData;

  if (!bodyIsFormData && method !== 'GET' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const token = options.skipAuth ? null : (options.token ?? getStoredToken());

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const init: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET' && options.body !== undefined) {
    init.body = bodyIsFormData ? (options.body as BodyInit) : JSON.stringify(options.body);
  }

  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    throw new ApiError('Nie udało się nawiązać połączenia z serwerem', 0, error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let parsedBody: unknown = null;
  const raw = await response.text();

  if (raw) {
    try {
      parsedBody = JSON.parse(raw);
    } catch (error) {
      throw new ApiError('Serwer zwrócił nieprawidłową odpowiedź', response.status, error);
    }
  }

  if (!response.ok) {
    const message =
      (parsedBody as { message?: string } | null)?.message ?? `Żądanie zakończyło się błędem (${response.status})`;
    throw new ApiError(message, response.status, parsedBody);
  }

  return parsedBody as T;
}

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

export type OpinionVerdict = 'authentic' | 'fake' | 'unsure';

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
  vote_type: 1 | -1;
}

export async function login(payload: LoginPayload) {
  return request<LoginResponse>('/login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function getCurrentUser(token?: string | null) {
  return request<User>('/user', {
    token: token ?? undefined,
  });
}

export async function getCategories() {
  const response = await request<Category[] | { data: Category[] } | { categories?: Category[] }>('/categories');
  const normalized = unwrapData(response);
  const list = coerceArray<Category>(normalized, ['categories', 'items', 'results']);
  if (list) return list;

  return [];
}

export async function getAuctions(filters: AuctionFilters = {}) {
  if (filters.categoryId) {
    const category = await request<CategoryDetailResponse>(`
      s/${filters.categoryId}`);
    const normalizedList =
      coerceArray<BackendAuction>(category, ['auctions', 'recent_auctions', 'items', 'data']) ??
      (Array.isArray(category.recent_auctions) ? category.recent_auctions : null);

    if (normalizedList) {
      return normalizedList.map(normalizeAuction);
    }

    return [];
  }

  const response = await request<BackendAuction[] | { data: BackendAuction[] } | { auctions?: BackendAuction[] }>(
    '/auctions'
  );
  const normalized = unwrapData(response);
  const list = coerceArray<BackendAuction>(normalized, ['auctions', 'items', 'results']);

  if (list) {
    return list.map(normalizeAuction);
  }

  return [];
}

export async function getAuctionById(id: number) {
  const raw = await request<BackendAuction>(`/auctions/${id}`);

  return normalizeAuction(raw);
}

export async function createAuction(payload: CreateAuctionPayload) {
  const { description_text, ...rest } = payload;
  const raw = await request<BackendAuction>('/auctions', {
    method: 'POST',
    body: {
      auction: {
        ...rest,
        description_text,
      },
    },
  });

  return normalizeAuction(raw);
}

export async function getAuctionOpinions(auctionId: number) {
  const response = await request<Opinion[] | { data: Opinion[] } | { opinions?: Opinion[] } | { items?: Opinion[] }>(
    `/auctions/${auctionId}/opinions`
  );
  const normalized = unwrapData(response);
  const list = coerceArray<Opinion>(normalized, ['opinions', 'items', 'results']);
  if (list) return list;
  if (Array.isArray(normalized)) return normalized;
  return [];
}

export async function createOpinion(auctionId: number, content: string, verdict: OpinionVerdict = 'unsure') {
  return request<Opinion>(`/auctions/${auctionId}/opinions`, {
    method: 'POST',
    body: {
      opinion: {
        content,
        body: content,
        verdict,
      },
    },
  });
}

export async function voteOpinion(opinionId: number, payload: OpinionVotePayload) {
  return request(`/opinions/${opinionId}/vote`, {
    method: 'POST',
    body: { vote: payload },
  });
}

export async function voteAuction(auctionId: number, voteType: 'authentic' | 'fake'): Promise<VoteResponse> {
  return request<VoteResponse>(`/auctions/${auctionId}/vote`, {
    method: 'POST',
    body: {
      vote: {
        vote_type: voteType === 'authentic' ? 1 : -1,
      },
    },
  });
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
  voteAuction,
  getStoredToken,
  storeToken,
  clearStoredToken,
};
