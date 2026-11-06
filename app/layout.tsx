import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { THEME_COLOR } from "@/lib/theme/constants";
import { noFlashScript } from "@/lib/theme/noFlashScript";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { DeviceBeacon } from "@/components/layout/DeviceBeacon";
import { StorageBootstrap } from "@/components/storage/StorageBootstrap";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

// next/font/google은 빌드 때 글꼴 파일을 내려받아 같이 배포한다(실행 중 외부 요청 없음).
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "시험",
  description: "운영체제·데이터 통신·데이터과학 시험 대비 문제 풀이 웹앱",
};

// viewportFit cover: 아이폰 홈 바·노치 영역 값(env(safe-area-inset-*))을 받아 탭바가 가려지지 않게 한다
// themeColor: 브라우저 주소창·상태 막대 색. 기기 설정(라이트/다크)에 맞춰 종이색을 고르고,
// 설정 탭에서 다크 모드를 직접 바꾸면 lib/theme/themeStore.ts가 두 메타 태그를 지금 테마 색으로 맞춘다
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // noFlashScript가 하이드레이션 전에 dark 클래스를 붙이므로 <html>만 className 불일치를 허용한다.
    <html
      lang="ko"
      className={`${pretendard.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript() }} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-sumi">
        <StorageBootstrap />
        <main className="flex flex-1 flex-col">{children}</main>
        <BottomTabBar />
        <Analytics />
        <DeviceBeacon />
      </body>
    </html>
  );
}
