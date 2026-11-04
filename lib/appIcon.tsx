import { ImageResponse } from "next/og";

/** 앱 아이콘 색: 먹(globals.css 라이트 --sumi) 바탕 + 종이색(--paper) 표시 */
export const ICON_BG = "#141414";
export const ICON_FG = "#ffffff";

/**
 * 앱 아이콘 그림: 먹색 바탕 + 종이색 체크 표시 하나(시험지 채점 표시). 디자인 규칙대로 모서리·선 끝을 각지게.
 * 바탕은 가장자리까지 꽉 채우고(안드로이드·iOS가 원·둥근 사각형으로 잘라 냄), 체크는 가운데 지름 80% 안전 영역 안에 둔다(maskable).
 */
export function appIcon(size: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ICON_BG,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path
          d="M29 52 L44 67 L72 37"
          fill="none"
          stroke={ICON_FG}
          strokeWidth={11}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    </div>,
    { width: size, height: size },
  );
}
