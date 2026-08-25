const TOKEN_KEY = 'autorecall-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function apiBase() {
  return import.meta.env.VITE_API_URL || '/api';
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiBase()}${path}`, { ...options, headers });
  if (response.status === 401) {
    setToken(null);
    if (!path.startsWith('/auth/')) {
      window.location.href = '/auth/login';
    }
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.message && Array.isArray(payload.message)
        ? payload.message.join(' ')
        : payload?.message || 'Não foi possível concluir a operação.';
    throw new ApiError(message, response.status);
  }
  return payload as T;
}
