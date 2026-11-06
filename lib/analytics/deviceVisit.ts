/** 브라우저에 저장하는 기기 번호와 마지막으로 서버에 알린 날짜(UTC) */
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
  if (stored?.id && stored.sentOn === today) return { next: { id, sentOn: today }, send: false };
  return { next: { id, sentOn: today }, send: true };
}
