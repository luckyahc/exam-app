import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Sprint 1의 OS 챕터 경로 → 다과목 구조의 과목 경로 (없는 챕터는 도착지에서 404)
      { source: "/chapter/:id", destination: "/s/os/chapter/:id", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        // 코드 실행 엔진 파일(scripts/prepare-engine.mjs): 경로에 버전·내용 해시가 들어 있어(pyodide-314.0.7/, app-{해시}/) 내용이 바뀌지 않는다 →
        // 브라우저가 한 번 받은 파일을 다시 받지 않도록 1년 immutable 캐시(Sprint 13)
        // manifest.json(버전 정보)은 버전 폴더 밖이라 이 규칙에 걸리지 않는다
        source: "/engine/:dir((?:pyodide|sqljs|app)-[^/]+)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // 이 앱은 같은 출처 밖으로 요청을 보내지 않는다. 실행 엔진 Worker 안의 사용자 코드가 외부로 연결하지 못하게 하는 2차 방어(Sprint 13).
        // connect-src만 지정 — 다른 지시어는 기본값 그대로라 스크립트·스타일 동작은 바뀌지 않는다.
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: "connect-src 'self'" }],
      },
    ];
  },
};

export default nextConfig;
