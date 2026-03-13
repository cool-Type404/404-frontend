const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

function resolveApiBaseUrl(): string {
  if (!RAW_API_BASE_URL) return '';
  if (typeof window === 'undefined') return RAW_API_BASE_URL;
  if (RAW_API_BASE_URL.startsWith('/')) return RAW_API_BASE_URL;

  try {
    const resolvedUrl = new URL(RAW_API_BASE_URL, window.location.origin);

    // Avoid mixed-content failures on HTTPS deployments. In that case we fall back
    // to same-origin `/api/*`, which is what Vercel rewrites are configured for.
    if (window.location.protocol === 'https:' && resolvedUrl.protocol !== 'https:') {
      console.warn(`Ignoring insecure API base URL on HTTPS page: ${resolvedUrl.href}`);
      return '';
    }

    return RAW_API_BASE_URL;
  } catch {
    console.warn(`Ignoring invalid API base URL: ${RAW_API_BASE_URL}`);
    return '';
  }
}

const API_BASE_URL = resolveApiBaseUrl();

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
