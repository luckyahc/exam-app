"use client";

import { useEffect } from "react";
import { ensureStorageMigrated } from "@/lib/storage/bootstrap";

/** 앱 첫 마운트 때 localStorage 스키마 마이그레이션을 실행한다. 화면에는 아무것도 그리지 않는다. */
export function StorageBootstrap() {
  useEffect(() => {
    ensureStorageMigrated();
  }, []);
  return null;
}
