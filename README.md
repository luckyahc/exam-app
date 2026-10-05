# 시험 대비 웹앱 — 운영체제(Ch02·Ch03·Ch07·Ch08) · 데이터 통신(Ch01·Ch02)

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
- `types/question.ts` — 문제 데이터 모델 공개 진입점 (`Question`, `BaseQ`, `QType`)
- `lib/qtypes/` — **문제 유형 레지스트리(순수 로직)**: 10종 채점·검증(`registry.ts`가 등록 지점 1), 유형별 예시 문제 `fixtures.ts`
- `components/qtypes/` — 유형별 입력·비교 화면(`registry.ts`가 등록 지점 2, 빠뜨리면 빌드 실패), `QuestionRenderer`
- `/playground` — 10가지 문제 유형 미리보기(키보드: 1~5 선택, Enter 제출/다음, ←/→ 이동)
- `components/` — 그 밖의 UI (`layout/SiteHeader`·`HeaderNav`, `subject/SubjectTabs`, `theme/ThemeToggle`, `storage/StorageBootstrap`)
- `lib/subjects.ts` — 과목/챕터 조회, 문제 id → 과목 판별
- `lib/sim/{과목}/` — 시뮬레이터·문제 생성기 (`lib/sim/README.md`). OS: `lib/sim/os/` 8종 + `generators.ts`(과목 정의의 `loadGenerators()`로 지연 로딩). 계산 문제의 정답은 반드시 여기서 계산하고 슬라이드 기준값을 Vitest로 고정한다
- `lib/storage/` — `safeStorage`(localStorage 안전 래퍼), `keys`(키 이름), `migrate`(스키마 v1→v2 자동 마이그레이션), `upgrade`(변환 순수 함수)
- `lib/theme/` — 테마(system/light/dark) 스토어 + FOUC 방지 인라인 스크립트
- `app/fonts/PretendardVariable.woff2` — Pretendard 로컬 자체 호스팅 (외부 CDN 사용 금지). 로드 실패 시 시스템 한글 폰트로 폴백

## localStorage 사용 규칙

- 키 이름은 `lib/storage/keys.ts`로만 만든다. 학습 기록은 과목별 키(`examapp:{과목}:progress|wrong|bookmarks`), 테마는 `theme`.
- 첫 실행 시 `StorageBootstrap`이 옛 형식(v1) 기록을 과목별 키로 옮긴다(새 키 쓰기 → 성공 확인 → 버전 기록 → 옛 키 삭제).
- localStorage는 반드시 `lib/storage/safeStorage.ts`의 `safeGet`/`safeSet`/`safeRemove`(및 `*JSON` 변형)로만 접근한다. 모든 함수는 `try/catch`로 감싸져 있어 사생활 보호 모드나 저장소 차단 상황에서도 예외를 던지지 않는다.
- 컴포넌트에서는 **렌더 중에 호출하지 말고** `useEffect`(또는 이벤트 핸들러, `useSyncExternalStore` 구독) 안에서만 호출한다. 서버 렌더와 첫 클라이언트 렌더 결과가 달라져 hydration 오류가 나는 것을 막기 위함이다.

## 로컬 실행

Node.js 20.9 이상(권장 24)이 필요하다. 서버·DB·환경변수는 없다 — 학습 기록은 모두 브라우저 localStorage에 저장된다.

```bash
npm install
npm run dev                      # http://localhost:3000
npm run build && npm start       # 프로덕션 모드 확인
```

## 문제 추가 방법

문제는 `data/subjects/{과목}/{챕터}.ts`의 배열에 객체로 넣는다. 공통 필드는 `lib/qtypes/base.ts`의 `BaseQ`, 유형별 필드는 `lib/qtypes/{유형}.ts`에 있다.

| 필드 | 설명 |
| --- | --- |
| `id` | `{과목}-{챕터}-{토픽슬러그}-{nnn}` (예: `os-ch08-tlb-003`). 전체에서 유일 |
| `subject` · `chapter` | 레지스트리에 있는 과목·챕터 id |
| `topic` | 세부 주제 (필터에 표시) |
| `type` | `mcq` `multi` `ox` `blank` `order` `match` `classify` `calc` `trace` `graph` — 서술형은 없다 |
| `exam` · `examBasis` | ⭐ 시험 포인트 여부. `exam: true`면 `examBasis`(`handwritten` / `printed-emphasis`)와 `summary` 필수 |
| `difficulty` | 1~3 |
| `slideRef` | `Ch08 p.48`(OS) / `Ch02 s.38`(데이터 통신) |
| `prompt` · `explanation` | 지문·해설. 굵게(`**…**`)와 인라인 코드(`` `…` ``)만 쓴다. 해설에 보기 위치("마지막 보기")를 쓰지 않는다 — 객관식 보기는 화면에서 섞인다 |

```ts
{
  ...base,                       // { subject: "os", chapter: "ch08" }
  ...plain,                      // { exam: false }
  id: "os-ch08-tlb-010",
  topic: "TLB",
  type: "mcq",
  difficulty: 1,
  slideRef: "Ch08 p.20",
  prompt: "**TLB**에 대한 설명으로 옳은 것은?",
  choices: ["페이지 테이블 항목을 캐시하는 하드웨어", "디스크의 swap 영역", "세그먼트 테이블의 다른 이름", "운영체제가 쓰는 소프트웨어 큐"],
  answerIndex: 0,
  explanation: "p.20: TLB는 최근 쓴 페이지 테이블 항목을 담는 고속 캐시다. …",
},
```

계산 문제의 정답은 손으로 쓰지 않고 `lib/sim/{과목}/`의 시뮬레이터로 계산한다. `npm test`의 무결성 테스트(`data/subjects/integrity.test.ts`)가 id 중복·필드 형식·유형별 검증·챕터 최소 문항 수를 검사한다.

## 과목 추가 방법

1. `data/subjects/{과목}/index.ts`에 `SubjectDef`(id, 이름, 라이트/다크 대표 색, 챕터 목록과 `load`)를 만들고 챕터별 문제 파일을 둔다 — `data/subjects/os/` 참고
2. `data/subjects/registry.ts`의 `SUBJECTS` 배열에 한 줄 추가
3. (선택) 생성기는 `lib/sim/{과목}/generators.ts`에 만들고 `loadGenerators`로 연결

라우트·홈 카드·오답노트/통계 탭은 `SUBJECTS`를 순회해 자동으로 생긴다.

## 문제 유형 추가 방법

등록 지점은 두 곳이다.

1. `lib/qtypes/{유형}.ts` — 채점·검증 순수 로직(`QTypeCore`). `lib/qtypes/registry.ts`의 `QTYPE_CORE`에 등록
2. `components/qtypes/{유형}.tsx` — 입력·비교 화면(`QTypeUI`). `components/qtypes/registry.ts`의 `QTYPE_UI`에 등록 — 빠뜨리면 타입 검사에서 빌드가 실패한다

`lib/qtypes/fixtures.ts`에 예시 문제를 추가하면 `/playground`에서 바로 확인할 수 있다.

## Vercel 배포

설정 파일·환경변수·빌드 명령 변경이 필요 없다(전 경로 정적 생성, 외부 요청 없음, 폰트도 로컬 포함).

1. 이 저장소를 GitHub에 push
2. [vercel.com/new](https://vercel.com/new)에서 저장소 **Import** — Framework Preset은 Next.js로 자동 인식된다
3. **Deploy**. 이후 `main`에 push하면 자동 배포, PR마다 미리보기 배포가 만들어진다
