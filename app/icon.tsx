import { appIcon } from "@/lib/appIcon";

// 브라우저 탭(32) + 홈 화면 설치용(192·512, manifest.ts가 /icon/192·/icon/512로 가리킴). 그림은 lib/appIcon.tsx
export function generateImageMetadata() {
  return [32, 192, 512].map((n) => ({ id: String(n), size: { width: n, height: n }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const n = Number(await id);
  return appIcon(n, { rounded: n === 32 });
}
