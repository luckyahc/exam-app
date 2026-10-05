/**
 * 데이터 통신 graph 그림 12종 (docs/dc-question-types.md §4). 슬라이드 그림을 옮기지 않고
 * 같은 개념을 단순화해 데이터로 적고, components/qtypes/DcFigureSvg.tsx가 색 토큰으로 그린다.
 * 각 종류의 모양 근거는 DC_FIGURE_SOURCES(슬라이드 번호·그림).
 */
export type DcFigure =
  | { name: "flow"; mode: "simplex" | "half-duplex" | "full-duplex" }
  | { name: "topology"; shape: "mesh" | "star" | "bus" | "ring" }
  | { name: "signal"; form: "analog" | "digital" }
  | { name: "sine"; amplitude: "high" | "low"; cycles: number; phase: 0 | 90 | 180 }
  | { name: "spectrum"; spikes: { freq: number; amp: number }[] }
  | { name: "levels"; levels: 2 | 4; bits: string }
  | { name: "snr"; level: "high" | "low" }
  | { name: "keying"; scheme: "ask" | "fsk" | "psk"; bits: string }
  | { name: "constellation"; scheme: "ask" | "bpsk" | "4qam" | "16qam" }
  | { name: "analog-mod"; scheme: "am" | "fm" | "pm" }
  | { name: "attenuation"; medium: "twisted-pair" | "coax"; trend: "rising" | "falling" | "flat" }
  | { name: "critical-angle"; incidence: "less" | "equal" | "greater" };

export type DcFigureName = DcFigure["name"];

/** 그림 모양의 근거 — DC-1-Introduction.pdf(Ch01)·DC-2-PhyLayer.pdf(Ch02)의 슬라이드 번호와 그림 */
export const DC_FIGURE_SOURCES: Record<DcFigureName, string> = {
  flow: "Ch01 s.5 그림 a. Simplex · b. Half-duplex · c. Full-duplex (DC-1 p.3)",
  topology: "Ch01 s.9 메시(5스테이션)·s.10 스타(4)·s.11 버스(3, tap·drop line)·s.12 링(6, repeater) (DC-1 p.5~6)",
  signal: "Ch02 s.6 그림 a. Analog signal · b. Digital signal (DC-2 p.3)",
  sine: "Ch02 s.9 진폭이 다른 두 신호, s.10 주파수가 다른 두 신호(12 Hz·6 Hz), s.12 위상 0°·90°·180° (DC-2 p.5~6)",
  spectrum: "Ch02 s.14 사인파 하나 = 스파이크 하나, s.15 그림 a·b(주파수 0·8·16, 진폭 15·10·5) (DC-2 p.7~8)",
  levels: "Ch02 s.19 그림 a. 2레벨(8 bps, r=1) · b. 4레벨(16 bps, r=2) (DC-2 p.10)",
  snr: "Ch02 s.32 그림 a. High SNR · b. Low SNR (DC-2 p.16)",
  keying: "Ch02 s.69 BASK(OOK)·s.71 BFSK·s.73 BPSK 파형, 비트 1 0 1 1 0 (DC-2 p.35~37)",
  constellation: "Ch02 s.75 그림 a. ASK(OOK) · b. BPSK, s.76 그림 a~c. 4-QAM · d. 16-QAM (DC-2 p.38)",
  "analog-mod": "Ch02 s.78 AM·s.79 FM·s.80 PM의 Modulating signal / Modulated signal 파형 (DC-2 p.39~40)",
  attenuation: "Ch02 s.94 꼬임쌍선 감쇠 곡선(1~1000 kHz, 100 kHz 이상 급증)·s.96 동축 감쇠 곡선(0.01~100 MHz) (DC-2 p.47~48)",
  "critical-angle": "Ch02 s.97 그림 I < / = / > 임계각 (DC-2 p.49) — 세 번째 그림 캡션은 refraction이지만 화살표는 반사, s.98 \"use reflection\"",
};

const BITS = /^[01]+$/;

/** 데이터 오류 메시지(빈 배열 = 정상) */
export function validateDcFigure(f: DcFigure): string[] {
  const e: string[] = [];
  const oneOf = <T>(v: T, allowed: readonly T[], what: string) => {
    if (!allowed.includes(v)) e.push(`${f.name}.${what}: ${String(v)}`);
  };
  switch (f.name) {
    case "flow":
      oneOf(f.mode, ["simplex", "half-duplex", "full-duplex"], "mode");
      break;
    case "topology":
      oneOf(f.shape, ["mesh", "star", "bus", "ring"], "shape");
      break;
    case "signal":
      oneOf(f.form, ["analog", "digital"], "form");
      break;
    case "sine":
      oneOf(f.amplitude, ["high", "low"], "amplitude");
      oneOf(f.phase, [0, 90, 180], "phase");
      if (!(Number.isInteger(f.cycles) && f.cycles >= 1 && f.cycles <= 12)) e.push("sine.cycles는 1~12 정수");
      break;
    case "spectrum":
      if (f.spikes.length < 1 || f.spikes.length > 5) e.push("spectrum 스파이크는 1~5개");
      if (f.spikes.some((s) => !(s.freq >= 0 && s.freq <= 20 && s.amp > 0 && s.amp <= 1))) e.push("spectrum: freq 0~20, amp 0~1");
      break;
    case "levels":
      oneOf(f.levels, [2, 4], "levels");
      if (!BITS.test(f.bits) || f.bits.length > 16 || (f.levels === 4 && f.bits.length % 2)) e.push("levels.bits: 0/1, 4레벨이면 짝수 길이");
      break;
    case "snr":
      oneOf(f.level, ["high", "low"], "level");
      break;
    case "keying":
      oneOf(f.scheme, ["ask", "fsk", "psk"], "scheme");
      if (!BITS.test(f.bits) || f.bits.length > 8) e.push("keying.bits: 0/1 최대 8개");
      break;
    case "constellation":
      oneOf(f.scheme, ["ask", "bpsk", "4qam", "16qam"], "scheme");
      break;
    case "analog-mod":
      oneOf(f.scheme, ["am", "fm", "pm"], "scheme");
      break;
    case "attenuation":
      oneOf(f.medium, ["twisted-pair", "coax"], "medium");
      oneOf(f.trend, ["rising", "falling", "flat"], "trend");
      break;
    case "critical-angle":
      oneOf(f.incidence, ["less", "equal", "greater"], "incidence");
      break;
    default:
      e.push(`알 수 없는 그림: ${(f as { name: string }).name}`);
  }
  return e;
}
