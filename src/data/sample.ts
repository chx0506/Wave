import type { CycleConfig } from '@/domain/types'

/** Mock cycle aligned with the two design comps (today = 2026-08-26, day 12). */
export const TODAY = new Date(2026, 7, 26)

export const SAMPLE_CYCLE: CycleConfig = {
  cycleLength: 28,
  currentCycleStart: new Date(2026, 7, 15),
  lastLowTide: new Date(2026, 7, 12),
  phaseWindows: {
    menstrual: 5,
    follicular: 8,
    ovulatory: 3,
    luteal: 12,
  },
}
