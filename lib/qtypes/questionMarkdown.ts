import { splitBlankText } from "./blank";
import { choiceOrder } from "./choiceOrder";
import { questionData, type Cell } from "./dataSnapshots";
import { matchOptions } from "./match";
import type { Question } from "./registry";
import { shuffledIndexes } from "@/lib/random";

/**
 * "문제 복사하기"의 Markdown. 화면에 보이는 문제 그대로(보기 순서 포함)이고 정답·해설은 넣지 않는다.
 * 빈칸은 화면과 같은 #1, #2로 적는다. 순서 맞추기는 데이터가 정답 순서이므로 화면처럼 섞어서 적는다.
 */
const fence = (language: string, source: string) => {
  const longest = Math.max(2, ...[...source.matchAll(/`+/g)].map((m) => m[0].length));
  const ticks = "`".repeat(longest + 1);
  return `${ticks}${language}\n${source.replace(/\n$/, "")}\n${ticks}`;
};

const cellText = (v: Cell) => (v === null ? "NULL" : String(v).replace(/\|/g, "\\|").replace(/\n/g, " "));
const row = (cells: readonly string[]) => `| ${cells.join(" | ")} |`;
const table = (head: readonly string[], rows: readonly (readonly string[])[]) =>
  [row(head), row(head.map(() => "---")), ...rows.map(row)].join("\n");
const bullets = (items: readonly string[]) => items.map((s) => `- ${s}`).join("\n");
const numbered = (items: readonly string[]) => items.map((s, i) => `${i + 1}. ${s}`).join("\n");
/** 여러 줄 보기(실행 결과)는 코드 블록으로 */
const choiceText = (c: string) => (c.includes("\n") ? `\n\n${fence("text", c).replace(/^/gm, "   ")}\n` : c);
const blanksToSlots = (s: string) =>
  splitBlankText(s)
    .map((p) => (typeof p === "number" ? `#${p + 1}` : p))
    .join("");

function dataTables(q: Question): string[] {
  const data = questionData(q);
  if (!data) return [];
  if (data.kind === "sql")
    return data.tables.map(
      ({ name, table: t }) =>
        `**${name}**\n\n${table(
          t.columns.map((c) => c.name),
          t.rows.map((r) => r.map(cellText)),
        )}`,
    );
  return [
    ...data.files.flatMap((f) =>
      f.kind === "csv"
        ? [`**${f.name}**\n\n${fence("text", f.text)}`]
        : f.sheets.map((s) => {
            const width = Math.max(0, ...s.rows.map((r) => r.length));
            const rows = s.rows.map((r) => Array.from({ length: width }, (_, i) => cellText(r[i] ?? null)));
            const [head = [], ...rest] = rows;
            return `**${f.name} · ${s.name}**\n\n${table(head, rest)}`;
          }),
    ),
    ...data.frames.map(
      (f) =>
        `**${f.name}**\n\n${table(
          ["", ...f.columns.map((c) => c.name)],
          f.rows.map((r, i) => [cellText(f.index[i] ?? null), ...r.map(cellText)]),
        )}`,
    ),
  ];
}

function body(q: Question): string[] {
  switch (q.type) {
    case "mcq":
    case "multi":
      return [
        ...(q.type === "multi" ? ["(복수 선택)"] : []),
        numbered(choiceOrder(q).map((i) => choiceText(q.choices[i]))),
      ];
    case "ox":
      return ["O / X"];
    case "blank":
      return [blanksToSlots(q.text), ...(q.bank ? [`보기: ${q.bank.join(", ")}`] : [])];
    case "code-blank":
      return [fence(q.language, blanksToSlots(q.source))];
    case "code-write":
      return q.starter.trim() ? [fence(q.language, q.starter)] : [];
    case "calc":
      return q.unit ? [`(단위: ${q.unit})`] : [];
    case "match":
      return [`**항목**\n\n${bullets(q.pairs.map((p) => p.left))}`, `**보기**\n\n${bullets(matchOptions(q))}`];
    case "order":
      return [bullets(shuffledIndexes(q.items.length, q.id).map((i) => q.items[i]))];
    case "classify":
      return [`**분류**: ${q.buckets.join(", ")}`, bullets(q.items.map((i) => i.label))];
    case "trace":
      return [
        table(
          ["", ...q.columns],
          q.rows.map((r) => [r.label, ...r.cells.map((c) => (c.blank ? "____" : c.value))]),
        ),
      ];
    case "graph":
      return [`(가로축: ${q.xLabel}, 세로축: ${q.yLabel})`, numbered(q.options.map((o) => o.label))];
    default:
      return [];
  }
}

export function questionMarkdown(q: Question): string {
  const code = "code" in q && q.code ? [fence(q.code.language, q.code.source)] : [];
  const figure = q.figure ? [`(그림: ${q.figure.alt})`] : [];
  return [q.prompt, ...code, ...dataTables(q), ...figure, ...body(q)].join("\n\n") + "\n";
}
