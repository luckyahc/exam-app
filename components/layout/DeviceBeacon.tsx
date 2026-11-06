"use client";

import { useEffect } from "react";
import { deviceVisit, type StoredDevice } from "@/lib/analytics/deviceVisit";
import { DEVICE_KEY } from "@/lib/storage/keys";
import { safeGetJSON, safeSetJSON } from "@/lib/storage/safeStorage";

/** 하루 한 번 무작위 기기 번호를 서버에 알린다(고유 기기 수 집계용, 설정 탭에 안내). 화면에는 아무것도 그리지 않는다 */
export function DeviceBeacon() {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const { next, send } = deviceVisit(safeGetJSON<StoredDevice>(DEVICE_KEY), today, () =>
      crypto.randomUUID(),
    );
    if (!send) return;
    fetch("/api/device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: next.id }),
      keepalive: true,
    })
      // 보낸 뒤에만 오늘 날짜를 남긴다(실패하면 다음 접속 때 다시 보낸다). 번호는 실패해도 유지
      .then((res) => safeSetJSON(DEVICE_KEY, res.ok ? next : { id: next.id, sentOn: "" }))
      .catch(() => safeSetJSON(DEVICE_KEY, { id: next.id, sentOn: "" }));
  }, []);
  return null;
}
