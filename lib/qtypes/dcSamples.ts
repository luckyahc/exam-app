import { DC_GENERATORS } from "@/lib/sim/data-comm/generators";
import type { DcFigure } from "./dcFigure";
import type { GraphQ } from "./graph";
import type { Question } from "./registry";

/**
 * /playground 미리 보기용 데이터 통신 문제(Sprint 9 확인용 — 챕터 문제가 아니다. 정적 문제는 Sprint 10).
 * graph 그림 12종을 한 번씩 모두 쓰고, 생성기 10개에서 대표 변형을 하나씩 만든다.
 */

type Opt = { key: string; label: string; figure: DcFigure };

function graph(
  n: number,
  chapter: "ch01" | "ch02",
  topic: string,
  slideRef: string,
  prompt: string,
  options: Opt[],
  answerKey: string,
  explanation: string,
): GraphQ {
  return {
    id: `data-comm-${chapter}-demo-graph-${String(n).padStart(3, "0")}`,
    subject: "data-comm",
    chapter,
    topic,
    type: "graph",
    exam: false,
    difficulty: 1,
    slideRef,
    prompt,
    xLabel: "",
    yLabel: "",
    options: options.map((o) => ({ key: o.key, label: o.label, figure: { kind: "dc", figure: o.figure } })),
    answerKey,
    explanation,
  };
}

