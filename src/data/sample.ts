import type { CycleConfig, PeriodRecord } from '@/domain/types'

const now = new Date()

export const TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate())

export const SAMPLE_CYCLE: CycleConfig = {
  cycleLength: 28,
  currentCycleStart: new Date(2026, 7, 19),
  lastLowTide: new Date(2026, 7, 19),
  phaseWindows: {
    menstrual: 5,
    follicular: 8,
    ovulatory: 3,
    luteal: 12,
  },
}

export const SAMPLE_PERIOD_RECORDS: PeriodRecord[] = [
  { startDate: new Date(2026, 4, 26), endDate: new Date(2026, 4, 30) },
  { startDate: new Date(2026, 5, 23), endDate: new Date(2026, 5, 27) },
  { startDate: new Date(2026, 6, 21), endDate: new Date(2026, 6, 25) },
  { startDate: new Date(2026, 7, 19), endDate: new Date(2026, 7, 23) },
]

/** Demo streak for home metric card. */
export const SAMPLE_STREAK_DAYS = 12
