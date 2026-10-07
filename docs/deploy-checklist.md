# 배포 후 확인 체크리스트

Vercel에 배포한 뒤 직접 확인한다. 5~10분이면 끝난다. 아래 `https://<배포 주소>`를 실제 주소로 바꿔 쓴다.

## 1. 빌드 로그 (Vercel 대시보드 → Deployments → 해당 배포 → Build Logs)

- [ ] `prepare-engine` 줄이 오류 없이 지나가고 `next build`가 끝났다(로컬 기준 약 20초, 첫 빌드는 휠 내려받기로 조금 더)
- [ ] 휠 내려받기 실패·SHA-256 불일치 메시지가 없다(있으면 빌드가 실패한다 — 다시 배포)

## 2. 엔진 파일 응답 헤더 (PC 브라우저)

1. `https://<배포 주소>/engine/manifest.json`을 열어 `"worker"` 값(예: `/engine/app-86a66dadf4d9/browserWorker.js`)을 확인한다
2. 개발자 도구(F12) → **Network** 탭을 연 채로 데이터과학 코드 작성 문제를 하나 연다(엔진이 불러와진다)
3. 아래 파일을 하나씩 눌러 **Headers → Response Headers**를 본다

| 파일 | Content-Type | Cache-Control |
|---|---|---|
| `pyodide.asm.wasm`, `sql-wasm.wasm` | `application/wasm` | `public, max-age=31536000, immutable` |
| `pyodide.mjs`, `pyodide.asm.mjs`, `browserWorker.js` | `application/javascript`(또는 `text/javascript`) | 위와 같음 |
| `*.whl` | 아무거나(`application/octet-stream` 등) | 위와 같음 |
| `manifest.json` | `application/json` | 1년 캐시가 **아니어야** 한다 |

- [ ] 모든 응답에 `Content-Security-Policy: connect-src 'self'`가 있다
- [ ] 같은 문제를 새로고침하면 위 파일들의 Size 열이 `(disk cache)` 또는 `(memory cache)`다

명령줄로 볼 때: `curl -sI https://<배포 주소>/engine/pyodide-314.0.7/pyodide.asm.wasm`

## 3. 엔진 동작·시간 (PC)

- [ ] 데이터과학 → Lec6 → 코드 작성 문제: "엔진 준비 완료 (N초)"가 뜬다. 넘파이 문제 첫 준비 ______초
- [ ] 판다스 문제(보너스 열 만들기): "실행 엔진 불러오기" 버튼 → 준비 ______초 → 실행·제출하면 채점된다
- [ ] ← 이전으로 갔다가 다시 오면 버튼 없이 "엔진 준비 완료 (0.0초)"

## 4. 휴대폰 (와이파이·LTE 각각 한 번씩이면 좋다)

- [ ] 홈 → 데이터과학 → Lec6 → 판다스 코드 작성 문제 → "실행 엔진 불러오기"를 누른 때부터 "엔진 준비 완료"까지 초시계로 잰다: 와이파이 ______초 / LTE ______초 (화면에도 걸린 시간이 표시된다. 안내 문구의 예상은 30~60초)
- [ ] 실행 → 제출 → 정답/오답이 나온다
- [ ] 화면이 옆으로 밀리지 않는다(가로 스크롤 없음), 라이트·다크 모두
- [ ] 비행기 모드를 켠 채 새 판다스 문제를 열고 버튼을 누르면 몇 초 안에 "채점할 수 없음 — 실행 엔진을 불러오지 못했습니다"와 **다시 시도** 버튼이 나온다 → 비행기 모드를 끄고 다시 시도 → 준비 완료

## 5. 나머지 과목 빠른 확인

- [ ] 운영체제·데이터 통신 문제를 하나씩 풀어 채점된다
- [ ] 통계 화면에 세 과목이 다 보인다
- [ ] 통계 화면 아래 "내보내기 (JSON)"로 받은 파일에 `"data-science"` 기록이 들어 있다(가져오기는 필요할 때만)

문제가 있으면 어느 단계에서 무엇이 보였는지(스크린샷, Response Headers)를 남긴다.
