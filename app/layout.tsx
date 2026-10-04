import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { noFlashScript } from "@/lib/theme/noFlashScript";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StorageBootstrap } from "@/components/storage/StorageBootstrap";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "시험 대비",
  description: "운영체제·데이터 통신 시험 대비 문제 풀이 웹앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // noFlashScript가 하이드레이션 전에 dark 클래스를 붙이므로 <html>만 className 불일치를 허용한다.
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript() }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StorageBootstrap />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
