import type { CalcQ } from "@/lib/qtypes/calc";
import {
  backoffTimes,
  bitStuff,
  checksum4,
  crcEncode,
  crcSyndrome,
  csmaCdMinFrameBits,
  cyclicLeftShift,
  detectableErrors,
  dminToCorrect,
  frameTime,
  generatorBits,
  hammingDistance,
  isValidGenerator,
  linearMinDistance,
  load,
  macAddressType,
  nearestCodeword,
  parityCodeword,
  paritySyndrome,
  polynomialOf,
  pureAlohaS,
  pureVulnerable,
  slottedAlohaS,
  xorBits,
} from "@/lib/sim/data-comm/dataLink";
import { propagationTime } from "@/lib/sim/data-comm/performance";
import type { Question } from "@/types/question";

// Ch03 데이터 링크 계층(2026-11-03, 2학년 2학기 기말) — 근거: source/data-communication/DC-3-DataLinkLayer.pdf
// (슬라이드 100장, 한 쪽에 2장: PDF 쪽 = ⌈슬라이드 ÷ 2⌉). 출제 형식: docs/final/data-comm-format.md
// (족보 source/data-communication/jokbo — 단일 선택 5지 > '모두 고르시오' > #1~#n 빈칸).
// 계산·비트열 정답은 lib/sim/data-comm/dataLink.ts 함수로 구한다(손으로 쓴 값 없음, 슬라이드 기준값은 dataLink.test.ts).
// 강의 예제(Example 3.1~3.12, 그림 속 수치 예)는 원본 수치 그대로 + sourceRef. 해설은 "s.번호 (p.쪽):"으로 시작, 슬라이드에 없는 내용은 "(보충)".
// ⭐ 없음(Ch03 슬라이드에 인쇄 강조 근거가 없다).

const base = { subject: "data-comm", chapter: "ch03" } as const;
const plain = { exam: false } as const;

export const T = {
  basics: "노드·링크, DLC·MAC 부계층",
  framing: "프레이밍(문자·비트 중심), 바이트·비트 채우기",
  errors: "단일·버스트 오류, 중복 비트, 블록 코딩",
  hamming: "해밍 거리, dmin과 오류 검출",
  parity: "선형 블록 부호, 단순 패리티 검사",
  crc: "순환 부호, CRC, 다항식",
  checksum: "검사합",
  fec: "전진 오류 정정(FEC)",
  hdlc: "HDLC 전송 모드·프레임·제어 필드",
  ppp: "PPP 서비스·프레임·다중링크",
  aloha: "임의 접근, 순수·슬롯 ALOHA",
  csma: "CSMA, 지속 방식",
  cdca: "CSMA/CD·CSMA/CA",
  controlled: "제어 접근(예약·폴링·토큰 전달)",
  channel: "채널화(FDMA·TDMA·CDMA)",
  address: "링크 계층 주소, ARP",
} as const;

function calc(q: Omit<CalcQ, "subject" | "chapter" | "type">): CalcQ {
  return { ...base, type: "calc", ...q };
}
/** 보기에서 정답의 위치(정답이 보기에 정확히 한 번 있어야 한다) */
function at(choices: string[], correct: string): number {
  const i = choices.indexOf(correct);
  if (i < 0 || choices.lastIndexOf(correct) !== i) throw new Error(`정답 보기가 없거나 둘 이상: ${correct}`);
  return i;
}
const ms = (s: number) => Number((s * 1e3).toFixed(6));

// 슬라이드의 표 — Table 3.1(s.18), FEC 예의 표(s.43)
const TABLE_3_1 = ["000", "011", "101", "110"];
const FEC_TABLE = ["00000", "01011", "10101", "11110"];
const TFR = frameTime(200, 200e3); // Example 3.9~3.11: 200비트, 200 kbps → 1 ms

const stuffData = "0001111111001111101000";
const stuffChoices = [bitStuff(stuffData), "0001111101100111110100", "000111111010011111001000", "0001111110110011111001000", "00011111011001111101000"];
const crc = crcEncode("1001", "1011");
const crcChoices = ["011", "000", "110", "101", "111"].map((x) => `신드롬 ${x}`);
const fecGuess = nearestCodeword("01001", FEC_TABLE)!;
const cs = checksum4([7, 11, 12, 0, 6]);
const tp38 = propagationTime(600e3, 3e8);
const genChoices = ["1011", "11", "1001", "0110", "1010"];
const macChoices = ["A3:34:45:11:92:F1", "4A:30:10:21:10:1A", "47:20:1B:2E:08:EE", "A2:34:45:11:92:F1", "08:01:23:45:67:89"];
const polyChoices = [polynomialOf("1000011"), "x^6 + x^5 + 1", "x^5 + x + 1", "x^6 + x^2 + x", "x^7 + x^2 + x"];

