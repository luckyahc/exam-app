import { describe, expect, it } from "vitest";
import { validateBase } from "./base";
import { blankCore, type BlankQ } from "./blank";
import { calcCore, type CalcQ, parseNumber } from "./calc";
import { classifyCore, type ClassifyQ } from "./classify";
import { QTYPE_FIXTURES } from "./fixtures";
import { graphCore, type GraphQ } from "./graph";
import { matchCore, matchOptions, type MatchQ } from "./match";
import { mcqCore, type McqQ } from "./mcq";
import { multiCore, type MultiQ, multiScore } from "./multi";
import { orderCore, type OrderQ } from "./order";
import { oxCore, type OxQ } from "./ox";
import { choiceOrder } from "./choiceOrder";
import { mulberry32, shuffledIndexes } from "@/lib/random";
import {
  type AnyAnswer,
  coreFor,
  gradeQuestion,
  type QType,
  QTYPES,
  type QuestionOf,
} from "./registry";
import { blankCells, cellKey, traceCore, type TraceQ } from "./trace";

function fixture<K extends QType>(type: K): QuestionOf<K> {
  const q = QTYPE_FIXTURES.find((f) => f.type === type);
  if (!q) throw new Error(`fixture 없음: ${type}`);
  return q as QuestionOf<K>;
}

describe("레지스트리 · 더미 문제", () => {
  it("11개 유형이 모두 등록되어 있고 유형마다 더미 문제가 있다", () => {
    expect(QTYPES).toEqual([
      "mcq",
      "multi",
      "ox",
      "blank",
      "order",
      "match",
      "classify",
      "calc",
      "trace",
      "graph",
      "code-blank",
    ]);
    for (const t of QTYPES) expect(QTYPE_FIXTURES.some((f) => f.type === t)).toBe(true);
  });

  it.each(QTYPE_FIXTURES.map((q) => [q.type, q] as const))(
    "%s 더미 문제는 공통·유형 검증을 통과",
    (_, q) => {
      expect(validateBase(q)).toEqual([]);
      expect(coreFor(q).validate(q as never)).toEqual([]);
    },
  );

  it.each(QTYPE_FIXTURES.map((q) => [q.type, q] as const))(
    "%s 빈 답안은 미완성이고 정답이 아니다",
    (_, q) => {
      const core = coreFor(q);
      const empty = core.emptyAnswer(q as never);
      if (q.type !== "order") expect(core.isComplete(q as never, empty as never)).toBe(false);
      expect(core.grade(q as never, empty as never).correct).toBe(false);
    },
  );
});

describe("validateBase", () => {
  const base = fixture("mcq");
  it("id 형식·접두사·번호 규칙", () => {
    expect(validateBase({ ...base, id: "os-ch08-demo-mcq-1" })).toContainEqual(
      expect.stringContaining("3자리"),
    );
    expect(validateBase({ ...base, id: "os-ch07-demo-mcq-001" })).toContainEqual(
      expect.stringContaining("os-ch08-"),
    );
    expect(validateBase({ ...base, id: "OS-ch08-x-001" })).not.toEqual([]);
  });
  it("examBasis는 exam과 짝이 맞아야 한다", () => {
    expect(validateBase({ ...base, exam: true, examBasis: undefined })).toContainEqual(
      expect.stringContaining("examBasis 필수"),
    );
    expect(validateBase({ ...base, exam: false, examBasis: "handwritten" })).not.toEqual([]);
    expect(validateBase({ ...base, exam: true, examBasis: "printed-emphasis" })).toEqual([]);
  });
  it("생성기 문제 id는 gen-{name}-{seed}", () => {
    const gen = { ...base, generator: { name: "replacement", params: {}, seed: 48213 } };
    expect(validateBase({ ...gen, id: "os-ch08-gen-replacement-48213" })).toEqual([]);
    expect(validateBase({ ...gen, id: "os-ch08-gen-replacement-1" })).not.toEqual([]);
  });
  it("빈 해설·slideRef는 오류", () => {
    expect(validateBase({ ...base, explanation: " " })).toContainEqual(
      expect.stringContaining("explanation"),
    );
    expect(validateBase({ ...base, slideRef: "" })).toContainEqual(
      expect.stringContaining("slideRef"),
    );
  });
});

