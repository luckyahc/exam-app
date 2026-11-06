/** 집계를 새로 시작할 때 올린다: 오늘 이미 알린 브라우저도 새 집계에 한 번 더 알리게 된다(서버 키 접두어와 함께) */
const EPOCH = 2;

/** 브라우저에 저장하는 기기 번호와 마지막으로 서버에 알린 표시(집계 차수:날짜) */
export interface StoredDevice {
  id: string;
  sentOn: string;
}

/** 저장된 값을 보고 이번 방문을 알릴지 정한다: 번호가 없으면 만들고, 하루에 한 번만 보낸다 */
export function deviceVisit(
  stored: Partial<StoredDevice> | null,
  today: string,
  makeId: () => string,
): { next: StoredDevice; send: boolean } {
  const id = stored?.id || makeId();
  const sentOn = `${EPOCH}:${today}`;
  return { next: { id, sentOn }, send: !(stored?.id && stored.sentOn === sentOn) };
}
