import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
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
