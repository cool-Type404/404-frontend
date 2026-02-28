import { useEffect, useRef } from 'react';
import markerDefaultImg from '@/assets/marker_default.png';

type KakaoLatLng = unknown;

type KakaoMapInstance = {
  getLevel: () => number;
  setLevel: (level: number, opts?: { animate?: boolean }) => void;
  setCenter: (latlng: KakaoLatLng) => void;
};

type KakaoMaps = {
  load: (cb: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number; zoomable?: boolean },
  ) => KakaoMapInstance;
  Marker: new (opts: { map: KakaoMapInstance; position: KakaoLatLng; image?: unknown }) => unknown;
  MarkerImage: new (src: string, size: KakaoSize) => unknown;
  Size: new (width: number, height: number) => KakaoSize;
  event: {
    addListener: (target: unknown, type: string, handler: () => void) => void;
  };
};

type KakaoSize = unknown;
type KakaoWindow = { maps: KakaoMaps };

// ── 추가: props 타입 ──────────────────────────────────────────
type MarkerData = {
  id: number;
  lat: number;
  lng: number;
  name: string;
};

type Props = {
  markers?: MarkerData[];
  onMarkerClick?: (storeId: number) => void;
};
// ─────────────────────────────────────────────────────────────

function getKakao(): KakaoWindow | null {
  const k = window.kakao as unknown as KakaoWindow | undefined;
  if (!k || !k.maps) return null;
  return k;
}

export default function KakaoMap({ markers = [], onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // ====== 🔥 부드러운 줌 핵심 파라미터 ======
    const LEVEL_MIN = 1;
    const LEVEL_MAX = 14;

    // 휠 입력을 얼마나 "쌓아야" 1칸 줌으로 처리할지 (값이 클수록 더 부드럽고 느림)
    const WHEEL_THRESHOLD = 180;

    // 연속 입력을 묶어서 적용하는 디바운스(ms) (클수록 더 부드럽고 느림)
    const APPLY_DELAY = 170;

    // 너무 빠르게 연속으로 바뀌는 걸 막는 최소 간격(ms)
    const RATE_LIMIT = 220;

    let wheelAcc = 0; // 휠 누적
    let applyTimer: number | null = null;
    let lastAppliedAt = 0;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const applyZoom = () => {
      applyTimer = null;

      const map = mapRef.current;
      if (!map) {
        wheelAcc = 0;
        return;
      }

      const now = Date.now();
      if (now - lastAppliedAt < RATE_LIMIT) {
        // 너무 빠르면 다음 기회로 미룸
        applyTimer = window.setTimeout(applyZoom, RATE_LIMIT - (now - lastAppliedAt));
        return;
      }

      // 누적된 휠로 몇 단계 움직일지 계산
      const steps = Math.trunc(wheelAcc / WHEEL_THRESHOLD);

      // steps가 0이면 아직 임계치 부족 -> 그냥 종료
      if (steps === 0) return;

      // 한 번에 너무 많이 점프하면 또 눈 아프니까, 최대 1칸만 적용(가장 안정적)
      const step = steps > 0 ? 1 : -1;

      const current = map.getLevel();
      const next = clamp(current + step, LEVEL_MIN, LEVEL_MAX);

      if (next !== current) {
        map.setLevel(next, { animate: true });
        lastAppliedAt = Date.now();
      }

      // 적용한 만큼 누적치에서 제거(잔여분은 다음에 이어서)
      wheelAcc -= step * WHEEL_THRESHOLD;

      // 아직도 임계치가 남아있으면(사용자가 계속 스크롤한 상태) 한 번 더 천천히 처리
      if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) {
        applyTimer = window.setTimeout(applyZoom, APPLY_DELAY);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // ✅ 트랙패드 환경에서 너무 민감하면 이 옵션 추천:
      // Ctrl 키 누를 때만 줌 허용(원하면 주석 해제)
      // if (!e.ctrlKey) return;

      const map = mapRef.current;
      if (!map) return;

      // deltaY가 환경마다 너무 크거나 작아서, "부드럽게" 보정
      // (큰 값은 살짝 줄이고 작은 값은 쌓이게)
      const dy = e.deltaY;

      // 누적 (dy > 0 : 줌아웃 방향)
      wheelAcc += dy;

      // 디바운스: 연속 입력을 묶어서 APPLY_DELAY 후 적용
      if (applyTimer) window.clearTimeout(applyTimer);
      applyTimer = window.setTimeout(applyZoom, APPLY_DELAY);
    };

    const initMap = () => {
      const kakao = getKakao();
      if (!kakao) return;

      kakao.maps.load(() => {
        const hongdae = new kakao.maps.LatLng(37.5563, 126.9236);

        const map = new kakao.maps.Map(container, {
          center: hongdae,
          level: 3,
          zoomable: false, // ✅ 기본 휠 줌 OFF
        });

        mapRef.current = map;

        container.addEventListener('wheel', onWheel, { passive: false });
      });
    };

    // SDK 이미 로드됨
    if (getKakao()) {
      initMap();
      return () => {
        if (applyTimer) window.clearTimeout(applyTimer);
        container.removeEventListener('wheel', onWheel);
      };
    }

    // SDK 로드 대기
    const script = document.querySelector(
      'script[src^="https://dapi.kakao.com/v2/maps/sdk.js"]',
    ) as HTMLScriptElement | null;

    if (!script) {
      console.error('Kakao Maps SDK script tag not found in index.html');
      return;
    }

    script.addEventListener('load', initMap);

    return () => {
      if (applyTimer) window.clearTimeout(applyTimer);
      script.removeEventListener('load', initMap);
      container.removeEventListener('wheel', onWheel);
    };
  }, []); // ✅ dependency 비워서 지도 재초기화 방지

  // ── markers 데이터 로드 후 마커 렌더링 (API 응답 오면 실행) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    const kakao = getKakao();
    if (!kakao) return;

    markers.forEach((m) => {
      const position = new kakao.maps.LatLng(m.lat, m.lng);

      const normalImage = new kakao.maps.MarkerImage(
        markerDefaultImg,
        new kakao.maps.Size(29, 42),
      );
      const hoverImage = new kakao.maps.MarkerImage(
        markerDefaultImg,
        new kakao.maps.Size(38, 55),
      );

      const marker = new kakao.maps.Marker({ map, position, image: normalImage });

      // 호버 시 마커 1.3배 확대
      kakao.maps.event.addListener(marker, 'mouseover', () => {
        (marker as { setImage: (img: unknown) => void }).setImage(hoverImage);
      });
      kakao.maps.event.addListener(marker, 'mouseout', () => {
        (marker as { setImage: (img: unknown) => void }).setImage(normalImage);
      });

      // 마커 클릭 시 지도 중심 이동 + onMarkerClick 호출
      kakao.maps.event.addListener(marker, 'click', () => {
        map.setCenter(position);
        if (onMarkerClick) onMarkerClick(m.id);
      });
    });
  }, [markers, onMarkerClick]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}