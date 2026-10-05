import { describe, expect, it } from "vitest";
import { keyLine } from "./QuestionRenderer";

describe("keyLine — 핵심 한 줄 요약(summary가 없을 때)", () => {
  it("앞의 출처 표기를 떼고 첫 문장만", () => {
    expect(keyLine("p.21: 응답시간은 요청 후 첫 출력까지의 시간이다. 그다음 문장.")).toBe("응답시간은 요청 후 첫 출력까지의 시간이다.");
    expect(keyLine("교수님 필기 기준(p.24): 과거는 CPU 이용률이 더 중요했다. 다음.")).toBe("과거는 CPU 이용률이 더 중요했다.");
  });
  it("문장 안의 p.15 같은 표기에서 끊지 않는다", () => {
    expect(keyLine("스케줄링 대상에서 빠진다(p.15). 끝.")).toBe("스케줄링 대상에서 빠진다(p.15).");
  });
  it("데이터 통신 출처 표기 's.N (p.P):'와 짧은 그림 라벨을 뗀다", () => {
    expect(keyLine("s.20 (p.10): An internet is two or more networks. The Internet…")).toBe("An internet is two or more networks.");
    expect(keyLine("s.28 (p.14)·s.29 (p.15): 동일 객체는 Layer 2 = Ciphertext. 다음.")).toBe("동일 객체는 Layer 2 = Ciphertext.");
    expect(keyLine("s.5 (p.3) 그림 a. Simplex: Mainframe → Monitor로 방향이 하나뿐이다. 다음.")).toBe("Mainframe → Monitor로 방향이 하나뿐이다.");
    expect(keyLine("s.9~12 (p.5~6): 메시 = 모두 직접 연결. 다음.")).toBe("메시 = 모두 직접 연결.");
  });
  it("120자를 넘으면 자른다", () => {
    expect(keyLine("가".repeat(200))).toHaveLength(120);
  });
});
