export function fmtElapsed(seconds: number): string {
  const v = Math.max(0, seconds);
  return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(Math.floor(v % 60)).padStart(2, '0');
}

export function fmtClock(d: Date): string {
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
