# 운영체제 시험 대비 웹앱 (Ch02 / Ch03 / Ch07 / Ch08)

요구사항 원문: `antigravity_prompt_os_exam_app.md` · 개발 계획: `docs/` (`docs/02-roadmap.md`, `docs/sprints/`)

## 명령어

```bash
npm run dev           # 개발 서버 (http://localhost:3000)
npm run build         # 프로덕션 빌드
npm run lint          # ESLint
npm run format        # Prettier로 포맷 적용 (format:check 는 검사만)
npm test              # Vitest
npm run test:os-regression  # OS 회귀 점검 — 먼저 `npm run build && npx next start -p 3123` 실행
```

## 구조

여러 과목(운영체제 `os`, 데이터 통신 `data-comm`)을 한 앱에서 푼다. 설계: `docs/multi-subject-design.md`.

- `app/` — 라우트: `/`(과목 선택), `/s/[subject]`(과목 홈), `/s/[subject]/chapter/[id]`, `/quiz`, `/result`, `/review?subject=`, `/stats?subject=`. 옛 `/chapter/[id]`는 `/s/os/chapter/[id]`로 리다이렉트
- `data/subjects/registry.ts` — **과목 등록 지점**. 새 과목 = `data/subjects/{과목}/` 폴더(`index.ts` + 챕터별 문제 파일) + 이 파일에 한 줄
- `components/` — UI 컴포넌트 (`layout/SiteHeader`·`HeaderNav`, `subject/SubjectTabs`, `theme/ThemeToggle`, `storage/StorageBootstrap`)
- `lib/subjects.ts` — 과목/챕터 조회, 문제 id → 과목 판별
- `lib/sim/{과목}/` — 시뮬레이터·생성기 (`lib/sim/README.md`)
- `lib/storage/` — `safeStorage`(localStorage 안전 래퍼), `keys`(키 이름), `migrate`(스키마 v1→v2 자동 마이그레이션), `upgrade`(변환 순수 함수)
- `lib/theme/` — 테마(system/light/dark) 스토어 + FOUC 방지 인라인 스크립트
- `app/fonts/PretendardVariable.woff2` — Pretendard 로컬 자체 호스팅 (외부 CDN 사용 금지). 로드 실패 시 시스템 한글 폰트로 폴백

## localStorage 사용 규칙

- 키 이름은 `lib/storage/keys.ts`로만 만든다. 학습 기록은 과목별 키(`examapp:{과목}:progress|wrong|bookmarks`), 테마는 `theme`.
- 첫 실행 시 `StorageBootstrap`이 옛 형식(v1) 기록을 과목별 키로 옮긴다(새 키 쓰기 → 성공 확인 → 버전 기록 → 옛 키 삭제).
- localStorage는 반드시 `lib/storage/safeStorage.ts`의 `safeGet`/`safeSet`/`safeRemove`(및 `*JSON` 변형)로만 접근한다. 모든 함수는 `try/catch`로 감싸져 있어 사생활 보호 모드나 저장소 차단 상황에서도 예외를 던지지 않는다.
- 컴포넌트에서는 **렌더 중에 호출하지 말고** `useEffect`(또는 이벤트 핸들러, `useSyncExternalStore` 구독) 안에서만 호출한다. 서버 렌더와 첫 클라이언트 렌더 결과가 달라져 hydration 오류가 나는 것을 막기 위함이다.
