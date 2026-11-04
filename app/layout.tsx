import type { Metadata, Viewport } from "next";
import { Gowun_Batang, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { noFlashScript } from "@/lib/theme/noFlashScript";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { StorageBootstrap } from "@/components/storage/StorageBootstrap";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

// next/font/google은 빌드 때 글꼴 파일을 내려받아 같이 배포한다(실행 중 외부 요청 없음).
// 고운바탕은 한글 조각(unicode-range)이 많아 미리 불러오지 않고, 제목에 쓰일 때 필요한 조각만 받는다.
const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  variable: "--font-gowun-batang",
  display: "swap",
  preload: false,
});

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
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // noFlashScript가 하이드레이션 전에 dark 클래스를 붙이므로 <html>만 className 불일치를 허용한다.
    <html
      lang="ko"
      className={`${pretendard.variable} ${gowunBatang.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript() }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StorageBootstrap />
        <main className="flex flex-1 flex-col">{children}</main>
        <BottomTabBar />
      </body>
    </html>
  );
}
