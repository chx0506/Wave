export function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function diffDays(later: Date, earlier: Date): number {
  const ms = startOfDay(later).getTime() - startOfDay(earlier).getTime()
  return Math.round(ms / 86_400_000)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatYearMonth(year: number, month: number): string {
  return `${year}年${month}月`
}

export function sameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b)
}

export function weekdaySundayFirst(date: Date): number {
  return date.getDay()
}
