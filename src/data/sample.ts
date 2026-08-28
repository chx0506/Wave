import type { CycleConfig } from '@/domain/types'

/** Mock cycle aligned with home dial (today = day 8, 卵泡期). */
export const TODAY = new Date(2026, 7, 26)

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

/** Demo streak for home metric card. */
export const SAMPLE_STREAK_DAYS = 12