const questions: Question[] = [
  // ───────────────────────────── 1. 노드·링크, 부계층 (s.2-7, s.60-61)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-basics-001",
    topic: T.basics,
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch03 s.4-5",
    prompt: "데이터 링크 계층에 대한 설명으로 옳은 것은?",
    choices: [
      "데이터 링크 계층의 통신은 노드 대 노드(node-to-node)이다",
      "데이터 링크 계층은 네트워크 계층과 전송 계층 사이에 있다",
      "데이터 링크 계층은 물리 계층에 서비스를 제공하고 네트워크 계층에서 서비스를 받는다",
      "두 끝 호스트와 라우터 사이의 네트워크를 노드라 부른다",
      "데이터 링크 계층의 링크는 점대점 링크 한 종류뿐이다",
    ],
    answerIndex: 0,
    explanation:
      "s.4 (p.2): Communication at the data-link layer is node-to-node — 두 끝 호스트와 라우터를 노드, 그 사이의 네트워크를 링크라 한다. s.5 (p.3): 데이터 링크 계층은 물리 계층과 네트워크 계층 사이에 있고, 네트워크 계층에 서비스를 제공하며 물리 계층에서 서비스를 받는다(방향이 반대인 보기가 오답). 링크는 점대점과 브로드캐스트 두 종류다.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-basics-002",
    topic: T.basics,
    type: "multi",
    difficulty: 1,
    slideRef: "Ch03 s.7",
    prompt: "**데이터 링크 제어(DLC)**의 기능에 포함되는 것을 모두 고르시오.",
    choices: ["프레이밍(framing)", "흐름 제어(flow control)", "오류 제어(error control)", "라우팅(경로 선택)", "IP 주소 할당"],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.7 (p.4): DLC deals with procedures for communication between two adjacent nodes … Its function includes framing, flow and error control. IEEE 표준에서는 논리 링크 제어(LLC)라 부른다. 라우팅·IP 주소는 네트워크 계층의 일이다.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-basics-003",
    topic: T.basics,
    type: "blank",
    difficulty: 2,
    slideRef: "Ch03 s.60-61",
    prompt: "빈칸을 차례대로 채우시오.",
    text: "IEEE는 LAN의 데이터 링크 계층을 상위의 {{0}} 부계층과 하위의 {{1}} 부계층으로 나눈다. 채널이 전용(점대점)이면 공유 매체 접근을 해결하는 {{2}} 부계층은 필요 없다.",
    blanks: [
      { accept: ["LLC", "논리 링크 제어", "Logical link control", "logical link control", "DLC", "데이터 링크 제어"] },
      { accept: ["MAC", "매체 접근 제어", "Medium access control", "medium access control", "Media access control", "media access control"] },
      { accept: ["MAC", "매체 접근 제어", "Medium access control", "medium access control", "Media access control", "media access control"] },
    ],
    explanation:
      "s.60 (p.30): IEEE has made this division for LANs — Upper sublayer: Logical link control (LLC), Lower sublayer: Medium access control (MAC). 슬라이드는 상위를 DLC 부계층이라고도 적는다(그래서 DLC도 정답). s.61 (p.31): MAC은 공유 매체(다중점·브로드캐스트 링크) 접근을 해결하며, If the channel is dedicated, we do not need the lower sublayer(s.6: 점대점 링크는 No MAC sublayer!).",
  },

  // ───────────────────────────── 2. 프레이밍 (s.8-12)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-framing-001",
    topic: T.framing,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.8-11",
    prompt: "프레이밍(framing)에 대한 설명으로 옳지 **않은** 것은?",
    choices: [
      "문자 중심 프로토콜의 데이터는 비트 열이며 상위 계층이 텍스트·그래픽·오디오·비디오 등으로 해석한다",
      "데이터 링크 계층은 프레임끼리 구별되도록 비트를 프레임으로 묶는다",
      "편지를 봉투에 넣는 것처럼, 봉투가 구분자(delimiter) 역할을 한다",
      "가변 크기 프레이밍에는 문자 중심 방식과 비트 중심 방식이 있다",
      "문자 중심 프로토콜의 프레임은 8비트 시작 플래그와 8비트 끝 플래그로 감싼다",
    ],
    answerIndex: 0,
    explanation:
      "s.11 (p.6): 데이터가 비트 열이고 상위 계층이 text, graphic, audio, video로 해석하는 것은 **비트 중심(bit-oriented)** 프로토콜이다. s.9 (p.5): 문자 중심(byte-oriented) 프로토콜은 ASCII 같은 부호 체계의 8비트 문자를 나르고, 프레임 앞뒤에 8-bit start/end flag가 있다. s.8 (p.4): 프레이밍의 목적과 봉투 비유, 고정 크기·가변 크기(문자 중심·비트 중심) 프레이밍.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-framing-002",
    topic: T.framing,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.12",
    prompt: `비트 중심 프로토콜에서 송신 측이 데이터 \`${stuffData}\`에 **비트 채우기(bit stuffing)**를 한 결과는?`,
    choices: stuffChoices,
    answerIndex: at(stuffChoices, bitStuff(stuffData)),
    explanation: `s.12 (p.6): Bit stuffing is the process of adding one extra 0 whenever five consecutive 1s follow a 0 in the data — 수신 측이 01111110을 플래그로 오해하지 않게 한다. 0 다음 1이 다섯 개 나올 때마다 0을 끼우면 000 11111[0]1 00 11111[0] 01000 → ${bitStuff(stuffData)}. 1이 여섯 개가 된 뒤에 끼우거나, 끝의 1 다섯 개 뒤에 끼우지 않으면 틀린다.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-framing-003",
    topic: T.framing,
    type: "blank",
    difficulty: 2,
    slideRef: "Ch03 s.10, 12",
    prompt: "빈칸을 차례대로 채우시오.",
    text: "문자 중심 프로토콜은 데이터 안에 플래그나 이스케이프 문자와 같은 패턴이 있으면 {{0}} 바이트를 하나 더 넣는다(바이트 채우기). 비트 중심 프로토콜은 데이터에서 0 다음에 1이 {{1}}개 연속하면 0을 하나 끼운다(비트 채우기). 두 방식 모두 플래그는 {{2}}이다.",
    blanks: [
      { accept: ["ESC", "esc", "이스케이프", "escape", "Escape", "이스케이프 문자", "escape character"] },
      { accept: ["5", "다섯", "5개"] },
      { accept: ["01111110", "7E", "0x7E", "7E16", "7E(16)"] },
    ],
    explanation:
      "s.10 (p.5): Byte stuffing is the process of adding 1 extra byte (ESC) when there is a character with the same pattern as the flag or escape character in the data. Flag 01111110(7E₁₆), ESC 00011011(1B₁₆). s.12 (p.6): adding one extra 0 whenever five consecutive 1s follow a 0. s.50 (p.25): HDLC 플래그도 01111110.",
  },

  // ───────────────────────────── 3. 오류·블록 코딩 (s.13-19)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-errors-001",
    topic: T.errors,
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch03 s.13-15",
    prompt: "오류 제어에 대한 설명으로 옳은 것은?",
    choices: [
      "버스트 오류는 데이터 단위에서 2개 이상의 비트가 바뀐 것이다",
      "단일 비트 오류는 데이터 단위에서 연속한 2비트가 바뀐 것이다",
      "오류 제어는 오류 검출만을 뜻하고 정정은 포함하지 않는다",
      "중복 비트는 수신 측이 더하고 송신 측이 제거한다",
      "오류를 검출하려면 데이터 비트 일부를 지우고 보내야 한다",
    ],
    answerIndex: 0,
    explanation:
      "s.14 (p.7): A burst error means that 2 or more bits in the data unit have changed. s.13 (p.7): 단일 비트 오류는 1비트만 바뀐 것, 오류 제어는 error detection and error correction 둘 다. s.15 (p.8): 오류를 검출·정정하려면 중복(redundant) 비트를 더 보내며, 중복 비트는 송신 측이 더하고 수신 측이 제거한다.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-errors-002",
    topic: T.errors,
    type: "blank",
    difficulty: 1,
    slideRef: "Ch03 s.16",
    prompt: "빈칸을 차례대로 채우시오.",
    text: "블록 코딩에서는 메시지를 k비트 블록으로 나누는데 이를 {{0}}라 한다. 각 블록에 중복 비트 r개를 더해 길이 n = k + r로 만든 n비트 블록을 {{1}}라 한다.",
    blanks: [
      { accept: ["dataword", "datawords", "Dataword", "데이터워드", "데이터 워드", "데이터어"] },
      { accept: ["codeword", "codewords", "Codeword", "코드워드", "코드 워드", "부호어"] },
    ],
    explanation:
      "s.16 (p.8): In block coding, we divide our message into blocks, each of k bits, called datawords. We add r redundant bits to each block to make the length n = k + r. The resulting n-bit blocks are called codewords.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-errors-003",
    sourceRef: { lecture: "Ch03", page: 9, label: "Example 3.1" },
    topic: T.errors,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.18-19",
    prompt:
      "k = 2, n = 3인 블록 부호의 유효 부호어는 `000`, `011`, `101`, `110`(데이터워드 00, 01, 10, 11 순)이다. 송신 측이 데이터워드 01을 `011`로 보냈는데 수신 측이 `000`을 받았다. 수신 측의 처리로 옳은 것은?",
    choices: [
      "유효 부호어이므로 데이터워드 00을 꺼낸다 — 두 비트 오류가 검출되지 않는다",
      "무효 부호어이므로 버린다",
      "오류를 정정해 데이터워드 01을 꺼낸다",
      "유효 부호어이므로 데이터워드 01을 꺼낸다",
      "한 비트 오류로 판단하고 재전송을 요청한다",
    ],
    answerIndex: 0,
    explanation: `s.19 (p.10) Example 3.1 case 3: 000 is received. This is a valid codeword. The receiver incorrectly extracts the dataword 00. Two corrupted bits have made the error undetectable(011과 000의 해밍 거리 ${hammingDistance("011", "000")}). case 2처럼 111을 받으면 무효라 버린다. An error-detecting code can detect only the types of errors for which it is designed.`,
  },

  // ───────────────────────────── 4. 해밍 거리 (s.20-23)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-hamming-001",
    sourceRef: { lecture: "Ch03", page: 10, label: "Example 3.2" },
    topic: T.hamming,
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch03 s.20",
    prompt: "두 단어 `10101`과 `11110`의 **해밍 거리** d(10101, 11110)는?",
    choices: ["1", "2", "3", "4", "5"],
    answerIndex: at(["1", "2", "3", "4", "5"], String(hammingDistance("10101", "11110"))),
    explanation: `s.20 (p.10) Example 3.2: 해밍 거리는 대응하는 비트가 다른 개수 = 두 단어를 XOR한 결과의 1의 개수. 10101 ⊕ 11110 = ${xorBits("10101", "11110")} → 1이 ${hammingDistance("10101", "11110")}개. 같은 예의 d(000, 011) = 2.`,
  },
  calc({
    ...plain,
    id: "data-comm-ch03-hamming-002",
    sourceRef: { lecture: "Ch03", page: 11, label: "최소 해밍 거리 예(Table 3.1)" },
    topic: T.hamming,
    difficulty: 2,
    slideRef: "Ch03 s.21",
    prompt: "유효 부호어가 `000`, `011`, `101`, `110`인 부호의 **최소 해밍 거리 dmin**은?",
    answer: 2,
    tolerance: 0,
    steps: ["모든 쌍의 해밍 거리: d(000,011)=2, d(000,101)=2, d(000,110)=2, d(011,101)=2, d(011,110)=2, d(101,110)=2", "가장 작은 값 = 2"],
    explanation:
      "s.21 (p.11): The minimum Hamming distance is the smallest Hamming distance between all possible pairs in a set of codewords. Table 3.1의 여섯 쌍이 모두 2라 dmin = 2.",
  }),
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-hamming-003",
    sourceRef: { lecture: "Ch03", page: 12, label: "Example 3.4" },
    topic: T.hamming,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.22-23",
    prompt: "최소 해밍 거리 dmin = 4인 부호가 모든 경우에 검출을 **보장**하는 오류는 최대 몇 개인가?",
    choices: ["1개", "2개", "3개", "4개", "5개"],
    answerIndex: detectableErrors(4) - 1,
    explanation: `s.22 (p.11): To guarantee the detection of up to s errors in all cases, dmin = s + 1. s.23 (p.12) Example 3.4: dmin = 4 → s = ${detectableErrors(4)}. 4개로 답하면 +1을 빼지 않은 것이고, 정정이라면 dmin = 2t + 1(s.42)을 쓴다.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-hamming-004",
    sourceRef: { lecture: "Ch03", page: 11, label: "Example 3.3" },
    topic: T.hamming,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.22",
    prompt: "dmin = 2인 부호(유효 부호어 `000`, `011`, `101`, `110`)로 셋째 부호어 `101`을 보냈다. 옳은 것은?",
    choices: [
      "오류가 1개면 수신 부호어가 어떤 유효 부호어와도 맞지 않아 검출된다",
      "오류가 2개여도 언제나 검출된다",
      "오류가 1개면 수신 측이 원래 부호어로 정정할 수 있다",
      "이 부호는 오류를 2개까지 검출하도록 보장한다",
      "오류가 몇 개든 수신 부호어는 무효 부호어가 된다",
    ],
    answerIndex: 0,
    explanation:
      "s.22 (p.11) Example 3.3: This code guarantees detection of only a single error (2 = 1 + 1). If the third codeword (101) is sent and one error occurs, the received codeword does not match any valid codeword. If two errors occur, however, the received codeword may match a valid codeword and the errors are not detected. 정정에는 dmin = 2t + 1 = 3 이상이 필요하다(s.42).",
  },

  // ───────────────────────────── 5. 선형 블록 부호·패리티 (s.24-31)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-parity-001",
    sourceRef: { lecture: "Ch03", page: 13, label: "Example 3.5" },
    topic: T.parity,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.24-25",
    prompt: "유효 부호어가 `000`, `011`, `101`, `110`인 부호가 **선형 블록 부호**인 까닭으로, 둘째 부호어와 셋째 부호어를 XOR한 결과는?",
    choices: ["110", "000", "011", "101", "111"],
    answerIndex: at(["110", "000", "011", "101", "111"], xorBits("011", "101")),
    explanation: `s.24 (p.12): 선형 블록 부호는 두 유효 부호어의 XOR(모듈로-2 덧셈)가 또 다른 유효 부호어인 부호. s.25 (p.13) Example 3.5: the XORing of the second and third codewords creates the fourth one — 011 ⊕ 101 = ${xorBits("011", "101")}. 111은 1의 개수가 홀수라 이 부호의 부호어가 아니다.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-parity-002",
    sourceRef: { lecture: "Ch03", page: 13, label: "Example 3.6" },
    topic: T.parity,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.26",
    prompt: "**선형 블록 부호**의 최소 해밍 거리를 구하는 방법으로 옳은 것은?",
    choices: [
      "0이 아닌 유효 부호어 가운데 1의 개수가 가장 적은 부호어의 1의 개수",
      "모든 유효 부호어의 1의 개수를 더한 값",
      "부호어 길이 n에서 데이터워드 길이 k를 뺀 값",
      "1의 개수가 가장 많은 유효 부호어의 1의 개수",
      "유효 부호어의 개수에서 1을 뺀 값",
    ],
    answerIndex: 0,
    explanation: `s.26 (p.13): The minimum Hamming distance (for a linear block code) is the number of 1s in the nonzero valid codeword with the smallest number of 1s. Example 3.6: Table 3.1의 0이 아닌 부호어 011, 101, 110의 1의 개수는 2, 2, 2 → dmin = ${linearMinDistance(TABLE_3_1)}.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-parity-003",
    topic: T.parity,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.27-31",
    prompt: "**단순 패리티 검사 부호**에 대한 설명으로 옳지 **않은** 것은?",
    choices: [
      "dmin = 2이므로 한 비트 오류를 정정할 수 있다",
      "k비트 데이터워드를 n = k + 1비트 부호어로 바꾼다",
      "패리티 비트는 부호어의 1의 개수가 짝수가 되도록 정한다",
      "선형 블록 부호에 속한다",
      "홀수 개의 오류를 검출할 수 있다",
    ],
    answerIndex: 0,
    explanation:
      "s.27 (p.14): n = k + 1, 패리티 비트는 1의 개수를 짝수로, dmin = 2 → single-bit error **detecting** code(검출만), The parity-check code is a linear block code. s.31 (p.16): A simple parity-check code can detect an odd number of errors. 한 비트를 정정하려면 dmin = 3이 필요하다(s.42).",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-parity-004",
    sourceRef: { lecture: "Ch03", page: 15, label: "Example 3.7" },
    topic: T.parity,
    type: "multi",
    difficulty: 2,
    slideRef: "Ch03 s.29-31",
    prompt: "송신 측이 데이터워드 1011을 단순 패리티 검사 부호 C(5, 4)의 부호어 `10111`로 보냈다. 수신 측이 받은 부호어 중 **신드롬이 0이어서 데이터워드를 만드는** 것을 모두 고르시오.",
    choices: ["10111", "10011", "10110", "00110", "01011"],
    answerIndexes: ["10111", "10011", "10110", "00110", "01011"].flatMap((w, i) => (paritySyndrome(w) === 0 ? [i] : [])),
    explanation: `s.30~31 (p.15~16) Example 3.7: 신드롬은 받은 5비트를 모두 XOR한 값(1의 개수가 짝수면 0). 10111(오류 없음) → 0, 데이터워드 1011. 10011(a1 오류)·10110(r0 오류) → 1, 버림. 00110(r0·a3 두 오류) → 0이라 잘못된 데이터워드 0011을 만든다. 01011(a3·a2·a1 세 오류) → 1, 버림 — 홀수 개 오류는 검출된다. 부호어 ${parityCodeword("1011")}.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-parity-005",
    topic: T.parity,
    type: "blank",
    difficulty: 1,
    slideRef: "Ch03 s.27-29",
    prompt: "빈칸을 차례대로 채우시오.",
    text: "단순 패리티 검사 부호 C(5, 4)에서 데이터워드 1101의 부호어는 {{0}}이다. 이 부호의 최소 해밍 거리는 {{1}}이다.",
    blanks: [{ accept: [parityCodeword("1101")] }, { accept: ["2", "dmin = 2", "dmin=2"] }],
    explanation: `s.27~28 (p.14): 패리티 비트는 부호어의 1의 개수를 짝수로 만든다 — 1101은 1이 3개라 패리티 1 → ${parityCodeword("1101")}. 이 부호류의 dmin = 2. s.29: 부호기는 데이터 4비트를 XOR해 r0을 만든다.`,
  },

  // ───────────────────────────── 6. 순환 부호·CRC (s.32-39)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-crc-001",
    sourceRef: { lecture: "Ch03", page: 16, label: "순환 이동 예(1011000)" },
    topic: T.crc,
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch03 s.32",
    prompt: "순환 부호에서 `1011000`이 부호어일 때, 이를 **왼쪽으로 순환 이동**한 결과도 부호어이다. 그 결과는?",
    choices: ["0110001", "0101100", "0110000", "1110000", "0001011"],
    answerIndex: at(["0110001", "0101100", "0110000", "1110000", "0001011"], cyclicLeftShift("1011000")),
    explanation: `s.32 (p.16): In a cyclic code, if a codeword is cyclically shifted (rotated), the result is another codeword. 1011000을 왼쪽으로 한 칸 돌리면 맨 왼쪽 1이 맨 오른쪽으로 → ${cyclicLeftShift("1011000")}. 0110000은 돌리지 않고 밀기만 한 것(맨 왼쪽 비트를 버림)이다.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-crc-002",
    sourceRef: { lecture: "Ch03", page: 18, label: "CRC 부호기 나눗셈" },
    topic: T.crc,
    type: "blank",
    difficulty: 3,
    slideRef: "Ch03 s.34-35",
    prompt: "빈칸을 차례대로 채우시오.",
    text: "CRC 부호 C(7, 4)에서 데이터워드가 1001, 제수가 1011이다. 송신 측은 데이터워드 뒤에 0을 {{0}}개 붙여 제수로 모듈로-2 나눗셈을 하고, 그 나머지 {{1}}을 데이터워드 뒤에 붙여 부호어 {{2}}를 보낸다.",
    blanks: [{ accept: ["3", "세", "3개"] }, { accept: [crc.remainder] }, { accept: [crc.codeword] }],
    explanation: `s.34~35 (p.17~18): 제수가 4비트라 0을 3개 붙인 1001000을 1011로 나눈다(모듈로-2의 덧셈·뺄셈은 XOR, 몫의 비트가 0인 단계는 0000으로 나눈다). 나머지 ${crc.remainder} → 부호어 ${crc.codeword} = Dataword plus remainder.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-crc-003",
    sourceRef: { lecture: "Ch03", page: 18, label: "CRC 복호기 나눗셈(2가지 경우)" },
    topic: T.crc,
    type: "mcq",
    difficulty: 3,
    slideRef: "Ch03 s.36",
    prompt: "제수 1011인 CRC 부호 C(7, 4)로 부호어 `1001110`을 보냈는데 전송 중 손상되어 `1000110`을 받았다. 수신 측의 **신드롬**은?",
    choices: crcChoices,
    answerIndex: at(crcChoices, `신드롬 ${crcSyndrome("1000110", "1011")}`),
    explanation: `s.36 (p.18): 복호기는 받은 부호어 전체를 제수로 나눈다. 손상되지 않은 1001110 → 신드롬 ${crcSyndrome("1001110", "1011")}(Zero, Dataword accepted). 1000110 → 신드롬 ${crcSyndrome("1000110", "1011")}(Non-Zero, Dataword discarded). 110은 송신 측 나머지다.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-crc-004",
    topic: T.crc,
    type: "multi",
    difficulty: 2,
    slideRef: "Ch03 s.38",
    prompt: "순환 부호의 **제수(generator)**가 될 수 있는 비트 패턴을 모두 고르시오.",
    choices: genChoices,
    answerIndexes: genChoices.flatMap((p, i) => (isValidGenerator(p) ? [i] : [])),
    explanation:
      "s.38 (p.19): To be considered a generator (divisor), a bit pattern needs to have at least two properties. 1. The pattern should have at least 2 bits. 2. The rightmost and leftmost bits should both be 1s. → 1011, 11, 1001은 조건을 만족하고, 0110(맨 왼쪽 0)·1010(맨 오른쪽 0)은 아니다. CRC codes can detect all single errors, some odd number errors, and some burst errors.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-crc-005",
    topic: T.crc,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.37",
    prompt: "비트열 `1000011`을 다항식으로 나타낸 것은?",
    choices: polyChoices,
    answerIndex: at(polyChoices, polynomialOf("1000011")),
    explanation: `s.37 (p.19): The power of each term shows the position of the bit; the coefficient shows the value of the bit. 7비트의 맨 왼쪽이 x^6, 맨 오른쪽이 x^0 = 1 → ${polynomialOf("1000011")}, 차수(the highest power)는 6. x^7로 시작하면 비트 수와 차수를 혼동한 것이다.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-crc-006",
    topic: T.crc,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.39",
    prompt: "표준 다항식 **CRC-32**의 제수는 몇 비트인가?",
    choices: ["31비트", "32비트", "33비트", "34비트", "64비트"],
    answerIndex: at(["31비트", "32비트", "33비트", "34비트", "64비트"], `${generatorBits(32)}비트`),
    explanation: `s.39 (p.20): Number of bits = (degree of polynomial) + 1 — For example, CRC-8 has 9 bits and CRC-32 has ${generatorBits(32)} bits. 32는 차수다.`,
  },

  // ───────────────────────────── 7. 검사합 (s.40-41)
  calc({
    ...plain,
    id: "data-comm-ch03-checksum-001",
    sourceRef: { lecture: "Ch03", page: 21, label: "검사합 4비트 예" },
    topic: T.checksum,
    difficulty: 3,
    slideRef: "Ch03 s.41",
    prompt: "4비트 검사합으로 숫자 7, 11, 12, 0, 6을 보낸다. 송신 측이 만드는 **검사합**을 10진수로 쓰시오.",
    answer: cs.checksum,
    tolerance: 0,
    steps: [`7 + 11 + 12 + 0 + 6 = ${cs.total} = 100100₂`, `4비트로 감싸기: 0100 + 10 = 0110 (= ${cs.wrapped})`, `1의 보수: 1001 (= ${cs.checksum})`],
    explanation: `s.41 (p.21): 합 36(100100)은 4비트를 넘으므로 왼쪽 2비트(10)를 오른쪽 4비트(0100)에 더해 0110 = 6, 그 1의 보수 1001 = ${cs.checksum}이 검사합(Checksum = –Sum). 수신 측은 7+11+12+0+6+9 = 45 → 1101 + 10 = 1111 → 보수 0000이라 수용한다. 감싸지 않고 36의 보수를 구하거나, 6을 그대로 답하면 틀린다.`,
  }),
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-checksum-002",
    topic: T.checksum,
    type: "mcq",
    difficulty: 1,
    slideRef: "Ch03 s.40",
    prompt: "인터넷에서 **검사합(checksum)** 기법이 주로 쓰이는 계층은?",
    choices: ["네트워크 계층과 전송 계층", "데이터 링크 계층", "물리 계층", "응용 계층과 물리 계층", "데이터 링크 계층의 MAC 부계층"],
    answerIndex: 0,
    explanation:
      "s.40 (p.20): Checksum is an error-detecting technique that can be applied to a message of any length. In the Internet, the checksum technique is mostly used at the network and transport layer rather than the data-link layer. 데이터 링크 계층의 HDLC·PPP는 FCS에 CRC를 쓴다(s.50, s.56).",
  },

  // ───────────────────────────── 8. FEC (s.42-45)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-fec-001",
    topic: T.fec,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.42",
    prompt: "패킷에서 오류 비트 **10개를 정정**하려면 최소 해밍 거리 dmin은 얼마여야 하는가?",
    choices: ["dmin = 10", "dmin = 11", "dmin = 20", "dmin = 21", "dmin = 22"],
    answerIndex: at(["dmin = 10", "dmin = 11", "dmin = 20", "dmin = 21", "dmin = 22"], `dmin = ${dminToCorrect(10)}`),
    explanation: `s.42 (p.21): to correct t errors, we need to have dmin = 2t + 1 — if we want to correct 10 bits in a packet, we need to make the minimum Hamming distance ${dminToCorrect(10)}, which means a lot of redundant bits. 11은 검출 공식(dmin = s + 1)을 쓴 값이다.`,
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-fec-002",
    sourceRef: { lecture: "Ch03", page: 22, label: "FEC 예(2비트 → 5비트 부호어)" },
    topic: T.fec,
    type: "mcq",
    difficulty: 3,
    slideRef: "Ch03 s.43-45",
    prompt:
      "2비트 데이터워드에 중복 비트 3개를 더한 부호(00 → `00000`, 01 → `01011`, 10 → `10101`, 11 → `11110`)에서 수신 측이 `01001`을 받았다. 오류가 1비트뿐이라고 가정할 때 수신 측이 꺼내는 데이터워드와 이 부호의 dmin은?",
    choices: ["01, dmin = 3", "00, dmin = 3", "01, dmin = 2", "10, dmin = 3", "버림(정정 불가), dmin = 2"],
    answerIndex: at(["01, dmin = 3", "00, dmin = 3", "01, dmin = 2", "10, dmin = 3", "버림(정정 불가), dmin = 2"], `${FEC_TABLE.indexOf(fecGuess).toString(2).padStart(2, "0")}, dmin = 3`),
    explanation: `s.44 (p.22): 받은 01001은 표에 없으므로 오류. 00000과는 ${hammingDistance("01001", "00000")}비트, 10101·11110과도 1비트보다 많이 다르고, 01011과만 1비트 다르다 → ${fecGuess}로 바꾸고 데이터워드 01. s.45 (p.23): 이 부호의 dmin은 3(= 2·1 + 1, t = 1)이라 1비트 정정이 된다.`,
  },

  // ───────────────────────────── 9. HDLC (s.46-53)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-hdlc-001",
    topic: T.hdlc,
    type: "multi",
    difficulty: 2,
    slideRef: "Ch03 s.46-48",
    prompt: "**HDLC**에 대한 설명으로 옳은 것을 모두 고르시오.",
    choices: [
      "비트 중심(bit-oriented) 프로토콜이다",
      "점대점 링크와 다중점 링크 모두에 쓰인다",
      "전송 모드로 정규 응답 모드(NRM)와 비동기 균형 모드(ABM)가 있다",
      "PPP에서 파생된 바이트 중심 프로토콜이다",
      "오늘날 흔히 쓰이는 모드는 불균형 방식인 NRM이다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.46~47 (p.23~24): HDLC is a bit-oriented protocol for communication over point-to-point and multipoint links. Two transfer modes — Normal response mode (NRM): Unbalanced, Asynchronous balanced mode (ABM): Common today! PPP가 HDLC에서 파생된 바이트 중심 프로토콜이다(방향이 반대).",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-hdlc-002",
    topic: T.hdlc,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.49-53",
    prompt: "HDLC 프레임 중 **링크 자체를 관리하는 정보(시스템 관리)**를 나르는 프레임은?",
    choices: ["U-프레임(Unnumbered frame)", "I-프레임(Information frame)", "S-프레임(Supervisory frame)", "PPP 프레임", "토큰(token)"],
    answerIndex: 0,
    explanation:
      "s.49 (p.25): Unnumbered frame (U-frame) — Reserved for system management, Information carried by U-frames is intended for managing the link itself. I-프레임은 사용자 데이터와 관련 제어 정보(피기배킹), S-프레임은 제어 정보만 나른다. s.53 (p.27): U-프레임은 5비트 코드로 32종까지 만든다.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-hdlc-003",
    topic: T.hdlc,
    type: "blank",
    difficulty: 3,
    slideRef: "Ch03 s.51-53",
    prompt: "빈칸을 차례대로 채우시오(약어로).",
    text: "HDLC 제어 필드의 첫 비트가 0이면 I-프레임, 첫 2비트가 10이면 S-프레임이다. S-프레임의 code가 00이면 {{0}}, 10이면 {{1}}, 01이면 REJ, 11이면 {{2}}이다.",
    blanks: [
      { accept: ["RR", "Receive ready", "receive ready"] },
      { accept: ["RNR", "Receive not ready", "receive not ready"] },
      { accept: ["SREJ", "Selective reject", "selective reject"] },
    ],
    explanation:
      "s.51 (p.26): First bit 0 means I-frame. s.52 (p.26): First 2 bits 10 means S-frame — 00 Receive ready (RR): 수신 확인, 10 Receive not ready (RNR): 수신 확인 + 수신 측이 바빠 더 받을 수 없음. s.53 (p.27): 01 Reject (REJ), 11 Selective reject (SREJ).",
  },

  // ───────────────────────────── 10. PPP (s.54-59)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-ppp-001",
    topic: T.ppp,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.55",
    prompt: "**PPP**가 제공하지 **않는** 서비스는?",
    choices: [
      "흐름 제어(flow control)",
      "두 장치가 링크 설정과 데이터 교환을 협상하는 기능",
      "IP뿐 아니라 여러 네트워크 계층의 페이로드 수용",
      "가정 사용자에게 임시 네트워크 주소를 설정해 주는 기능",
      "여러 링크에 걸친 연결(다중링크 PPP)",
    ],
    answerIndex: 0,
    explanation:
      "s.55 (p.28): Services not provided by PPP — PPP does not provide flow control. This may overwhelm the receiver. 오류는 검출만 하고 손상된 프레임은 버리며, 다중점 구성을 위한 정교한 주소 체계도 없다. 나머지 넷은 Services provided by PPP다.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-ppp-002",
    topic: T.ppp,
    type: "multi",
    difficulty: 3,
    slideRef: "Ch03 s.56, 59",
    prompt: "PPP 프레임에 대한 설명으로 옳은 것을 모두 고르시오.",
    choices: [
      "주소 필드는 상수 11111111(브로드캐스트 주소)이다",
      "제어 필드는 상수 00000011이며 흐름 제어 없이 오류 검출만 한다",
      "프로토콜 필드 0021(16)은 IP 데이터그램을 뜻한다",
      "다중링크 PPP에서는 프로토콜 필드를 003D(16)로 둔다",
      "비트 채우기로 플래그와 같은 패턴을 피한다",
    ],
    answerIndexes: [0, 1, 2, 3],
    explanation:
      "s.56 (p.28): PPP is a byte-oriented protocol using byte stuffing — Address: constant value 11111111 (broadcast address), Control: constant value 00000011 (imitating U-frame in HDLC): no flow control + error detection, Protocol: 0021(16) for IP datagram. s.59 (p.30): 다중링크 PPP는 The protocol field is set to 003D(16). 비트 채우기는 비트 중심인 HDLC 쪽이다.",
  },

  // ───────────────────────────── 11. 임의 접근·ALOHA (s.62-76)
  calc({
    ...plain,
    id: "data-comm-ch03-aloha-001",
    sourceRef: { lecture: "Ch03", page: 34, label: "Example 3.8" },
    topic: T.aloha,
    difficulty: 2,
    slideRef: "Ch03 s.66-67",
    prompt:
      "무선 ALOHA 네트워크의 스테이션들은 최대 600 km 떨어져 있고 신호는 3 × 10^8 m/s로 전파된다. 이진 지수 백오프에서 TB = R × Tp일 때, **K = 3**이면 TB의 최댓값은 몇 ms인가?",
    answer: Math.max(...backoffTimes(3, ms(tp38))),
    tolerance: 0,
    unit: "ms",
    steps: [`Tp = (600 × 10^3) / (3 × 10^8) = ${ms(tp38)} ms`, "K = 3 → R ∈ {0, 1, …, 2^3 − 1 = 7}", `TB 최대 = 7 × ${ms(tp38)} = ${Math.max(...backoffTimes(3, ms(tp38)))} ms`],
    explanation: `s.67 (p.34) Example 3.8: Tp = 2 ms. K = 1 → TB는 0 또는 2 ms, K = 2 → 0, 2, 4, 6 ms, K = 3 → 0, 2, 4, …, 14 ms. s.66: K번째 시도에서 R은 0 ~ 2^K − 1 중 하나(Binary exponential back-off). 2^3 × 2 = 16으로 답하면 −1을 빠뜨린 것이다.`,
  }),
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-aloha-002",
    sourceRef: { lecture: "Ch03", page: 35, label: "Example 3.9" },
    topic: T.aloha,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.68-69",
    prompt: "순수 ALOHA 네트워크가 200비트 프레임을 200 kbps 공유 채널로 보낸다. 이 프레임이 충돌하지 않기 위한 **취약 시간(vulnerable time)**은?",
    choices: ["0.5 ms", "1 ms", "2 ms", "4 ms", "200 ms"],
    answerIndex: at(["0.5 ms", "1 ms", "2 ms", "4 ms", "200 ms"], `${ms(pureVulnerable(TFR))} ms`),
    explanation: `s.69 (p.35) Example 3.9: Tfr = 200 bits / 200 kbps = ${ms(TFR)} ms, 순수 ALOHA의 취약 시간은 2 × Tfr = ${ms(pureVulnerable(TFR))} ms — 이 스테이션이 보내기 시작하기 1 ms 전부터, 보내는 1 ms 동안 다른 스테이션이 보내면 안 된다. 슬롯 ALOHA라면 취약 시간이 Tfr(1 ms)이다(s.74).`,
  },
  calc({
    ...plain,
    id: "data-comm-ch03-aloha-003",
    sourceRef: { lecture: "Ch03", page: 36, label: "Example 3.10" },
    topic: T.aloha,
    difficulty: 3,
    slideRef: "Ch03 s.70-72",
    prompt:
      "순수 ALOHA 네트워크가 200비트 프레임을 200 kbps 공유 채널로 보낸다. 시스템이 **초당 1000 프레임**을 만들 때, 살아남을 것으로 예상되는 프레임은 초당 몇 개인가? (S = 0.135로 계산, 정수로, ±1)",
    answer: Math.round(1000 * Number(pureAlohaS(load(1000, TFR)).toFixed(3))),
    tolerance: 1,
    unit: "프레임",
    steps: [`Tfr = 200 / 200 kbps = 1 ms → 1 ms에 1프레임, G = ${load(1000, TFR)}`, `S = G × e^(−2G) = ${pureAlohaS(1).toFixed(3)}`, `1000 × 0.135 = ${Math.round(1000 * 0.135)}`],
    explanation:
      "s.71 (p.36) Example 3.10 a: The load (G) is 1. S = G × e^−2G = 0.135 (13.5 percent) → 1000 × 0.135 = 135 frames. b: G = 1/2 → S = 0.184, 92 프레임(최대 처리율), c: G = 1/4 → S = 0.152, 38 프레임. s.70: 순수 ALOHA는 S = G·e^(−2G), 최대 0.184(G = 1/2). e^(−G)를 쓰면 슬롯 ALOHA 값 368이 나온다.",
  }),
  calc({
    ...plain,
    id: "data-comm-ch03-aloha-004",
    sourceRef: { lecture: "Ch03", page: 38, label: "Example 3.11" },
    topic: T.aloha,
    difficulty: 3,
    slideRef: "Ch03 s.74-76",
    prompt:
      "**슬롯 ALOHA** 네트워크가 200비트 프레임을 200 kbps 공유 채널로 보낸다. 시스템 전체가 **초당 500 프레임**을 만들 때, 살아남을 것으로 예상되는 프레임은 초당 몇 개인가? (S = 0.303으로 계산, 정수로, ±1)",
    answer: 151,
    tolerance: 1,
    unit: "프레임",
    steps: [`Tfr = 1 ms → 1 ms에 1/2 프레임, G = ${load(500, TFR)}`, `S = G × e^(−G) = ${slottedAlohaS(0.5).toFixed(3)}`, "500 × 0.303 = 151.5 → 슬라이드 151"],
    explanation: `s.76 (p.38) Example 3.11 b: The load is 1/2. S = G × e^−G = 0.303 (30.3 percent) → 500 × 0.303 = 151. a: G = 1 → 0.368, 368 프레임(슬라이드의 '0.0368'·'386'은 오기 — 1000 × 0.368 = 368), c: G = 1/4 → 0.195, 49 프레임. s.74: 슬롯 ALOHA는 S = G·e^(−G), 최대 0.368(G = 1). (보충) 151.5를 슬라이드는 151로 적어 ±1을 허용한다(정확한 S로는 ${(500 * slottedAlohaS(0.5)).toFixed(1)}).`,
  }),
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-aloha-005",
    topic: T.aloha,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.63-74",
    prompt: "순수 ALOHA와 슬롯 ALOHA를 비교한 것으로 옳은 것은?",
    choices: [
      "최대 처리율은 순수 ALOHA가 0.184(G = 1/2), 슬롯 ALOHA가 0.368(G = 1)이다",
      "취약 시간은 순수 ALOHA가 Tfr, 슬롯 ALOHA가 2 × Tfr이다",
      "순수 ALOHA는 매체가 쉬는지 확인한 뒤에만 보낸다",
      "슬롯 ALOHA의 처리율은 S = G × e^(−2G)이다",
      "ALOHA는 유선 LAN을 위해 개발되어 무선 매체에는 쓸 수 없다",
    ],
    answerIndex: 0,
    explanation: `s.70 (p.35): 순수 ALOHA Smax = 0.184 when G = 1/2(계산값 ${pureAlohaS(0.5).toFixed(3)}). s.74 (p.37): 슬롯 ALOHA S = G × e^−G, Smax = 0.368 when G = 1(${slottedAlohaS(1).toFixed(3)}), 취약 시간은 Tfr(순수는 2 × Tfr, s.68~69 — 뒤바뀐 보기). s.65: 순수 ALOHA는 보낼 프레임이 있으면 언제든 보낸다(감지는 CSMA). s.64: 원래 radio (wireless) LAN용으로 설계됐지만 어떤 공유 매체에도 쓸 수 있다.`,
  },

  // ───────────────────────────── 12. CSMA·지속 방식 (s.77-83)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-csma-001",
    topic: T.csma,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.80-81",
    prompt: "CSMA의 지속 방식 중 **1-지속(1-persistent)** 방식에 대한 설명으로 옳은 것은?",
    choices: [
      "회선이 쉬는 것을 알자마자 확률 1로 즉시 보내며, 이더넷의 기본 방식이다",
      "회선이 바쁘면 임의의 시간만큼 기다렸다가 다시 감지한다",
      "회선이 쉬면 확률 p로 보내고 확률 1 − p로 다음 시간 슬롯까지 기다린다",
      "둘 이상의 스테이션이 보내려 할 때 충돌 가능성이 가장 낮다",
      "회선이 쉬고 있을 때 네트워크 효율이 가장 낮다",
    ],
    answerIndex: 0,
    explanation:
      "s.80 (p.40): 1-persistent — 회선을 계속 감지하다 idle이면 즉시(with probability 1) 보낸다. Has the highest chance of collision, Achieves the highest network efficiency when the line is idle, Used in Ethernet (by default). s.81 (p.41): 바쁘면 임의 시간 기다렸다 다시 감지하는 것은 비지속(nonpersistent), 확률 p로 보내는 것은 p-지속.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-csma-002",
    topic: T.csma,
    type: "multi",
    difficulty: 2,
    slideRef: "Ch03 s.77-81",
    prompt: "CSMA에 대한 설명으로 옳은 것을 모두 고르시오.",
    choices: [
      "\"보내기 전에 감지하라(sense before transmit)\"는 원리에 바탕을 둔다",
      "비지속 방식은 회선이 쉬고 있을 때 네트워크 효율을 떨어뜨린다",
      "p-지속 방식은 1-지속과 비지속 방식의 장점을 합친 것이다",
      "CSMA는 충돌이 일어난 뒤의 처리 절차를 정한다",
      "매체를 감지하면 충돌이 완전히 없어진다",
    ],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.77 (p.39): CSMA is based on the principle “sense before transmit” or “listen before talk.” — 충돌 가능성을 줄일 뿐이다(s.78~79: 전파 지연 Tp 때문에 충돌이 남고, 취약 시간은 Tp). s.81 (p.41): Nonpersistent — Degrades the network efficiency when the line is idle, p-persistent — Combines the advantages of the previous two strategies. s.84 (p.42): CSMA does not specify the procedure following a collision — 그것을 더한 것이 CSMA/CD.",
  },

  // ───────────────────────────── 13. CSMA/CD·CA (s.84-90)
  calc({
    ...plain,
    id: "data-comm-ch03-cdca-001",
    sourceRef: { lecture: "Ch03", page: 44, label: "Example 3.12" },
    topic: T.cdca,
    difficulty: 3,
    slideRef: "Ch03 s.87",
    prompt: "CSMA/CD를 쓰는 네트워크의 대역폭이 10 Mbps이고 최대 전파 시간이 25.6 μs이다. **최소 프레임 크기**는 몇 비트인가?",
    answer: csmaCdMinFrameBits(10e6, 25.6e-6),
    tolerance: 0.5,
    unit: "비트",
    steps: ["최소 프레임 전송 시간 Tfr = 2 × Tp = 51.2 μs", `10 Mbps × 51.2 μs = ${csmaCdMinFrameBits(10e6, 25.6e-6)} 비트 (= 64 바이트)`],
    explanation:
      "s.87 (p.44) Example 3.12: The minimum frame transmission time is Tfr = 2 × Tp = 51.2 μs — 최악의 경우 충돌을 감지하려면 그동안 계속 보내야 한다. 10 Mbps × 51.2 μs = 512 bits or 64 bytes(Standard Ethernet의 최소 프레임 크기). 2를 곱하지 않으면 256, 바이트로 답하면 64.",
  }),
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-cdca-002",
    topic: T.cdca,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.88-90",
    prompt: "무선 네트워크에서 CSMA/CD 대신 **CSMA/CA**로 충돌을 피해야 하는 까닭은?",
    choices: [
      "무선에서는 보낸 에너지 대부분이 전송 중 사라져, 충돌이 더하는 에너지가 5~10 %뿐이라 충돌을 감지하기 어렵기 때문",
      "무선에서는 충돌이 일어나면 감지되는 에너지가 거의 두 배가 되기 때문",
      "무선 스테이션은 매체가 쉬는지 감지할 수 없기 때문",
      "무선 네트워크에는 공유 매체가 없기 때문",
      "CSMA/CD는 이진 지수 백오프를 쓸 수 없기 때문",
    ],
    answerIndex: 0,
    explanation:
      "s.90 (p.45): 유선에서는 받은 신호가 보낸 신호와 에너지가 거의 같아 충돌 시 감지 에너지가 거의 두 배가 된다(CSMA/CD). 무선에서는 much of the sent energy is lost — A collision may add only 5 to 10 % additional energy → Not useful for effective collision detection, 그래서 충돌을 피해야(avoid) 한다. s.88: CSMA/CD도 이진 지수 백오프(K < 15)와 재밍 신호를 쓴다.",
  },

  // ───────────────────────────── 14. 제어 접근 (s.91-93)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-controlled-001",
    topic: T.controlled,
    type: "multi",
    difficulty: 1,
    slideRef: "Ch03 s.62, 91-93",
    prompt: "다중 접근 프로토콜 중 **제어 접근(controlled access)** 방식을 모두 고르시오.",
    choices: ["예약(Reservation)", "폴링(Polling)", "토큰 전달(Token passing)", "ALOHA", "FDMA"],
    answerIndexes: [0, 1, 2],
    explanation:
      "s.91~93 (p.46~47): 제어 접근 — 예약(데이터를 보내기 전에 예약 프레임), 폴링(모든 교환은 주국을 거침: select·poll 기능), 토큰 전달(논리적 링을 도는 토큰). ALOHA는 임의 접근(s.63), FDMA는 채널화(s.94)다.",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-controlled-002",
    topic: T.controlled,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.92",
    prompt: "폴링(polling) 방식에서 **주국(primary)이 데이터를 받고 싶을 때** 부국들에게 보낼 것이 있는지 묻는 기능은?",
    choices: ["poll 기능", "select 기능", "예약 프레임", "토큰", "재밍 신호"],
    answerIndex: 0,
    explanation:
      "s.92 (p.46): All data exchanges must be made through the primary device. If the primary wants to receive data, it asks the secondaries if they have anything to send → poll function. 주국이 보내고 싶어 부국에게 받을 준비를 시키는 것은 select function이다.",
  },

  // ───────────────────────────── 15. 채널화 (s.94-97)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-channel-001",
    topic: T.channel,
    type: "mcq",
    difficulty: 2,
    slideRef: "Ch03 s.94-97",
    prompt: "채널화(channelization)에 대한 설명으로 옳은 것은?",
    choices: [
      "CDMA는 한 채널이 모든 전송을 동시에 나르며, 스테이션 i·j의 부호는 ci · cj = 0, ci · ci = N을 만족한다",
      "FDMA는 대역폭 전체를 한 채널로 두고 시간으로 나누어 쓴다",
      "TDMA는 대역폭을 보호 대역으로 분리된 여러 대역으로 나눈다",
      "CDMA에서 스테이션은 다른 스테이션의 부호 없이도 그 데이터를 꺼낼 수 있다",
      "채널화는 예약·폴링·토큰 전달과 같은 제어 접근 방식이다",
    ],
    answerIndex: 0,
    explanation:
      "s.94 (p.47): FDMA — 대역을 보호 대역(guard band)으로 분리된 여러 대역으로 나눔, TDMA — 대역폭 하나의 채널을 시간으로 나눠 씀(FDMA·TDMA 설명이 뒤바뀐 보기가 오답), CDMA — One channel carries all transmissions simultaneously. s.97 (p.49): 부호의 성질 ci · cj = 0, ci · ci = N(스테이션 수), Station 3 can detect the data sent by station 2 by using the code for station 2. 채널화는 제어 접근과 별개의 분류다(s.62).",
  },

  // ───────────────────────────── 16. 링크 계층 주소·ARP (s.98-100)
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-address-001",
    topic: T.address,
    type: "multi",
    difficulty: 3,
    slideRef: "Ch03 s.99",
    prompt: "강의자료의 규칙에 따라, 다음 이더넷 주소 중 **멀티캐스트 주소**를 모두 고르시오.",
    choices: macChoices,
    answerIndexes: macChoices.flatMap((a, i) => (macAddressType(a) === "multicast" ? [i] : [])),
    explanation:
      "s.99 (p.50): 이더넷 링크 계층 주소는 48비트(6바이트), 콜론으로 나눈 16진수 12자리. Unicast — The second digit is an even number in hexadecimal(A2:…), Multicast — The second digit is an odd number(A3:…), Broadcast — 모두 F. 두 번째 16진 숫자: A3 → 3(홀수), 4A → A=10(짝수), 47 → 7(홀수), A2 → 2(짝수), 08 → 8(짝수).",
  },
  {
    ...base,
    ...plain,
    id: "data-comm-ch03-address-002",
    topic: T.address,
    type: "blank",
    difficulty: 1,
    slideRef: "Ch03 s.99-100",
    prompt: "빈칸을 차례대로 채우시오.",
    text: "이더넷의 링크 계층 주소는 {{0}}비트이다. 노드는 다음 노드의 IP 주소를 알지만 프레임을 링크로 옮기려면 링크 계층 주소가 필요하므로, IP 주소로 링크 계층 주소를 찾는 {{1}} 프로토콜을 쓴다.",
    blanks: [{ accept: ["48", "48비트"] }, { accept: ["ARP", "Address Resolution Protocol", "주소 결정 프로토콜", "주소 변환 프로토콜", "주소 해석 프로토콜"] }],
    explanation:
      "s.99 (p.50): 48 bits (6 bytes) represented as 12 hexadecimal digits. s.100 (p.50): Anytime a node has an IP datagram to send to another node in a link, it has the IP address of the receiving node. However, the IP address of the next node is not helpful in moving a frame through a link; we need the link-layer address of the next node → ARP(Address Resolution Protocol).",
  },
];

export default questions;
