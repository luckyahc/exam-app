"use client";

import { useId } from "react";
import type { DcFigure } from "@/lib/qtypes/dcFigure";

/**
 * 데이터 통신 graph 그림 12종(lib/qtypes/dcFigure.ts). 슬라이드 그림을 단순화해 다시 그린 것이다.
 * 색은 테마 토큰만 쓴다 — 주 선 var(--primary), 글자·기기 currentColor(foreground), 보조선 var(--muted).
 * 색만으로 구별하지 않도록 보조선은 점선, 각 부분에는 글자 라벨을 함께 단다.
 */

const W = 160;
const H = 110;
const PRI = "var(--primary)";
const MUT = "var(--muted)";
const FG = "currentColor";

/** t ∈ [0, 1] → (x, y) 함수를 n개 점으로 */
function path(fn: (t: number) => [number, number], n = 160) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = fn(i / n);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

const TAU = Math.PI * 2;

function Label({ x, y, children, anchor = "middle", size = 7 }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end"; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={FG}>
      {children}
    </text>
  );
}

function Axes({ x0 = 14, y0, x1 = 152, top = 8, xLabel, yLabel }: { x0?: number; y0: number; x1?: number; top?: number; xLabel?: string; yLabel?: string }) {
  return (
    <g>
      <g stroke={MUT} strokeWidth={1}>
        <line x1={x0} y1={top} x2={x0} y2={H - 8} />
        <line x1={x0} y1={y0} x2={x1} y2={y0} />
      </g>
      {xLabel && (
        <Label x={x1} y={Math.min(H - 2, y0 + 10)} anchor="end">
          {xLabel}
        </Label>
      )}
      {yLabel && (
        <Label x={x0 + 3} y={top + 5} anchor="start">
          {yLabel}
        </Label>
      )}
    </g>
  );
}

function Device({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <rect x={x - 7} y={y - 5} width={14} height={10} rx={1.5} fill="var(--surface)" stroke={FG} strokeWidth={1.2} />
      {label && (
        <Label x={x} y={y + 2.5} size={6}>
          {label}
        </Label>
      )}
    </g>
  );
}

function Bits({ bits, x0, w, y }: { bits: string[]; x0: number; w: number; y: number }) {
  return (
    <g>
      {bits.map((b, i) => (
        <Label key={i} x={x0 + w * (i + 0.5)} y={y}>
          {b}
        </Label>
      ))}
      <g stroke={MUT} strokeDasharray="2 2" strokeWidth={0.8}>
        {bits.slice(1).map((_, i) => (
          <line key={i} x1={x0 + w * (i + 1)} y1={y + 2} x2={x0 + w * (i + 1)} y2={H - 8} />
        ))}
      </g>
    </g>
  );
}