describe("mcq", () => {
  const q = fixture("mcq") as McqQ;
  it("정답/오답", () => {
    expect(mcqCore.grade(q, 2)).toEqual({ correct: true, score: 1, detail: null });
    expect(mcqCore.grade(q, 0).correct).toBe(false);
    expect(mcqCore.grade(q, null).score).toBe(0);
  });
  it("숫자키 i는 화면의 i번째 보기(choiceOrder) — 범위 밖은 무시", () => {
    expect(mcqCore.applyChoice!(q, null, 3)).toBe(choiceOrder(q)[3]);
    expect(mcqCore.applyChoice!(q, 1, 4)).toBe(1);
  });
  it("choiceOrder: 원래 보기 번호의 순열, 같은 문제는 항상 같은 순서", () => {
    expect([...choiceOrder(q)].sort()).toEqual([0, 1, 2, 3]);
    expect(choiceOrder(q)).toEqual(choiceOrder({ ...q }));
  });
  it("validate: 보기 수·범위·중복", () => {
    expect(mcqCore.validate({ ...q, choices: ["a", "b", "c"] })).not.toEqual([]);
    expect(mcqCore.validate({ ...q, answerIndex: 4 })).not.toEqual([]);
    expect(mcqCore.validate({ ...q, choices: ["a", "a", "b", "c"] })).not.toEqual([]);
  });
});

describe("multi", () => {
  const q = fixture("multi") as MultiQ; // 정답 [0,1,2], 보기 5개
  it("부분 점수 = max(0, (맞게 고른 수 − 잘못 고른 수) / 정답 수)", () => {
    expect(multiCore.grade(q, [0, 1, 2])).toMatchObject({ correct: true, score: 1 });
    expect(multiCore.grade(q, [0, 1]).score).toBeCloseTo(2 / 3);
    expect(multiCore.grade(q, [0, 1, 2, 3]).score).toBeCloseTo(2 / 3);
    expect(multiCore.grade(q, [0, 1, 2, 3]).correct).toBe(false);
    expect(multiCore.grade(q, [0, 1, 2, 3, 4]).score).toBeCloseTo(1 / 3); // 전부 고르기
    expect(multiCore.grade(q, [3, 4]).score).toBe(0);
  });
  it("multiScore는 0 아래로 내려가지 않는다", () => {
    expect(multiScore([0], [1, 2, 3])).toBe(0);
  });
  it("숫자키는 화면의 i번째 보기(choiceOrder)를 토글, 답은 원래 번호로 정렬", () => {
    const o = choiceOrder(q)[0];
    const other = o === 2 ? 3 : 2;
    expect(multiCore.applyChoice!(q, [other], 0)).toEqual([o, other].sort((x, y) => x - y));
    expect(multiCore.applyChoice!(q, [o, other].sort((x, y) => x - y), 0)).toEqual([other]);
  });
  it("validate: 정답 없음·범위 밖", () => {
    expect(multiCore.validate({ ...q, answerIndexes: [] })).not.toEqual([]);
    expect(multiCore.validate({ ...q, answerIndexes: [0, 9] })).not.toEqual([]);
  });
});

describe("ox", () => {
  const q = fixture("ox") as OxQ; // answer false
  it("정답/오답", () => {
    expect(oxCore.grade(q, false).correct).toBe(true);
    expect(oxCore.grade(q, true).correct).toBe(false);
  });
  it("숫자키 1 = O, 2 = X", () => {
    expect(oxCore.applyChoice!(q, null, 0)).toBe(true);
    expect(oxCore.applyChoice!(q, null, 1)).toBe(false);
  });
  it("거짓 진술은 틀린 이유 필수", () => {
    expect(oxCore.validate({ ...q, falseReason: undefined })).not.toEqual([]);
    expect(oxCore.validate({ ...q, answer: true, falseReason: undefined })).toEqual([]);
  });
});

