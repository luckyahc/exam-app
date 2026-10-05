import { appIcon } from "@/lib/appIcon";

// iOS 홈 화면 아이콘(모서리는 iOS가 둥글게 자른다). 그림은 lib/appIcon.tsx
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return appIcon(180);
}
