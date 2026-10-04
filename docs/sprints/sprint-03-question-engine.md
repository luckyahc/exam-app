# Sprint 3 — 문제 유형 엔진 (데이터 모델 + 문제 유형 레지스트리 + 렌더러 + 채점기)

## 목표

원본 §4·§5에 정의된 10가지 문제 유형(서술형 제외)을 **문제 유형 레지스트리** 위에 구현한다. 공통 데이터 모델에는 **과목 필드(`subject`)**를 포함하고, 각 유형의 채점 로직은 단위 테스트로 검증한다. 설계: [`multi-subject-design.md`](../multi-subject-design.md) §2·§3.

## 선행 조건

- Sprint 2(다과목 구조 전환) 완료 — 과목 레지스트리와 `SubjectId` 타입이 있어야 한다.

## 작업 항목

### 데이터 모델

- [x] `types/question.ts`에 `BaseQ` 정의 — `id`, **`subject: SubjectId`**, `chapter`(과목 내 id), `topic`, `type`, `exam`, **`examBasis`(`handwritten` | `printed-emphasis`, exam이 true면 필수)**, `difficulty`, `slideRef`, `prompt`, `explanation`, `summary?`, `generator?`
- [x] 문제 id 규칙(`{subject}-{chapter}-{topicSlug}-{nnn}`) 검사 함수 + 과목 판별(레지스트리 기반 최장 접두사 일치, `split('-')` 금지)
- [x] 생성기 기반 문제 스키마(`generator: { name, params, seed }`) 정의
- [x] `Question` 유니온과 `QType`은 레지스트리에서 유도 (따로 유니온을 손으로 관리하지 않음)

### 문제 유형 레지스트리

- [x] `lib/qtypes/registry.ts` — `QTypeCore` 인터페이스(`label`, `emptyAnswer`, `isComplete`, `grade`, `validate`, `choiceCount?`) + `QTYPE_CORE` 맵 (React import 금지)
- [x] `components/qtypes/registry.ts` — `QTypeUI`(`Input`, `Review`) + `QTYPE_UI` 맵, `satisfies { [K in QType]: … }`로 등록 누락 시 빌드 실패
- [x] `QuestionRenderer`는 레지스트리 조회만 (유형별 `switch` 금지)
- [x] 공용 헬퍼: `_shared/orderScore.ts`(order 부분점수), `_shared/textMatch.ts`(blank 정답 매칭: 공백·대소문자 정규화, 한/영 accept)
- [x] `data/subjects/integrity.test.ts`에 "모든 문제의 `type`이 레지스트리에 있음 + 유형별 `validate` 통과" 검사 연결

### 채점 로직 (`lib/qtypes/{type}.ts`) — 유형별로 순수 함수 + 테스트

- [x] `mcq` — 단일 정답 일치
- [x] `multi` — 부분 점수(정답 집합과 선택 집합 비교 공식 확정 및 테스트)
- [x] `ox` — 참/거짓 + 틀린 이유 해설 매칭
- [x] `blank` — 공백/대소문자 무시, `accept` 배열 매칭, 단어 은행 모드
- [x] `order` — 완전 일치 + 부분 점수(상대 순서 일치 비율) 공식 확정 및 테스트
- [x] `match` — 쌍별 채점
- [x] `classify` — 항목-버킷 배치 채점
- [x] `calc` — 허용 오차(`tolerance`) 내 숫자 비교
- [x] `trace` — 표의 칸별 채점(빈 칸만 비교), 부분 점수 비율 반환
- [x] `graph` — 선택한 옵션 키 비교
- [x] 각 채점 함수에 대해 정답/오답/경계값(오차 한계, 공백 변형 등) Vitest 케이스 작성
- [x] 각 유형 `validate`에 대해 잘못된 데이터 fixture가 오류를 내는지 테스트

### 렌더러 컴포넌트 (`components/qtypes/*`)

- [x] 10종 `Input`/`Review` 컴포넌트 구현 (더미 데이터로 수동 확인)
- [x] `order`: 드래그&드롭 + 모바일용 ↑↓ 버튼 동시 지원
- [x] `trace`: 입력/드롭다운 셀, 칸별 정오답 하이라이트
- [x] `graph`: SVG 인라인 렌더링, 다크모드 대비 확인(색상 토큰 분리)
- [x] ⭐ 뱃지에 근거 구분 표시: `handwritten` = "⭐ 교수님 필기", `printed-emphasis` = "⭐ 슬라이드 강조" (아이콘 + 텍스트, 색 단독 금지)
- [x] 정답/오답 비교 UI(`Review`): 사용자가 낸 답과 정답을 나란히 표시 (아이콘+텍스트, 색약 대응)
- [x] 전역 키보드 단축키 훅: 1~5 선택지(`choiceCount` 있는 유형만), Enter 제출/다음, ←/→ 이전/다음 (입력 필드 포커스 시 비활성화)

## 완료 기준 (DoD)

- 10가지 유형 전부 레지스트리에 등록되고, 더미 문제(`subject: 'os'`) 1개 이상으로 렌더링 + 채점이 동작
- UI 레지스트리에서 한 유형을 빼면 `npm run build`가 타입 오류로 실패하는 것을 한 번 확인 (등록 누락 방지 장치 검증)
- `lib/qtypes/*` 전체 Vitest로 정답/부분점수/오답 케이스 통과
- 키보드만으로 mcq/ox 문제를 끝까지 풀 수 있음
- 다크모드에서 모든 유형 컴포넌트의 텍스트/배경 대비 확인
- Sprint 2의 OS 회귀 기준([`multi-subject-design.md`](../multi-subject-design.md) §7) 계속 통과

## 다음 스프린트와의 연결

- Sprint 5·6(OS 콘텐츠 제작)은 여기서 확정된 타입 스키마를 그대로 사용한다. 스키마를 바꾸면 이 문서와 `multi-subject-design.md`를 함께 갱신한다.
- Sprint 9(데이터 통신)는 새 유형을 추가하지 않고 `calc`의 입력 파서·상대 오차 옵션만 하위 호환으로 보강한다.

## 결과 (2026-10-04, 진행 중)

- 완료: 데이터 모델·레지스트리·10종 채점기/렌더러·키보드 훅·⭐ 근거 뱃지·`/playground`. Vitest 9개 파일 104건, lint, build 통과. UI 레지스트리에서 `graph`를 빼면 build가 "Property `graph` is missing"으로 실패함을 확인.
- 결정: multi 부분점수 = max(0, (맞게 고른 수 − 잘못 고른 수) / 정답 수). order 부분점수 = 상대 순서가 맞는 쌍 비율, items는 정답 순서로 저장하고 문제 id로 고정 셔플. classify bucket은 이름. graph는 정규화 좌표(0..1) 곡선 데이터를 인라인 SVG로. 숫자키 동작은 core의 `applyChoice`.
- **남음(DoD 미확인):** 브라우저에서 키보드만으로 mcq/ox 풀기, 다크모드 대비 육안 확인, OS 회귀 스크립트 재실행.
