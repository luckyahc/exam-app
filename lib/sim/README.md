# lib/sim — 시뮬레이터 · 문제 생성기

과목별 폴더로 나눈다. 계산 문제의 정답은 사람이 쓰지 않고 이 코드로 계산하며, 슬라이드 기준값을 Vitest로 고정한다.

| 폴더 | 역할 | 구현 스프린트 |
|---|---|---|
| `_shared/` | 과목 공용: seed 기반 PRNG, `Generator` 인터페이스 | Sprint 4 |
| `os/` | 운영체제: 페이징·세그먼테이션·버디·배치·CPU 시간·페이지 교체·프로세스 시나리오·메모리 용량 | Sprint 4 |
| `data-comm/` | 데이터 통신: signal·digital·decibel·capacity·performance·pcm·modulation·multiplexing·linkFill·tdmFrame | Sprint 9 |

설계: `docs/multi-subject-design.md` §6, `docs/dc-question-types.md` §3.