describe("blank", () => {
  const q = fixture("blank") as BlankQ;
  it("공백·대소문자·한/영 변형 허용, 칸별 부분 점수", () => {
    expect(blankCore.grade(q, ["Thrashing", "지역성의원리"])).toMatchObject({
      correct: true,
      detail: [true, true],
    });
    expect(blankCore.grade(q, [" 스래싱 ", "LOCALITY"]).correct).toBe(true);
    expect(blankCore.grade(q, ["스래싱", "단편화"])).toMatchObject({
      score: 0.5,
      detail: [true, false],
    });
  });
  it("모든 칸을 채워야 완성", () => {
    expect(blankCore.isComplete(q, ["스래싱", " "])).toBe(false);
  });
  it("validate: {{n}}과 blanks 수 불일치, 은행에 정답 없음", () => {
    expect(blankCore.validate({ ...q, text: "{{0}}만 있음" })).not.toEqual([]);
    expect(blankCore.validate({ ...q, bank: ["스래싱", "단편화"] })).toContainEqual(
      expect.stringContaining("단어 은행"),
    );
    expect(blankCore.validate({ ...q, bank: ["스래싱", "지역성", "단편화"] })).toEqual([]);
  });
});

describe("order", () => {
  const q = fixture("order") as OrderQ;
  it("처음 배치는 섞여 있고 완성 상태(그대로 제출 가능)", () => {
    const a = orderCore.emptyAnswer(q);
    expect(orderCore.isComplete(q, a)).toBe(true);
    expect(orderCore.grade(q, a).correct).toBe(false);
  });
  it("완전 일치 / 부분 점수 / 위치별 정오", () => {
    expect(orderCore.grade(q, [0, 1, 2, 3])).toMatchObject({ correct: true, score: 1 });
    expect(orderCore.grade(q, [1, 0, 2, 3])).toMatchObject({
      score: 5 / 6,
      detail: [false, false, true, true],
    });
    expect(orderCore.grade(q, [0, 1, 1, 3]).score).toBe(0);
  });
  it("validate: 항목 3개 미만·중복", () => {
    expect(orderCore.validate({ ...q, items: ["a", "b"] })).not.toEqual([]);
    expect(orderCore.validate({ ...q, items: ["a", "b", "a"] })).not.toEqual([]);
  });
});

describe("match", () => {
  const q = fixture("match") as MatchQ;
  const rights = q.pairs.map((p) => p.right);
  it("쌍별 채점", () => {
    expect(matchCore.grade(q, rights).correct).toBe(true);
    const swapped = [rights[1], rights[0], rights[2], rights[3]];
    expect(matchCore.grade(q, swapped)).toMatchObject({
      score: 0.5,
      detail: [false, false, true, true],
    });
  });
  it("선택지는 정답+오답을 고정 셔플", () => {
    const withD = { ...q, distractors: ["관련 없는 설명"] };
    expect(matchOptions(withD)).toEqual(matchOptions(withD));
    expect([...matchOptions(withD)].sort()).toEqual([...rights, "관련 없는 설명"].sort());
  });
  it("validate: 오른쪽 중복·distractor 충돌", () => {
    expect(
      matchCore.validate({ ...q, pairs: [q.pairs[0], { left: "x", right: q.pairs[0].right }] }),
    ).not.toEqual([]);
    expect(matchCore.validate({ ...q, distractors: [rights[0]] })).not.toEqual([]);
  });
});

