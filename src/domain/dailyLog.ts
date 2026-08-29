import { addDays, startOfDay, toKey } from '@/domain/dates'
import type { DailyLog, DayLogsMap } from '@/domain/types'
import {
  DISCHARGE_OPTIONS,
  EXERCISE_OPTIONS,
  INTIMACY_OPTIONS,
  SYMPTOM_OPTIONS,
} from '@/data/recordStatusArt'

const FLOW_LABEL: Record<string, string> = {
  none: '干涸',
  light: '偏少',
  medium: '偏多',
  heavy: '充盈',
}

const MOOD_LABEL: Record<string, string> = {
  calm: '平静',
  low: '低落',
  irritable: '烦躁',
  happy: '愉悦',
  sensitive: '敏感',
}

function labelMap(options: readonly { id: string; label: string }[]) {
  return Object.fromEntries(options.map((item) => [item.id, item.label]))
}

const SYMPTOM_LABEL = labelMap(SYMPTOM_OPTIONS)
const DISCHARGE_LABEL = labelMap(DISCHARGE_OPTIONS)
const EXERCISE_LABEL = labelMap(EXERCISE_OPTIONS)
const INTIMACY_LABEL = labelMap(INTIMACY_OPTIONS)

/** 连续记录天数：若今天尚未记录，从昨天往前数。 */
export function computeLogStreak(logs: DayLogsMap, today: Date): number {
  let cursor = startOfDay(today)
  if (!logs[toKey(cursor)]) {
    cursor = addDays(cursor, -1)
  }

  let streak = 0
  while (logs[toKey(cursor)]) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function hasDailyLog(logs: DayLogsMap, date: Date): boolean {
  return Boolean(logs[toKey(date)])
}

export function recentDailyLogs(logs: DayLogsMap, limit = 6): DailyLog[] {
  return Object.values(logs)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, limit)
}

export function summarizeDailyLog(log: DailyLog): string {
  const parts: string[] = []
  if (log.flow) parts.push(FLOW_LABEL[log.flow] ?? log.flow)
  if (log.mood) parts.push(MOOD_LABEL[log.mood] ?? log.mood)

  const firstSymptom = log.symptoms[0]
  if (firstSymptom) {
    parts.push(SYMPTOM_LABEL[firstSymptom] ?? firstSymptom)
  }

  const firstExercise = log.exercise[0]
  if (firstExercise) {
    parts.push(EXERCISE_LABEL[firstExercise] ?? firstExercise)
  }

  if (log.discharge[0]) {
    parts.push(DISCHARGE_LABEL[log.discharge[0]] ?? log.discharge[0])
  }

  if (log.intimacy[0]) {
    parts.push(INTIMACY_LABEL[log.intimacy[0]] ?? log.intimacy[0])
  }

  if (parts.length === 0 && log.note) return log.note.slice(0, 18)
  return parts.slice(0, 3).join(' · ') || '已记录'
}

export function chipLabel(kind: 'symptom' | 'discharge' | 'exercise' | 'intimacy', id: string) {
  if (kind === 'symptom') return SYMPTOM_LABEL[id] ?? id
  if (kind === 'discharge') return DISCHARGE_LABEL[id] ?? id
  if (kind === 'exercise') return EXERCISE_LABEL[id] ?? id
  return INTIMACY_LABEL[id] ?? id
}

export function flowLabel(id: string) {
  return FLOW_LABEL[id] ?? id
}

export function moodLabel(id: string) {
  return MOOD_LABEL[id] ?? id
}

/** 从真实日记录汇总症状频次；无数据时返回空数组。 */
export function symptomFrequencyFromLogs(logs: DayLogsMap, limit = 5) {
  const counts = new Map<string, number>()
  for (const log of Object.values(logs)) {
    for (const id of log.symptoms) {
      const label = SYMPTOM_LABEL[id] ?? id
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
