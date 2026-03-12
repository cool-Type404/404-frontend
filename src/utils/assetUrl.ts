const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function normalizeApiPath(path: string): string {
  if (path.startsWith('/api/')) return path;
  if (path.startsWith('/')) return `/api${path}`;
  return `/api/${path}`;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function toApiUrl(path?: string | null): string {
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const normalizedPath = normalizeApiPath(path);
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

export function toApiAssetUrl(path?: string | null): string {
  return toApiUrl(path);
}
