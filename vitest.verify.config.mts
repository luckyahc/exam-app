import { defineConfig } from "vitest/config";
import path from "node:path";

// `npm run verify:ds`: 데이터과학 작성 시 검증 전체(lib/verify/ — 기본 검증 + *.full.test.ts: 해시 시드 엔진·판다스·틀린 데이터). Sprint 14
// (vitest.config.mts의 exclude가 *.full.test.ts를 빼므로 합치지 않고 따로 둔다)
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/verify/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
