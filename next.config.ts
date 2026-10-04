import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Sprint 1의 OS 챕터 경로 → 다과목 구조의 과목 경로 (없는 챕터는 도착지에서 404)
      { source: "/chapter/:id", destination: "/s/os/chapter/:id", permanent: false },
    ];
  },
};

export default nextConfig;
