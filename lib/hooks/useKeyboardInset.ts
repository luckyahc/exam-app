"use client";

import { useEffect, useState } from "react";

/**
 * 화면 아래를 가리는 가상 키보드 높이(px). 아이폰 Safari는 키보드가 올라와도 레이아웃 높이를 줄이지 않아
 * position: fixed; bottom: 0 막대가 키보드 뒤로 숨는다 — visualViewport로 가려진 만큼을 재서 그만큼 올린다.
 * visualViewport가 없는 브라우저·키보드가 없을 때는 0.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () =>
      setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
  return inset;
}
