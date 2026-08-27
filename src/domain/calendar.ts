import { snapshotForDate } from './cycle'
import { daysInMonth, toKey, weekdaySundayFirst } from './dates'
import type { CalendarCell, CycleConfig } from './types'

export function monthCells(
  year: number,
  month: number,
  config: CycleConfig,
): CalendarCell[] {
  const first = new Date(year, month - 1, 1)
  const leading = weekdaySundayFirst(first)
  const count = daysInMonth(year, month)
  const cells: CalendarCell[] = []

  for (let i = 0; i < leading; i += 1) {
    cells.push({ kind: 'empty', key: `pad-${year}-${month}-${i}` })
  }

  for (let day = 1; day <= count; day += 1) {
    const date = new Date(year, month - 1, day)
    cells.push({
      kind: 'day',
      key: toKey(date),
      date,
      snapshot: snapshotForDate(date, config),
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      kind: 'empty',
      key: `trail-${year}-${month}-${cells.length}`,
    })
  }

  return cells
}

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const
