import type { CodeLang } from "./_shared/codeTokens";
import { DS_CODE_BLANK_PYTHON } from "./fixtures";
import type { Question } from "./registry";

/**
 * /playground 데이터과학 미리보기(Sprint 12 확인용 — 챕터 문제가 아니다. 문제는 Sprint 15·16).
 * 코드는 모두 source/data-science/의 PDF 코드를 그대로 옮겼다(들여쓰기·주석 포함). 출처는 `ref`·`slideRef`.
 */

/** 코드 블록만 보여 주는 예시 */
export const DS_CODE_BLOCK_SAMPLES: { title: string; ref: string; language: CodeLang; lineNumbers: boolean; source: string }[] = [
  {
    title: "지역변수와 전역변수",
    ref: "Lec2.pdf p.46 (번호 없는 추가 슬라이드, 줄 번호 1~14)",
    language: "python",
    lineNumbers: true,
    source: [
      "## 함수 정의 부분",
      "def func1() :",
      "    a = 10    # 지역변수",
      '    print("func1()에서 a의 값 %d" % a)',
      "",
      "def func2() :",
      '    print("func2()에서 a의 값 %d" % a)',
      "",
      "## 변수 선언 부분",
      "a = 20    # 전역변수",
      "",
      "## 메인 코드 부분",
      "func1()",
      "func2()",
    ].join("\n"),
  },
  {
    title: "[코드 5-4] 수강 테이블 생성",
    ref: "Lec5.pdf s.45",
    language: "sql",
    lineNumbers: false,
    source: [
      "CREATE TABLE 수강",
      "(학번 CHAR(2) NOT NULL,",
      "과목번호 CHAR(2) NOT NULL,",
      "학점 CHAR(1) NULL,",
      "PRIMARY KEY(학번, 과목번호),",
      "FOREIGN KEY(학번) REFERENCES 학생(학번),",
      "FOREIGN KEY(과목번호) REFERENCES 과목(과목번호));",
    ].join("\n"),
  },
];

/** 지문 아래 코드(code 필드) + 해설 안 펜스 코드 블록을 함께 보이는 객관식 */
const DS_MCQ_WITH_CODE: Question = {
  id: "data-science-lec2-demo-mcq-001",
  subject: "data-science",
  chapter: "lec2",
  topic: "지역변수·전역변수·global",
  type: "mcq",
  exam: false,
  difficulty: 2,
  slideRef: "Lec2 p.48",
  prompt: "다음 코드의 **실행 결과**는?",
  code: {
    language: "python",
    lineNumbers: true,
    source: [
      "num = 10                    # 전역변수 num 선언",
      "",
      "def fun1():",
      "    num = 20                # 지역변수 num 선언",
      "    print('num : ', num)    # 지역변수 num 사용(함수 안에서 num을 먼저 찾는다.)",
      "",
      "print('num : ', num)        # 전역변수 num 사용",
      "fun1()",
    ].join("\n"),
  },
  choices: ["num :  10 → num :  20", "num :  10 → num :  10", "num :  20 → num :  20", "num :  20 → num :  10"],
  answerIndex: 0,
  explanation: [
    "p.48: 4행의 num은 fun1() 안에서 새로 선언한 **지역변수**라 1행의 전역변수 num과 이름만 같을 뿐 다른 변수다. 7행은 전역 num(10), 8행 fun1()은 지역 num(20)을 출력한다.",
    "함수 안에서 전역변수를 바꾸려면 p.49처럼 `global`을 쓴다:",
    "```python",
    "def fun1():",
    "    global num              # 전역변수 num 설정",
    "    num = 20                # 전역변수 num 변경",
    "```",
  ].join("\n"),
  summary: "함수 안에서 대입한 이름은 지역변수 — 전역을 바꾸려면 global",
};

/** SQL 코드 빈칸 — Lec5.pdf s.55 [코드 5-12] 그대로 */
const DS_CODE_BLANK_SQL: Question = {
  id: "data-science-lec5-demo-code-blank-001",
  subject: "data-science",
  chapter: "lec5",
  topic: "AS·COUNT·GROUP BY",
  type: "code-blank",
  exam: false,
  difficulty: 1,
  slideRef: "Lec5 s.55",
  prompt: "수강 테이블에서 **학번별 수강 과목의 개수**를 세는 SQL이다. 빈칸을 채우시오.",
  language: "sql",
  source: 'SELECT 학번, {{0}}(*) AS "수강 과목의 개수" FROM 수강 {{1}} 학번;',
  blanks: [{ accept: ["COUNT"] }, { accept: ["GROUP BY"] }],
  explanation:
    "s.55 [코드 5-12]: 학번별로 **GROUP BY**로 묶고 **COUNT()** 함수로 개수를 센다. AS는 결과 열에 별칭을 붙인다. SQL 키워드·함수 이름은 대소문자를 구별하지 않으므로 `count`, `group by`로 써도 정답이다.",
  summary: "SELECT 열, COUNT(*) FROM 테이블 GROUP BY 열",
};

export function dsPlaygroundQuestions(): Question[] {
  return [DS_MCQ_WITH_CODE, DS_CODE_BLANK_PYTHON, DS_CODE_BLANK_SQL];
}
