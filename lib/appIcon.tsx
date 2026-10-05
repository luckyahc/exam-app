import { ImageResponse } from "next/og";

/** 앱 아이콘 색: 라이트 테마 primary(globals.css --primary)와 같은 파랑 */
export const ICON_BG = "#2563eb";

/**
 * 앱 아이콘 그림: 파란 바탕 + 흰 체크 표시 하나.
 * 바탕은 가장자리까지 꽉 채우고(안드로이드가 원·둥근 사각형으로 잘라 냄), 체크는 가운데 지름 80% 안전 영역 안에 둔다(maskable).
 * `rounded`는 브라우저 탭용 작은 아이콘에만 쓴다.
 */
export function appIcon(size: number, { rounded = false } = {}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ICON_BG,
          borderRadius: rounded ? size * 0.22 : 0,
        }}
      >
        <svg width={size} height={size} viewBox="0 0 100 100">
          <path d="M29 52 L44 67 L72 37" fill="none" stroke="#ffffff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
