import type { MetadataRoute } from "next";
import { ICON_BG } from "@/lib/appIcon";

// 홈 화면 설치(PWA) 정보. 아이콘 이미지는 app/icon.tsx가 만든다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "시험 대비",
    short_name: "시험 대비",
    description: "운영체제·데이터 통신·데이터과학 시험 대비 문제 풀이 웹앱",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: ICON_BG,
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
