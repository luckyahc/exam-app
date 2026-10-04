# 프로젝트 개요 — 시험 대비 웹앱 (다과목: 운영체제 + 데이터 통신)

> 원본 요구사항 전문: [`/antigravity_prompt_os_exam_app.md`](../antigravity_prompt_os_exam_app.md) (이 문서와 상충하면 원본이 우선)

## 한 줄 요약

> **2026-10-04 확장**: 한 앱에서 여러 과목을 푸는 구조로 바뀌었다. 과목 = 운영체제(`os`, Ch02/Ch03/Ch07/Ch08) + 데이터 통신(`data-comm`, Ch01 개요/Ch02 물리 계층). 원본 md의 §4·§5·§6·§8·§9, 다크모드, Vercel 정적 배포 조건은 **모든 과목에 그대로 적용**한다. 설계: [`multi-subject-design.md`](./multi-subject-design.md).

운영체제 과목(Stallings 기반, Ch02/Ch03/Ch07/Ch08)의 시험 대비용 **객관식·빈칸·순서배치·매칭·계산·시뮬레이션 표 채우기** 전용 웹앱. Next.js(App Router)+TS+Tailwind, 백엔드 없이 완전 정적 데이터 + 클라이언트 로직, Vercel에 `Import → Deploy`만으로 배포.

## 범위 밖 (Non-goals)

- 서술형/장문 문제 — 금지
- 서버/DB/환경변수/외부 API — 금지
- 외부 CDN 폰트 의존 — 금지 (시스템 폰트 스택 + 로컬 Pretendard)
- 회원가입/로그인/서버 저장 — 없음 (localStorage만)

## 기술 스택 고정값

| 항목 | 결정 |
|---|---|
| 프레임워크 | Next.js App Router + TypeScript |
| 스타일 | Tailwind CSS (`darkMode: 'class'`) |
| 상태/영속성 | React state + localStorage (모든 접근 `useEffect` + `try/catch`) |
| 테스트 | Vitest (단위: 채점 로직, `lib/sim/*` 시뮬레이터) |
| 폰트 | Pretendard 로컬 자체 호스팅(`public/fonts`) → 실패 시 시스템 한글 폰트 스택 |
| 배포 | Vercel, 설정 파일 없이 기본 빌드로 배포 가능해야 함 |

## 완료 조건 (Definition of Done — 전체 프로젝트)

1. 과목 → 챕터로 분리되어 있고(OS 4개 챕터 + 데이터 통신 2개 챕터) 각 챕터에서 유형/⭐/토픽 필터로 풀 수 있음. 오답노트·북마크·진행률·통계는 과목별 + 전체 보기
2. 서술형 문제 없음 (문제 유형 레지스트리에 등록된 기본 10종만 사용 — 데이터 통신도 새 유형 불필요)
3. 다크모드(시스템/라이트/다크) 정상 동작, FOUC 없음, 전 컴포넌트 대비 충분
4. 생성기·시뮬레이터 Vitest 테스트 전부 통과 (원본 §6의 검증 기준값 고정)
5. `npm run lint && npm test && npm run build` 모두 통과
6. 챕터별 최소 문항 수 충족: OS Ch02 ≥50 / Ch03 ≥80 / Ch07 ≥80 / Ch08 ≥120, 데이터 통신 Ch01 ≥57 / Ch02 ≥106
7. Vercel에서 추가 설정 없이 배포 가능
8. README에 로컬 실행/문제 추가/과목 추가/문제 유형 추가/배포 방법 기술
9. 기존 OS 학습 기록이 다과목 전환 후에도 사라지지 않음(자동 마이그레이션), 백업 JSON에 버전 필드 + 구버전 가져오기 지원

## 문서 구성

- [`multi-subject-design.md`](./multi-subject-design.md) — **다과목 구조 설계**: 과목 레지스트리, id 규칙, 데이터 모델, 문제 유형 레지스트리, 라우팅, localStorage 마이그레이션, 백업 버전, `lib/sim/{과목}`
- [`01-architecture.md`](./01-architecture.md) — 채점/시뮬레이터 설계 원칙, 다크모드, 접근성 (폴더 구조·localStorage는 위 문서가 대체)
- [`dc-source-analysis.md`](./dc-source-analysis.md) — 데이터 통신 PDF 분석(챕터 구성, ⭐(printed-emphasis), 확인 필요 답변, 수식·그림 목록, 소주제)
- [`dc-question-types.md`](./dc-question-types.md) — 데이터 통신 문제 유형 사용 계획(새 유형 없음), `calc` 입력 보강, 생성기 10개, graph SVG 목록
- [`02-roadmap.md`](./02-roadmap.md) — 스프린트 인덱스 및 진행 상태 표
- [`source-diff.md`](./source-diff.md) — (OS) `source/os/` PDF 4개와 §7/§6의 실사 대조 결과(불일치·확인필요·슬라이드 실측 자료)
- [`coverage-matrix.md`](./coverage-matrix.md) — 과목별 소주제 × 문제유형 × 슬라이드페이지 매트릭스, 목표 문항 수 배분
- [`content-checklist.md`](./content-checklist.md) — 챕터별 출제 범위(⭐ 포함) 체크리스트, 콘텐츠 제작 스프린트에서 체크박스로 진행 추적
- [`sprints/sprint-XX-*.md`](./sprints/) — 스프린트별 목표/작업항목/완료기준

## 진행 상태 갱신 규칙

- 각 스프린트 문서의 체크박스는 작업 완료 시 바로 체크한다.
- 스프린트가 끝나면 `02-roadmap.md`의 상태 열을 갱신한다.
- 요구사항이 변경되면 원본 md는 그대로 두고 이 docs 폴더만 갱신한다(변경 이력은 로드맵 하단에 기록).
