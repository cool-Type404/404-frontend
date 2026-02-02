import { useEffect, useRef } from 'react';

export default function KakaoMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // SDK 로드 여부 방어
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      window.kakao.maps.load(() => {
        // 홍대입구역(대략)
        const hongdae = new window.kakao.maps.LatLng(37.5563, 126.9236);

        const map = new window.kakao.maps.Map(containerRef.current!, {
          center: hongdae,
          level: 3,
        });

        new window.kakao.maps.Marker({ map, position: hongdae });
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
      return;
    }

    const script = document.querySelector(
      'script[src^="https://dapi.kakao.com/v2/maps/sdk.js"]',
    ) as HTMLScriptElement | null;

    if (!script) {
      console.error('Kakao Maps SDK script tag not found in index.html');
      return;
    }

    script.addEventListener('load', initMap);
    return () => script.removeEventListener('load', initMap);
  }, []);

  // ✅ 화면 높이의 70% 차지
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