describe("classify", () => {
  const q = fixture("classify") as ClassifyQ;
  it("항목별 채점", () => {
    const right = q.items.map((it) => it.bucket);
    expect(classifyCore.grade(q, right).correct).toBe(true);
    expect(classifyCore.grade(q, [right[0], right[0], right[2], right[3]])).toMatchObject({
      score: 0.75,
      detail: [true, false, true, true],
    });
    expect(classifyCore.isComplete(q, [right[0], null, right[2], right[3]])).toBe(false);
  });
  it("validate: 없는 bucket", () => {
    expect(
      classifyCore.validate({
        ...q,
        items: [...q.items, { label: "새 항목", bucket: "Ready→Exit" }],
      }),
    ).not.toEqual([]);
  });
});

describe("calc", () => {
  const q = fixture("calc") as CalcQ; // 1.1 ± 0.005
  it("허용 오차 경계", () => {
    expect(calcCore.grade(q, "1.1").correct).toBe(true);
    expect(calcCore.grade(q, "1.105").correct).toBe(true);
    expect(calcCore.grade(q, "1.0949").correct).toBe(false);
    expect(calcCore.grade(q, "1.106").correct).toBe(false);
  });
  it("tolerance 0이면 정확히 일치(부동소수 오차는 허용)", () => {
    const exact = { ...q, answer: 0.3, tolerance: 0 };
    expect(calcCore.grade(exact, String(0.1 + 0.2)).correct).toBe(true);
    expect(calcCore.grade(exact, "0.31").correct).toBe(false);
  });
  it("parseNumber: 쉼표·공백 허용, 그 외 형식은 null", () => {
    expect(parseNumber(" 34,881 ")).toBe(34881);
    expect(parseNumber("-0.5")).toBe(-0.5);
    expect(parseNumber(".5")).toBe(0.5);
    expect(parseNumber("1.2.3")).toBeNull();
    expect(parseNumber("12a")).toBeNull();
    expect(parseNumber("")).toBeNull();
    expect(calcCore.isComplete(q, "abc")).toBe(false);
  });
  it("validate: 음수 허용 오차", () => {
    expect(calcCore.validate({ ...q, tolerance: -1 })).not.toEqual([]);
  });
});

describe("trace", () => {
  const q = fixture("trace") as TraceQ;
  const blanks = blankCells(q);
  it("빈칸만 칸별 채점, 대소문자·공백 무시", () => {
    expect(blanks.map((b) => b.key)).toEqual([
      cellKey(0, 4),
      cellKey(1, 3),
      cellKey(3, 2),
      cellKey(3, 4),
    ]);
    const all = Object.fromEntries(blanks.map((b) => [b.key, ` ${b.cell.value} `]));
    expect(traceCore.grade(q, all).correct).toBe(true);
    const half = { ...all, [cellKey(0, 4)]: "2", [cellKey(3, 2)]: "F" };
    expect(traceCore.grade(q, half)).toMatchObject({ score: 0.5 });
    expect(traceCore.grade(q, half).detail[cellKey(1, 3)]).toBe(true);
  });
  it("빈칸을 다 채워야 완성", () => {
    expect(traceCore.isComplete(q, { [cellKey(0, 4)]: "5" })).toBe(false);
  });
  it("validate: 열 수 불일치·options에 정답 없음·빈칸 없음", () => {
    const bad = { ...q, rows: [{ label: "x", cells: [{ value: "1", blank: true }] }] };
    expect(traceCore.validate(bad)).toContainEqual(expect.stringContaining("열 수"));
    const noOpt = {
      ...q,
      rows: [
        { label: "x", cells: q.columns.map(() => ({ value: "F", blank: true, options: ["-"] })) },
      ],
    };
    expect(traceCore.validate(noOpt)).toContainEqual(expect.stringContaining("options"));
    const none = { ...q, rows: [{ label: "x", cells: q.columns.map(() => ({ value: "1" })) }] };
    expect(traceCore.validate(none)).toContainEqual(expect.stringContaining("빈칸"));
  });
});

