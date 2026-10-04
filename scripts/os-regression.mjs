// OS 회귀 점검: 실행 중인 앱(기본 http://localhost:3123)에 HTTP로 접속해
// 기존 OS 동작이 유지되는지 확인한다. 라우트 구조와 무관하게 "사용자가 겪는 동작"만 본다.
//   사용법: npm run build && npx next start -p 3123  (다른 터미널)
//           node scripts/os-regression.mjs [baseUrl]
const BASE = process.argv[2] ?? "http://localhost:3123";

const OS_CHAPTERS = [
  { id: "ch02", title: "Ch02. 운영체제 개요" },
  { id: "ch03", title: "Ch03. 프로세스 기술과 제어" },
  { id: "ch07", title: "Ch07. 메모리 관리" },
  { id: "ch08", title: "Ch08. 가상 메모리" },
];

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
}

async function get(path) {
  const res = await fetch(new URL(path, BASE), { redirect: "follow" });
  return { status: res.status, url: new URL(res.url).pathname, html: await res.text() };
}

function internalLinks(html) {
  const out = new Set();
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    if (!m[1].startsWith("/_next")) out.add(m[1]);
  }
  return [...out];
}

// 1. 기존 OS 챕터 URL(/chapter/{id})이 계속 해당 챕터 화면으로 이어진다 (직접 또는 리다이렉트)
for (const ch of OS_CHAPTERS) {
  const r = await get(`/chapter/${ch.id}`);
  check(
    `기존 URL /chapter/${ch.id} → 챕터 화면`,
    r.status === 200 && r.html.includes(ch.title),
    `${r.status} ${r.url}`,
  );
}

// 2. 존재하지 않는 챕터는 404
{
  const r = await get("/chapter/ch99");
  check("없는 챕터 /chapter/ch99 → 404", r.status === 404, `${r.status} ${r.url}`);
}

// 3. 풀이·결과·오답노트 화면 응답
for (const p of ["/quiz", "/result", "/review"]) {
  const r = await get(p);
  check(`${p} → 200`, r.status === 200, `${r.status}`);
}

// 4. 홈에서 링크를 따라가면(최대 2단계) OS 챕터 4개에 모두 도달한다
{
  const seen = new Map();
  let frontier = ["/"];
  for (let depth = 0; depth <= 2 && frontier.length; depth++) {
    const next = [];
    for (const p of frontier) {
      if (seen.has(p)) continue;
      const r = await get(p);
      seen.set(p, r);
      if (depth < 2) next.push(...internalLinks(r.html));
    }
    frontier = next;
  }
  for (const ch of OS_CHAPTERS) {
    const hit = [...seen.entries()].find(
      ([, r]) =>
        r.status === 200 && r.url.endsWith(`/chapter/${ch.id}`) && r.html.includes(ch.title),
    );
    check(`홈에서 링크로 ${ch.title} 도달`, Boolean(hit), hit ? hit[1].url : "도달 실패");
  }
}

// 5. 테마: FOUC 방지 스크립트가 같은 localStorage 키("theme")를 읽는다 → 기존 테마 설정 유지
{
  const r = await get("/");
  const ok = r.html.includes('var key = "theme"') && r.html.includes('classList.toggle("dark"');
  check('테마 FOUC 스크립트 (키 "theme")', ok);
  const external = [...r.html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  check("외부 CDN 참조 없음", external.length === 0, external.join(", "));
}

const passed = results.filter((r) => r.ok).length;
for (const r of results)
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
console.log(`\n${passed} passed, ${results.length - passed} failed, ${results.length} total`);
process.exitCode = passed === results.length ? 0 : 1;