export const DC_GRAPH_SAMPLES: GraphQ[] = [
  graph(
    1,
    "ch01",
    "데이터 흐름: 단방향·반이중·전이중",
    "Ch01 s.5",
    "두 장치가 **번갈아** 데이터를 보내고, 한 시점에는 한쪽만 보내는 데이터 흐름을 나타낸 그림은?",
    [
      { key: "a", label: "단방향(simplex)", figure: { name: "flow", mode: "simplex" } },
      { key: "b", label: "반이중(half-duplex)", figure: { name: "flow", mode: "half-duplex" } },
      { key: "c", label: "전이중(full-duplex)", figure: { name: "flow", mode: "full-duplex" } },
    ],
    "b",
    "반이중은 양쪽 모두 보낼 수 있지만 동시에는 못 한다(시각 1과 시각 2의 방향이 다름). 단방향은 한쪽으로만, 전이중은 항상 양쪽으로 동시에 보낸다.",
  ),
  graph(
    2,
    "ch01",
    "물리 토폴로지 4종(메시·스타·버스·링)과 구성품",
    "Ch01 s.8-12",
    "모든 장치가 **중앙의 스위치나 허브**에 점대점으로 연결된 토폴로지는?",
    [
      { key: "a", label: "메시", figure: { name: "topology", shape: "mesh" } },
      { key: "b", label: "스타", figure: { name: "topology", shape: "star" } },
      { key: "c", label: "버스", figure: { name: "topology", shape: "bus" } },
      { key: "d", label: "링", figure: { name: "topology", shape: "ring" } },
    ],
    "b",
    "스타는 각 장치가 중앙 장치(스위치/허브)와만 연결된다. 메시는 모든 장치끼리 직접, 버스는 탭·드롭 라인으로 한 케이블에, 링은 리피터로 이웃과 연결된다.",
  ),
  graph(
    3,
    "ch02",
    "아날로그·디지털 데이터와 신호",
    "Ch02 s.6",
    "**디지털 신호**(정해진 몇 개의 값만 가짐)를 나타낸 그림은?",
    [
      { key: "a", label: "아날로그 신호", figure: { name: "signal", form: "analog" } },
      { key: "b", label: "디지털 신호", figure: { name: "signal", form: "digital" } },
    ],
    "b",
    "디지털 신호는 제한된 수의 값만 가져 계단 모양이다. 아날로그 신호는 범위 안의 무한히 많은 값을 연속으로 가진다.",
  ),
  graph(
    4,
    "ch02",
    "위상(도·라디안)",
    "Ch02 s.11-12",
    "진폭·주파수가 같은 사인파 중 위상이 **90°**인 것은? (시간 0에서의 위치로 판단)",
    [
      { key: "a", label: "위상 0°", figure: { name: "sine", amplitude: "high", cycles: 3, phase: 0 } },
      { key: "b", label: "위상 90°", figure: { name: "sine", amplitude: "high", cycles: 3, phase: 90 } },
      { key: "c", label: "위상 180°", figure: { name: "sine", amplitude: "high", cycles: 3, phase: 180 } },
    ],
    "b",
    "위상 90°(1/4 주기 이동)인 사인파는 시간 0에서 최대 진폭에서 시작한다. 0°는 0에서 올라가며, 180°는 0에서 내려가며 시작한다.",
  ),
  graph(
    5,
    "ch02",
    "시간/주파수 영역, 복합 신호, 대역폭",
    "Ch02 s.14-15",
    "주파수 **0, 8, 16**인 사인파 세 개(진폭은 큰 순서대로 15, 10, 5)로 된 신호를 **주파수 영역**으로 나타낸 그림은?",
    [
      {
        key: "a",
        label: "0·8·16에 진폭 15·10·5",
        figure: {
          name: "spectrum",
          spikes: [
            { freq: 0, amp: 1 },
            { freq: 8, amp: 2 / 3 },
            { freq: 16, amp: 1 / 3 },
          ],
        },
      },
      {
        key: "b",
        label: "0·8·16에 진폭 5·10·15",
        figure: {
          name: "spectrum",
          spikes: [
            { freq: 0, amp: 1 / 3 },
            { freq: 8, amp: 2 / 3 },
            { freq: 16, amp: 1 },
          ],
        },
      },
      {
        key: "c",
        label: "4·8·12에 진폭 15·10·5",
        figure: {
          name: "spectrum",
          spikes: [
            { freq: 4, amp: 1 },
            { freq: 8, amp: 2 / 3 },
            { freq: 12, amp: 1 / 3 },
          ],
        },
      },
    ],
    "a",
    "주파수 영역에서는 사인파 하나가 스파이크 하나다 — 스파이크의 위치가 주파수, 높이가 진폭이다(슬라이드 s.15).",
  ),
  graph(
    6,
    "ch02",
    "디지털 신호: 레벨·r, 비트율, 비트 길이",
    "Ch02 s.19",
    "신호 요소 하나가 **2비트**를 나르는(r = 2) 디지털 신호는?",
    [
      { key: "a", label: "2레벨(r = 1)", figure: { name: "levels", levels: 2, bits: "10110001" } },
      { key: "b", label: "4레벨(r = 2)", figure: { name: "levels", levels: 4, bits: "1110010100000010" } },
    ],
    "b",
    "레벨이 4개면 신호 요소 하나가 log₂ 4 = 2비트(11·10·01·00)를 나른다. 2레벨은 r = 1이다.",
  ),
  graph(
    7,
    "ch02",
    "SNR / SNR_dB",
    "Ch02 s.32",
    "**SNR이 높은** 경우를 나타낸 그림은? (잡음은 두 그림이 같다)",
    [
      { key: "a", label: "높은 SNR", figure: { name: "snr", level: "high" } },
      { key: "b", label: "낮은 SNR", figure: { name: "snr", level: "low" } },
    ],
    "a",
    "SNR = 신호 전력 / 잡음 전력이다. 잡음이 같을 때 신호가 클수록 SNR이 높고, 신호+잡음에서도 원래 신호 모양이 잘 보인다.",
  ),
  graph(
    8,
    "ch02",
    "BASK·BFSK·BPSK 대역폭·구현, 성상도, QAM",
    "Ch02 s.69-73",
    "비트 `1 0 1 1 0`을 **주파수**를 바꿔 나타낸 파형(BFSK)은?",
    [
      { key: "a", label: "BASK", figure: { name: "keying", scheme: "ask", bits: "10110" } },
      { key: "b", label: "BFSK", figure: { name: "keying", scheme: "fsk", bits: "10110" } },
      { key: "c", label: "BPSK", figure: { name: "keying", scheme: "psk", bits: "10110" } },
    ],
    "b",
    "BFSK는 비트에 따라 반송파 주파수를 바꾼다(1은 빽빽, 0은 느슨). BASK는 진폭(0이면 신호 없음, OOK), BPSK는 위상(0이면 뒤집힘)을 바꾼다.",
  ),
  graph(
    9,
    "ch02",
    "BASK·BFSK·BPSK 대역폭·구현, 성상도, QAM",
    "Ch02 s.75-76",
    "**16-QAM**의 성상도는?",
    [
      { key: "a", label: "ASK(OOK)", figure: { name: "constellation", scheme: "ask" } },
      { key: "b", label: "BPSK", figure: { name: "constellation", scheme: "bpsk" } },
      { key: "c", label: "4-QAM", figure: { name: "constellation", scheme: "4qam" } },
      { key: "d", label: "16-QAM", figure: { name: "constellation", scheme: "16qam" } },
    ],
    "d",
    "16-QAM은 진폭과 위상을 함께 바꿔 신호 요소 16개(점 16개)를 쓴다. 점이 2개면 ASK(OOK: 원점과 한 점)나 BPSK(원점 양쪽), 4개면 4-QAM이다.",
  ),
  graph(
    10,
    "ch02",
    "아날로그→아날로그: AM·FM·PM 대역폭, 대역 할당",
    "Ch02 s.78",
    "변조 신호에 따라 반송파의 **진폭**이 바뀌는 변조(AM)를 나타낸 그림은?",
    [
      { key: "a", label: "AM", figure: { name: "analog-mod", scheme: "am" } },
      { key: "b", label: "FM", figure: { name: "analog-mod", scheme: "fm" } },
    ],
    "a",
    "AM은 반송파의 진폭이 변조 신호를 따라 커졌다 작아진다(포락선이 변조 신호 모양). FM은 진폭은 일정하고 주파수(빽빽함)가 바뀐다.",
  ),
  graph(
    11,
    "ch02",
    "전송 매체 분류(유도/비유도), 꼬임쌍선(UTP/STP)",
    "Ch02 s.94",
    "꼬임쌍선에서 **주파수에 따른 감쇠**의 경향을 바르게 나타낸 그래프는?",
    [
      { key: "a", label: "주파수가 높을수록 감쇠 증가(100 kHz 이상 급증)", figure: { name: "attenuation", medium: "twisted-pair", trend: "rising" } },
      { key: "b", label: "주파수가 높을수록 감쇠 감소", figure: { name: "attenuation", medium: "twisted-pair", trend: "falling" } },
      { key: "c", label: "주파수와 무관", figure: { name: "attenuation", medium: "twisted-pair", trend: "flat" } },
    ],
    "a",
    "슬라이드 s.94: 주파수가 높아지면 감쇠가 커지고 100 kHz 이상에서 급격히 늘어난다. 동축 케이블(s.96)도 같은 경향이다.",
  ),
  graph(
    12,
    "ch02",
    "동축 케이블, 광섬유(임계각·클래딩)",
    "Ch02 s.97-98",
    "입사각이 **임계각보다 클 때** 빛의 진행을 나타낸 그림은?",
    [
      { key: "a", label: "I < 임계각: 굴절", figure: { name: "critical-angle", incidence: "less" } },
      { key: "b", label: "I = 임계각: 경계면을 따라 진행", figure: { name: "critical-angle", incidence: "equal" } },
      { key: "c", label: "I > 임계각: 반사", figure: { name: "critical-angle", incidence: "greater" } },
    ],
    "c",
    "입사각이 임계각보다 크면 빛이 덜 조밀한 물질로 나가지 못하고 반사된다 — 광섬유는 이 반사로 빛을 코어 안에 가둔다(s.98). 임계각보다 작으면 굴절, 같으면 경계면을 따라 간다.",
  ),
];

/** 생성기별 대표 변형(고정 seed) */
const GENERATED: [keyof typeof DC_GENERATORS, string | undefined, number][] = [
  ["capacity", "shannon", 2],
  ["capacity", "bothLevels", 3],
  ["capacity", "bothTrace", 4],
  ["performance", "bdp", 5],
  ["link-fill", undefined, 6],
  ["signal", "wavelength", 7],
  ["digital", "bitLength", 8],
  ["decibel", "snrDb", 9],
  ["performance", "latency", 10],
  ["pcm", "bitRate", 11],
  ["modulation", "fsk", 12],
  ["multiplexing", "fdm", 13],
  ["tdm-frame", undefined, 14],
];

export function dcPlaygroundQuestions(): Question[] {
  const generated = GENERATED.map(([name, variant, seed]) => DC_GENERATORS[name].generate(seed, variant ? ({ variant } as never) : undefined));
  return [...generated, ...DC_GRAPH_SAMPLES];
}