describe("graph", () => {
  const q = fixture("graph") as GraphQ;
  it("선택한 키 비교, 숫자키는 보기 순서", () => {
    expect(graphCore.grade(q, "b").correct).toBe(true);
    expect(graphCore.grade(q, "a").correct).toBe(false);
    expect(graphCore.applyChoice!(q, null, 1)).toBe("b");
    expect(graphCore.applyChoice!(q, "a", 7)).toBe("a");
  });
  it("validate: answerKey 없음·좌표 범위", () => {
    expect(graphCore.validate({ ...q, answerKey: "z" })).not.toEqual([]);
    const off = {
      ...q,
      options: [
        {
          key: "a",
          label: "a",
          figure: {
            kind: "curve" as const,
            points: [
              [0, 0],
              [1.2, 1],
            ] as [number, number][],
          },
        },
        q.options[1],
      ],
    };
    expect(graphCore.validate(off)).not.toEqual([]);
  });
});

describe("정답/오답 판정: 완전히 맞았을 때만 정답 (부분 점수는 보조 정보)", () => {
  // 부분 점수가 나오는 유형마다 [일부만 맞은 답, 완전히 맞은 답]
  const cases: [QType, AnyAnswer, AnyAnswer][] = (() => {
    const multi = fixture("multi");
    const match = fixture("match");
    const classify = fixture("classify");
    const trace = fixture("trace");
    const right = (q: TraceQ) =>
      Object.fromEntries(blankCells(q).map((b) => [b.key, b.cell.value]));
    const traceHalf = { ...right(trace), [cellKey(0, 4)]: "2" };
    const matchRights = match.pairs.map((p) => p.right);
    const buckets = classify.items.map((it) => it.bucket);
    return [
      ["multi", [0, 1], [...multi.answerIndexes]],
      ["blank", ["스래싱", "단편화"], ["스래싱", "지역성"]],
      ["order", [1, 0, 2, 3], [0, 1, 2, 3]],
      ["match", [matchRights[1], matchRights[0], ...matchRights.slice(2)], matchRights],
      ["classify", [buckets[1], ...buckets.slice(1)], buckets],
      ["trace", traceHalf, right(trace)],
    ];
  })();

  it.each(cases)(
    "%s: 일부만 맞으면 오답(부분 점수만 0~1 사이), 전부 맞아야 정답",
    (type, partial, full) => {
      const q = fixture(type);
      const p = gradeQuestion(q, partial);
      expect(p.correct).toBe(false);
      expect(p.score).toBeGreaterThan(0);
      expect(p.score).toBeLessThan(1);
      const f = gradeQuestion(q, full);
      expect(f).toMatchObject({ correct: true, score: 1 });
    },
  );

  it("모든 유형·무작위 답안에서 correct는 정확히 score === 1과 같다", () => {
    const rand = mulberry32(20261004);
    const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
    for (let n = 0; n < 300; n++) {
      for (const q of QTYPE_FIXTURES) {
        let a: AnyAnswer;
        switch (q.type) {
          case "mcq":
            a = Math.floor(rand() * q.choices.length);
            break;
          case "multi":
            a = q.choices.map((_, i) => i).filter(() => rand() < 0.5);
            break;
          case "ox":
            a = rand() < 0.5;
            break;
          case "blank":
            a = q.blanks.map((b) => (rand() < 0.6 ? b.accept[0] : "x"));
            break;
          case "order":
            a = shuffledIndexes(q.items.length, `r${n}`);
            break;
          case "match":
            a = q.pairs.map(() => pick(q.pairs).right);
            break;
          case "classify":
            a = q.items.map(() => pick(q.buckets));
            break;
          case "calc":
            a = rand() < 0.5 ? String(q.answer) : "0";
            break;
          case "trace":
            a = Object.fromEntries(
              blankCells(q).map((b) => [b.key, rand() < 0.6 ? b.cell.value : "?"]),
            );
            break;
          case "graph":
            a = pick(q.options).key;
            break;
          case "code-blank":
            a = q.blanks.map((b) => (rand() < 0.6 ? b.accept[0] : "x"));
            break;
        }
        const r = gradeQuestion(q, a);
        expect(r.correct, `${q.type} ${JSON.stringify(a)}`).toBe(r.score === 1);
      }
    }
  });
});
