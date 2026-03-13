import { useEffect, useRef } from 'react';
import markerDefaultImg from '@/assets/marker_default.png';

type KakaoLatLng = unknown;
type KakaoSize = unknown;

type KakaoMapInstance = {
  getLevel: () => number;
  setLevel: (level: number, opts?: { animate?: boolean }) => void;
  setCenter: (latlng: KakaoLatLng) => void;
};

type KakaoMarker = {
  setMap: (map: KakaoMapInstance | null) => void;
  setImage: (img: unknown) => void;
};

type KakaoMaps = {
  load: (cb: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number; zoomable?: boolean },
  ) => KakaoMapInstance;
  Marker: new (opts: { map: KakaoMapInstance; position: KakaoLatLng; image?: unknown }) => KakaoMarker;
  MarkerImage: new (src: string, size: KakaoSize) => unknown;
  Size: new (width: number, height: number) => KakaoSize;
  event: {
    addListener: (target: unknown, type: string, handler: () => void) => void;
  };
};

type KakaoWindow = { maps: KakaoMaps };

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

const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';
// Kakao JS keys are public client-side identifiers. Allow env override, but keep a
// fallback so production builds still boot when only local env was configured.
const KAKAO_JS_KEY = (import.meta.env.VITE_KAKAO_JS_KEY ?? '86fcd9b3720003037c6d28e7b30cf25b').trim();

function getKakao(): KakaoWindow | null {
  const kakao = window.kakao as unknown as KakaoWindow | undefined;
  if (!kakao?.maps) return null;
  return kakao;
}

function loadKakaoSdk(): Promise<KakaoWindow | null> {
  const existingKakao = getKakao();
  if (existingKakao) return Promise.resolve(existingKakao);

  if (!KAKAO_JS_KEY) {
    console.error('Kakao Maps JS key is missing.');
    return Promise.resolve(null);
  }

  const existingScript = document.querySelector('script[data-kakao-sdk="true"]') as HTMLScriptElement | null;

  if (existingScript) {
    return new Promise((resolve) => {
      if (getKakao()) {
        resolve(getKakao());
        return;
      }

      const handleLoad = () => resolve(getKakao());
      const handleError = () => {
        console.error('Failed to load Kakao Maps SDK.');
        resolve(null);
      };

      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `${KAKAO_SDK_URL}?appkey=${encodeURIComponent(KAKAO_JS_KEY)}&libraries=services&autoload=false`;
    script.async = true;
    script.setAttribute('data-kakao-sdk', 'true');

    script.addEventListener(
      'load',
      () => {
        resolve(getKakao());
      },
      { once: true },
    );

    script.addEventListener(
      'error',
      () => {
        console.error('Failed to load Kakao Maps SDK.');
        resolve(null);
      },
      { once: true },
    );

    document.head.appendChild(script);
  });
}

export default function KakaoMap({ markers = [], onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markerRefs = useRef<KakaoMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const levelMin = 1;
    const levelMax = 14;
    const wheelThreshold = 180;
    const applyDelay = 170;
    const rateLimit = 220;

    let wheelAcc = 0;
    let applyTimer: number | null = null;
    let lastAppliedAt = 0;

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const applyZoom = () => {
      applyTimer = null;

      const map = mapRef.current;
      if (!map) {
        wheelAcc = 0;
        return;
      }

      const now = Date.now();
      if (now - lastAppliedAt < rateLimit) {
        applyTimer = window.setTimeout(applyZoom, rateLimit - (now - lastAppliedAt));
        return;
      }

      const steps = Math.trunc(wheelAcc / wheelThreshold);
      if (steps === 0) return;

      const step = steps > 0 ? 1 : -1;
      const current = map.getLevel();
      const next = clamp(current + step, levelMin, levelMax);

      if (next !== current) {
        map.setLevel(next, { animate: true });
        lastAppliedAt = Date.now();
      }

      wheelAcc -= step * wheelThreshold;

      if (Math.abs(wheelAcc) >= wheelThreshold) {
        applyTimer = window.setTimeout(applyZoom, applyDelay);
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (!mapRef.current) return;

      wheelAcc += event.deltaY;

      if (applyTimer) window.clearTimeout(applyTimer);
      applyTimer = window.setTimeout(applyZoom, applyDelay);
    };

    let isDisposed = false;

    const initMap = async () => {
      const kakao = await loadKakaoSdk();
      if (!kakao || isDisposed) return;

      kakao.maps.load(() => {
        if (isDisposed || mapRef.current) return;

        const hongdae = new kakao.maps.LatLng(37.5563, 126.9236);

        mapRef.current = new kakao.maps.Map(container, {
          center: hongdae,
          level: 3,
          zoomable: false,
        });

        container.addEventListener('wheel', onWheel, { passive: false });
      });
    };

    void initMap();

    return () => {
      isDisposed = true;
      if (applyTimer) window.clearTimeout(applyTimer);
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const kakao = getKakao();
    if (!map || !kakao) return;

    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];

    if (markers.length === 0) return;

    markers.forEach((item) => {
      const position = new kakao.maps.LatLng(item.lat, item.lng);
      const normalImage = new kakao.maps.MarkerImage(markerDefaultImg, new kakao.maps.Size(29, 42));
      const hoverImage = new kakao.maps.MarkerImage(markerDefaultImg, new kakao.maps.Size(38, 55));
      const marker = new kakao.maps.Marker({ map, position, image: normalImage });

      markerRefs.current.push(marker);

      kakao.maps.event.addListener(marker, 'mouseover', () => {
        marker.setImage(hoverImage);
      });

      kakao.maps.event.addListener(marker, 'mouseout', () => {
        marker.setImage(normalImage);
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        map.setCenter(position);
        onMarkerClick?.(item.id);
      });
    });

    return () => {
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
    };
  }, [markers, onMarkerClick]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
