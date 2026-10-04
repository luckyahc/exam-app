# Sprint 1 — 프로젝트 기반 구축

## 목표

Next.js 프로젝트를 스캐폴딩하고, 다크모드·라우팅·저장소 유틸 등 이후 모든 스프린트가 의존하는 토대를 완성한다.

## 작업 항목

- [x] `create-next-app`으로 App Router + TypeScript 프로젝트 생성, Tailwind CSS 설정(`darkMode: 'class'` → v4에서는 `@custom-variant dark`)
- [x] ESLint/Prettier 설정, `package.json` 스크립트(`lint`, `test`, `build`, `dev`) 정리
- [x] Vitest 설정(`vitest.config.mts`), 샘플 테스트 1개로 파이프라인 확인
- [x] Pretendard 폰트 로컬 자체 호스팅: `public/fonts`에 woff2 배치, `@font-face` 선언, 실패/미적용 시 시스템 한글 폰트 스택(`-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`)으로 폴백. 외부 CDN `<link>` 금지
- [x] 다크모드 토글 구현: 테마 상태(`system`/`light`/`dark`) + localStorage 저장 + `<head>` 인라인 스크립트로 FOUC 방지
- [x] 루트 레이아웃(`app/layout.tsx`) + 기본 네비게이션
- [x] 라우트 틀 생성(빈 placeholder 페이지): `/`, `/chapter/[id]`, `/quiz`, `/result`, `/review`
- [x] `lib/storage/safeStorage.ts` 구현: `safeGet`/`safeSet`/`safeRemove`, 모두 `try/catch`로 감싸고 `useEffect` 밖에서 호출되지 않도록 사용 규칙을 README/주석으로 명시
- [x] 모바일 우선 반응형 기본 컨테이너/타이포 스케일 설정

## 완료 기준 (DoD)

- `npm run dev`로 5개 라우트 모두 404 없이 접근 가능
- 테마를 라이트/다크/시스템으로 전환해도 새로고침 시 깜빡임(FOUC) 없음
- `npm run lint`, `npm test`, `npm run build` 모두 통과 (콘텐츠 없는 빈 상태 기준)
- 외부 CDN 네트워크 요청 없이 폰트가 렌더링됨 (오프라인에서도 확인)

## 다음 스프린트와의 연결

- Sprint 2(다과목 구조 전환)는 이 스프린트의 `safeStorage`, 테마, 라우트 틀을 과목 단위 구조로 옮긴다.
