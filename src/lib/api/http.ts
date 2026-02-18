type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpOptions = Omit<RequestInit, 'method' | 'body'> & {
  method?: HttpMethod;
  body?: unknown; // 객체 넣으면 JSON으로 변환해줌
};

/**
 * Vite proxy를 쓰는 전제:
 * - 개발: /api -> http://localhost:8080/api 로 프록시됨 (CORS 회피)
 * - 배포: 서버에서 /api 라우팅을 백엔드로 연결
 */
export async function http<T>(url: string, options: HttpOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, ...rest } = options;

  const res = await fetch(url, {
    method,
    credentials: 'include', // 쿠키 기반 인증 가능성 대비 (필요 없으면 나중에 제거)
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    // 백엔드가 에러 메시지를 text로 줄 수도 있어서 일단 text로 받기
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `HTTP ${res.status}`);
  }

  // 204 No Content 같은 응답이면 json 파싱이 터질 수 있음
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
