import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Pyodide 엔진 Worker가 여러 개 함께 돌면 CPU 부하로 테스트 하나가 기본 5초를 넘을 수 있다(Sprint 16에서 간헐 실패 확인)
    testTimeout: 30_000,
    include: ["**/*.test.ts"],
    // *.full.test.ts: 데이터과학 전체 실행 검증(해시 시드 엔진·판다스·틀린 데이터) — `npm run verify:ds`(vitest.verify.config.mts)
    exclude: ["node_modules/**", ".next/**", "**/*.full.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
