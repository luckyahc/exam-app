# Sprint 2 — 다과목 구조 전환 + OS 회귀 테스트

## 목표

앱을 "여러 과목을 한 앱에서 푸는 구조"로 바꾼다. 과목 레지스트리, 과목 → 챕터 라우팅, 과목별 localStorage 키와 자동 마이그레이션, `lib/sim/{과목}/` 폴더 규칙을 이 스프린트에서 확정해 이후 모든 스프린트가 처음부터 다과목 구조 위에서 작업하게 한다. 기존 OS 동작은 그대로 유지한다. 설계: [`multi-subject-design.md`](../multi-subject-design.md).

## 선행 조건

- Sprint 1 완료 (DONE)

## 작업 항목

### 과목 레지스트리 (§1)

- [x] `data/subjects/types.ts` — `SubjectDef`, `ChapterDef`
- [x] `data/subjects/registry.ts` — `SUBJECTS`, `SubjectId` 유도
- [x] `data/subjects/os/index.ts` — 기존 `lib/chapters.ts`의 4개 챕터(id·제목·순서) + `minQuestions` 50/80/80/120 + 색상 + `sourceDir: 'source/os'`, 챕터 파일은 빈 배열(`ch02.ts` … `ch08.ts`)
- [x] `data/subjects/data-comm/index.ts` — 이름 "데이터 통신"·색상·`sourceDir: 'source/data-communication'`, 챕터 `ch01` 개요·`ch02` 물리 계층(문제 파일은 빈 배열, `minQuestions` 57/106)
- [x] `lib/subjects.ts` 조회 헬퍼(`getSubject`, `getChapter`, `listQuestions`, `subjectOfQuestionId` — 최장 접두사 일치)
- [x] `lib/chapters.ts` 제거, 참조처를 레지스트리로 교체
- [x] 과목 색: `data-subject` + 인라인 CSS 변수, `globals.css` 공통 규칙 1개, `@theme inline`에 `--color-subject`

### 라우팅 (§4)

- [x] `/` 과목 카드 목록 (문제 0개 과목은 "준비 중" 비활성)
- [x] `/s/[subject]` 과목 홈 (챕터 카드 placeholder)
- [x] `/s/[subject]/chapter/[id]` (기존 `/chapter/[id]` placeholder 이동), `generateStaticParams` + `dynamicParams = false`
- [x] `/review`, `/stats` placeholder에 과목 탭(`?subject=all|{id}`) 틀
- [x] `next.config.ts` `redirects()`: `/chapter/:id → /s/os/chapter/:id`
- [x] `SiteHeader` 브레드크럼(홈 › 과목 › 챕터)
- [x] 쿼리 읽는 클라이언트 부분은 `<Suspense>`로 감싸 정적 프리렌더링 유지 (구현 전 `node_modules/next/dist/docs/`에서 해당 API 확인)

### 문제 id · 데이터 무결성 (§2)

- [x] `lib/storage/migrateId.ts` — `migrateLegacyQuestionId` (v1 `ch08-…` → `os-ch08-…`, 멱등)
- [x] `data/subjects/integrity.test.ts` 골격: 과목 id 형식, 과목 id 접두사 충돌 없음, 챕터 id 형식·과목 내 유일, 과목 색 대비 ≥ 4.5:1 (라이트/다크). 문제 단위 검사는 Sprint 3에서 유형 레지스트리와 함께 추가
- [x] OS 레지스트리 스냅샷 테스트: 챕터 id·제목·순서·minQuestions가 기존과 동일

### localStorage (§5)

- [x] `lib/storage/keys.ts` — 키 생성 함수 (`theme`은 이름 유지)
- [x] `lib/storage/schema.ts` — v2 타입, `CURRENT_SCHEMA = 2`
- [x] `lib/storage/upgrade.ts` — 순수 함수 `upgradeV1toV2` (Sprint 8 백업 가져오기와 공유)
- [x] `lib/storage/migrate.ts` — 실행기: 새 키 쓰기 → 성공 확인 → `examapp:schema=2` → v1 키 삭제. 실패 시 v1 보존 + 다음 실행 재시도, 미래 버전은 읽기 전용
- [x] 마이그레이션을 클라이언트 최초 마운트 시 1회 실행하는 부트스트랩(`useEffect`)
- [x] `migrate.test.ts` (메모리 Storage 목): 신규 / v1 전체 / v1 일부 / v1+v2 공존 / 쓰기 실패 / 저장소 차단 / 이미 v2 / 미래 버전 / 깨진 JSON — 데이터 손실 없음 + 멱등

### 생성기 폴더 규칙 (§6)

- [x] `lib/sim/_shared/`, `lib/sim/os/`, `lib/sim/data-comm/` 폴더와 `README` 주석(각 폴더의 역할) — 실제 시뮬레이터는 Sprint 4
- [x] Vitest `include` 패턴이 하위 폴더 테스트를 잡는지 확인 (현재 `**/*.test.ts`로 충족)

### 문서

- [x] `README.md` 구조 절 갱신(과목 레지스트리, 라우트)
- [x] `01-architecture.md` 폴더 구조·localStorage 절을 `multi-subject-design.md` 링크로 대체

## 완료 기준 (DoD) — OS 회귀 기준 ([`multi-subject-design.md`](../multi-subject-design.md) §7)

1. `npm run lint && npm test && npm run build` 통과 (기존 safeStorage 4건 포함)
2. `/s/os`, `/s/os/chapter/ch02|ch03|ch07|ch08` 정적 생성, 없는 과목/챕터는 404
3. `/chapter/ch08` → `/s/os/chapter/ch08` 리다이렉트
4. OS 챕터 레지스트리 스냅샷 테스트 통과
5. 테마 설정 유지, 새로고침 FOUC 없음
6. 마이그레이션·id 변환 테스트 전부 통과
7. data-comm 챕터(ch01, ch02)에 문제가 0개인 상태에서도 빌드 성공 + 홈에 "문제 준비 중" 카드(챕터 0개 과목만 비활성 — 설계 §1-2 조정), `/s/data-comm/chapter/ch01|ch02` 정적 생성
8. 모바일 375px에서 홈·과목 홈·헤더 브레드크럼 깨짐 없음

## 다음 스프린트와의 연결

- Sprint 3(문제 유형 엔진)은 여기서 만든 `SubjectId`로 `BaseQ.subject`를 정의하고, 무결성 테스트에 문제 단위 검사를 추가한다.
- Sprint 4(OS 시뮬레이터)는 처음부터 `lib/sim/os/`에 작성한다.

## 결과 (2026-10-04)

| 항목 | 전환 전 | 전환 후 |
|---|---|---|
| OS 회귀 (`npm run test:os-regression`, 서버 실행 중) | 14 / 14 통과 | 14 / 14 통과 |
| Vitest | 1개 파일 · 4건 통과 | 7개 파일 · 40건 통과 (기존 4건 포함) |
| `npm run lint` | 통과 | 통과 |
| `npm run build` | 통과 (라우트 11개) | 통과 (`/s/os`, `/s/data-comm`, 챕터 6개 정적 생성) |

- 실제 브라우저(Chrome)에서 v1 형식 키를 심고 접속 → `examapp:os:*`로 옮겨지고 문제 id에 `os-` 접두사, `examapp:schema=2`, v1 키 삭제, 테마(dark) 유지 확인.
- `/review`·`/stats`는 `?subject=`만 클라이언트에서 읽고 나머지는 정적 프리렌더링(Suspense).
- 구현 중 조정: 문제 0개 과목 카드는 비활성이 아니라 "문제 준비 중" 링크(설계 §1-2).
