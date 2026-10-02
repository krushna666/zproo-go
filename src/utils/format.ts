const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function fromISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(s: string, n: number) {
  const d = fromISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}
export function today() {
  return toISODate(new Date());
}
export function daysBetween(a: string, b: string) {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86400000);
}
export function formatDate(s: string, withDay = true) {
  const d = fromISODate(s);
  return `${withDay ? DAYS[d.getDay()] + ', ' : ''}${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export function dayParts(s: string) {
  const d = fromISODate(s);
  return { dow: DAYS[d.getDay()], day: d.getDate(), month: MONTHS[d.getMonth()] };
}
export function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m ? m + 'm' : ''}`.trim() : `${m}m`;
}
export function inr(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
export function nextDayOffset(dep: string, durationMins: number) {
  const [h, m] = dep.split(':').map(Number);
  return Math.floor((h * 60 + m + durationMins) / 1440);
}
export function timeBucket(t: string): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  const h = Number(t.split(':')[0]);
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  return 'Night';
}
