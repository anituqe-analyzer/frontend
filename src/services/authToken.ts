const TOKEN_STORAGE_KEY = 'antique_auth_token';
const isBrowser = typeof window !== 'undefined';

export function getAuthToken(): string | null {
  if (!isBrowser) return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  if (!isBrowser) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    accept: 'application/json',
  };

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export function getAuthHeadersWithContentType(): HeadersInit {
  return {
    ...getAuthHeaders(),
    'content-type': 'application/json',
  };
}
