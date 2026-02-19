export function toApiAssetUrl(path?: string | null) {
  if (!path) return '';

  // 이미 절대 URL이면 그대로 사용 (혹시 CDN 등)
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // 이미 /api 로 시작하면 그대로
  if (path.startsWith('/api/')) return path;

  // /로 시작하면 /api를 앞에 붙여서 프록시 타게 함
  if (path.startsWith('/')) return `/api${path}`;

  // 그 외(상대경로)는 /api/ 로 보정
  return `/api/${path}`;
}
