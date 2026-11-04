import { PROBE_KEY } from "./keys";
import { safeRemove, safeSet } from "./safeStorage";

/** 이 브라우저가 기록을 저장할 수 있는가(저장소 차단·용량 초과면 false). 문제 풀이 화면의 나가기 확인에 쓴다 */
export function storageWritable(): boolean {
  const ok = safeSet(PROBE_KEY, "1");
  safeRemove(PROBE_KEY);
  return ok;
}
