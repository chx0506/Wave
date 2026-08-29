import type { DailyLog, DayLogsMap } from '@/domain/types'

const STORAGE_KEY = 'wave-day-logs-v1'

export function loadDayLogs(): DayLogsMap {
  if (typeof window === 'undefined') return {}

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as DayLogsMap
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

export function saveDayLogs(logs: DayLogsMap) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  } catch {
    /* ignore quota / private mode */
  }
}

export function upsertDayLog(logs: DayLogsMap, log: DailyLog): DayLogsMap {
  return { ...logs, [log.dateKey]: log }
}