function Figure({ f, arrow }: { f: DcFigure; arrow: string }) {
  const line = { fill: "none", stroke: PRI, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const end = `url(#${arrow})`;
  switch (f.name) {
    case "flow": {
      const y = 62;
      return (
        <g>
          <Device x={14} y={y} label="A" />
          <Device x={146} y={y} label="B" />
          <line x1={21} y1={y} x2={139} y2={y} stroke={FG} strokeWidth={1.2} />
          {f.mode === "simplex" && (
            <g>
              <line x1={40} y1={44} x2={120} y2={44} {...line} markerEnd={end} />
              <Label x={80} y={36}>데이터 방향 (A → B만)</Label>
            </g>
          )}
          {f.mode === "half-duplex" && (
            <g>
              <line x1={40} y1={44} x2={120} y2={44} {...line} markerEnd={end} />
              <Label x={80} y={36}>시각 1의 데이터 방향</Label>
              <line x1={120} y1={80} x2={40} y2={80} {...line} strokeDasharray="5 3" markerEnd={end} />
              <Label x={80} y={94}>시각 2의 데이터 방향</Label>
            </g>
          )}
          {f.mode === "full-duplex" && (
            <g>
              <line x1={40} y1={44} x2={120} y2={44} {...line} markerStart={end} markerEnd={end} />
              <Label x={80} y={36}>항상 양쪽 방향 동시에</Label>
            </g>
          )}
        </g>
      );
    }
    case "topology": {
      if (f.shape === "mesh") {
        const pts = Array.from({ length: 5 }, (_, i) => {
          const a = -Math.PI / 2 + (i * TAU) / 5;
          return [80 + 40 * Math.cos(a), 57 + 40 * Math.sin(a)] as const;
        });
        return (
          <g>
            {pts.flatMap((p, i) =>
              pts.slice(i + 1).map((q, j) => <line key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={PRI} strokeWidth={1.3} />),
            )}
            {pts.map((p, i) => (
              <Device key={i} x={p[0]} y={p[1]} />
            ))}
          </g>
        );
      }
      if (f.shape === "star") {
        const xs = [22, 61, 99, 138];
        return (
          <g>
            {xs.map((x) => (
              <line key={x} x1={80} y1={30} x2={x} y2={85} stroke={PRI} strokeWidth={1.5} />
            ))}
            <rect x={56} y={16} width={48} height={16} rx={4} fill="var(--surface)" stroke={FG} strokeWidth={1.2} />
            <Label x={80} y={27}>스위치/허브</Label>
            {xs.map((x) => (
              <Device key={x} x={x} y={88} />
            ))}
          </g>
        );
      }
      if (f.shape === "bus") {
        const xs = [45, 80, 115];
        return (
          <g>
            <line x1={14} y1={62} x2={146} y2={62} stroke={PRI} strokeWidth={2.5} />
            <rect x={10} y={56} width={4} height={12} fill={FG} />
            <rect x={146} y={56} width={4} height={12} fill={FG} />
            {xs.map((x) => (
              <g key={x}>
                <line x1={x} y1={62} x2={x} y2={36} stroke={PRI} strokeWidth={1.3} />
                <rect x={x - 4} y={59} width={8} height={6} fill="var(--surface)" stroke={FG} strokeWidth={1} />
                <Device x={x} y={30} />
              </g>
            ))}
            <Label x={80} y={77}>탭(▭)·드롭 라인</Label>
            <Label x={12} y={50} anchor="start">케이블 끝</Label>
          </g>
        );
      }
      // ring
      const reps: [number, number, number, number][] = [
        [56, 34, 56, 18],
        [104, 34, 104, 18],
        [136, 57, 152, 57],
        [104, 80, 104, 96],
        [56, 80, 56, 96],
        [24, 57, 8, 57],
      ];
      return (
        <g>
          <rect x={24} y={34} width={112} height={46} rx={12} fill="none" stroke={PRI} strokeWidth={2} />
          {reps.map(([x, y, dx, dy], i) => (
            <g key={i}>
              <line x1={x} y1={y} x2={dx} y2={dy} stroke={FG} strokeWidth={1} />
              <rect x={x - 3.5} y={y - 3.5} width={7} height={7} fill={FG} />
              <Device x={dx} y={dy} />
            </g>
          ))}
          <Label x={80} y={60}>리피터(■)로 연결</Label>
        </g>
      );
    }
    case "signal": {
      const y0 = 58;
      if (f.form === "analog")
        return (
          <g>
            <Axes y0={y0} xLabel="시간" yLabel="값" />
            <path d={path((t) => [16 + t * 134, y0 - (20 + 14 * t) * Math.sin(TAU * (1.2 * t + 2.2 * t * t))])} {...line} />
          </g>
        );
      const steps = [0.5, 0, 1, 1, 0, 0, -0.6, 0];
      const w = 134 / steps.length;
      const d = steps.map((v, i) => `${i ? "L" : "M"}${16 + w * i},${y0 - v * 36} L${16 + w * (i + 1)},${y0 - v * 36}`).join(" ");
      return (
        <g>
          <Axes y0={y0} xLabel="시간" yLabel="값" />
          <path d={d} {...line} />
        </g>
      );
    }
    case "sine": {
      const y0 = 56;
      const a = f.amplitude === "high" ? 36 : 14;
      const phi = (f.phase * Math.PI) / 180;
      return (
        <g>
          <Axes y0={y0} xLabel="시간" yLabel="진폭" />
          <Label x={14} y={y0 + 9}>0</Label>
          <path d={path((t) => [14 + t * 136, y0 - a * Math.sin(TAU * f.cycles * t + phi)], 240)} {...line} />
        </g>
      );
    }
    case "spectrum": {
      const y0 = 92;
      const x = (fr: number) => 20 + (fr / 20) * 126;
      return (
        <g>
          <Axes y0={y0} xLabel="주파수" yLabel="진폭" />
          {f.spikes.map((s, i) => (
            <g key={i}>
              <line x1={x(s.freq)} y1={y0} x2={x(s.freq)} y2={y0 - s.amp * 72} stroke={PRI} strokeWidth={3} />
              <Label x={x(s.freq)} y={y0 + 9}>
                {String(s.freq)}
              </Label>
            </g>
          ))}
        </g>
      );
    }
    case "levels": {
      const symbols = f.levels === 2 ? [...f.bits] : (f.bits.match(/../g) ?? []);
      const yOf = (s: string) => (f.levels === 2 ? (s === "1" ? 34 : 80) : { "11": 26, "10": 46, "01": 66, "00": 86 }[s]!);
      const w = 134 / symbols.length;
      const d = symbols.map((s, i) => `${i ? "L" : "M"}${16 + w * i},${yOf(s)} L${16 + w * (i + 1)},${yOf(s)}`).join(" ");
      return (
        <g>
          <Axes y0={H - 8} yLabel="" />
          <Bits bits={symbols} x0={16} w={w} y={14} />
          <path d={d} {...line} />
          <Label x={152} y={H - 1} anchor="end">{`레벨 ${f.levels}개`}</Label>
        </g>
      );
    }
    case "snr": {
      const sig = f.level === "high" ? 16 : 5;
      const noise = (t: number) => 3.2 * Math.sin(TAU * 9 * t) + 2.2 * Math.sin(TAU * 17 * t + 1) + 1.6 * Math.sin(TAU * 29 * t + 2);
      const square = (t: number) => (t % 0.5 < 0.25 ? 1 : -1);
      const panel = (x0: number, fn: (t: number) => number, title: string) => (
        <g>
          <line x1={x0} y1={60} x2={x0 + 46} y2={60} stroke={MUT} strokeWidth={0.8} />
          <path d={path((t) => [x0 + t * 46, 60 - fn(t)], 120)} {...line} strokeWidth={1.5} />
          <Label x={x0 + 23} y={92}>
            {title}
          </Label>
        </g>
      );
      return (
        <g>
          {panel(4, (t) => sig * square(t), "신호")}
          {panel(57, noise, "잡음")}
          {panel(110, (t) => sig * square(t) + noise(t), "신호+잡음")}
        </g>
      );
    }
    case "keying": {
      const bits = [...f.bits];
      const w = 134 / bits.length;
      const y0 = 62;
      const fn = (t: number): [number, number] => {
        const i = Math.min(bits.length - 1, Math.floor(t * bits.length));
        const local = t * bits.length - i;
        const one = bits[i] === "1";
        const x = 16 + t * 134;
        if (f.scheme === "ask") return [x, y0 - (one ? 26 : 0) * Math.sin(TAU * 3 * local)];
        if (f.scheme === "fsk") return [x, y0 - 26 * Math.sin(TAU * (one ? 4 : 2) * local)];
        return [x, y0 - 26 * Math.sin(TAU * 3 * local + (one ? 0 : Math.PI))];
      };
      return (
        <g>
          <Axes y0={y0} xLabel="시간" />
          <Bits bits={bits} x0={16} w={w} y={14} />
          <path d={path(fn, 480)} {...line} strokeWidth={1.6} />
        </g>
      );
    }
    case "constellation": {
      const cx = 80;
      const cy = 56;
      const pts: [number, number][] =
        f.scheme === "ask"
          ? [
              [0, 0],
              [32, 0],
            ]
          : f.scheme === "bpsk"
            ? [
                [-32, 0],
                [32, 0],
              ]
            : f.scheme === "4qam"
              ? [
                  [-24, -24],
                  [24, -24],
                  [-24, 24],
                  [24, 24],
                ]
              : [-36, -12, 12, 36].flatMap((x) => [-36, -12, 12, 36].map((y): [number, number] => [x, y]));
      return (
        <g>
          <g stroke={MUT} strokeWidth={1}>
            <line x1={20} y1={cy} x2={142} y2={cy} markerEnd={end} />
            <line x1={cx} y1={100} x2={cx} y2={8} markerEnd={end} />
          </g>
          <Label x={146} y={cy + 3} anchor="start">I</Label>
          <Label x={cx + 4} y={12} anchor="start">Q</Label>
          {pts.map(([x, y], i) => (
            <circle key={i} cx={cx + x} cy={cy + y} r={3.6} fill={PRI} />
          ))}
        </g>
      );
    }
    case "analog-mod": {
      const m = (t: number) => Math.sin(TAU * t);
      const fc = 12;
      const carrier = (t: number) => {
        if (f.scheme === "am") return (1 + 0.6 * m(t)) * Math.sin(TAU * fc * t) / 1.6;
        if (f.scheme === "fm") return Math.sin(TAU * fc * t - 5 * Math.cos(TAU * t));
        return Math.sin(TAU * fc * t + 3.5 * m(t));
      };
      return (
        <g>
          <line x1={14} y1={28} x2={150} y2={28} stroke={MUT} strokeWidth={0.8} />
          <path d={path((t) => [14 + t * 136, 28 - 14 * m(t)])} fill="none" stroke={FG} strokeWidth={1.4} strokeDasharray="4 2.5" />
          <Label x={150} y={10} anchor="end">변조 신호(오디오)</Label>
          <line x1={14} y1={76} x2={150} y2={76} stroke={MUT} strokeWidth={0.8} />
          <path d={path((t) => [14 + t * 136, 76 - 22 * carrier(t)], 600)} {...line} strokeWidth={1.4} />
          <Label x={150} y={H - 2} anchor="end">변조된 신호</Label>
        </g>
      );
    }
    case "attenuation": {
      const y0 = 86;
      const ticks = f.medium === "twisted-pair" ? ["1", "10", "100", "1000"] : ["0.01", "0.1", "1", "10", "100"];
      const x = (i: number) => 22 + (i / (ticks.length - 1)) * 124;
      const shape = (t: number) =>
        f.trend === "rising" ? 6 + 12 * t + 56 * t ** 4 : f.trend === "falling" ? 62 - 8 * t - 40 * t ** 4 : 34;
      return (
        <g>
          <Axes x0={22} y0={y0} yLabel="감쇠 (dB/km)" />
          {ticks.map((tk, i) => (
            <g key={tk}>
              <line x1={x(i)} y1={y0} x2={x(i)} y2={y0 + 3} stroke={MUT} />
              <Label x={x(i)} y={y0 + 10} size={6.5}>
                {tk}
              </Label>
            </g>
          ))}
          <Label x={152} y={H - 1} anchor="end">{f.medium === "twisted-pair" ? "f (kHz, 로그 눈금)" : "f (MHz, 로그 눈금)"}</Label>
          <path d={path((t) => [22 + t * 124, y0 - shape(t)])} {...line} />
        </g>
      );
    }
    case "critical-angle": {
      const cx = 80;
      const cy = 46;
      const deg = { less: 22, equal: 42, greater: 62 }[f.incidence];
      const a = (deg * Math.PI) / 180;
      const L = 46;
      const from: [number, number] = [cx - L * Math.sin(a), cy + L * Math.cos(a)];
      const out: [number, number] =
        f.incidence === "less"
          ? [cx + L * Math.sin((58 * Math.PI) / 180), cy - L * Math.cos((58 * Math.PI) / 180)]
          : f.incidence === "equal"
            ? [cx + 56, cy - 1]
            : [cx + L * Math.sin(a), cy + L * Math.cos(a)];
      return (
        <g>
          <rect x={6} y={cy} width={148} height={H - cy - 6} fill={MUT} fillOpacity={0.18} />
          <line x1={6} y1={cy} x2={154} y2={cy} stroke={FG} strokeWidth={1} />
          <Label x={8} y={14} anchor="start">덜 조밀</Label>
          <Label x={8} y={cy + 10} anchor="start">더 조밀</Label>
          <line x1={cx} y1={8} x2={cx} y2={H - 6} stroke={MUT} strokeDasharray="3 2" />
          <path d={`M${from[0]},${from[1]} L${cx},${cy}`} {...line} markerEnd={end} />
          <path d={`M${cx},${cy} L${out[0]},${out[1]}`} {...line} markerEnd={end} />
          <path d={`M${cx},${cy + 18} A18,18 0 0 1 ${cx - 18 * Math.sin(a)},${cy + 18 * Math.cos(a)}`} fill="none" stroke={FG} strokeWidth={1} />
          <Label x={cx - 9 * Math.sin(a) - 3} y={cy + 30}>I</Label>
        </g>
      );
    }
  }
}

export function DcFigureSvg({ figure, title }: { figure: DcFigure; title: string }) {
  const arrow = `dc-arrow-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="h-auto w-full max-w-xs text-foreground" data-figure={figure.name}>
      <title>{title}</title>
      <defs>
        <marker id={arrow} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={PRI} />
        </marker>
      </defs>
      <Figure f={figure} arrow={arrow} />
    </svg>
  );
}
