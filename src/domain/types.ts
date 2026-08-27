export const Tabs = {
  coast: 'coast',
  record: 'record',
  calendar: 'calendar',
  atlas: 'atlas',
} as const

export type TabId = (typeof Tabs)[keyof typeof Tabs]

export const Phases = {
  menstrual: 'menstrual',
  follicular: 'follicular',
  ovulatory: 'ovulatory',
  luteal: 'luteal',
} as const

export type Phase = (typeof Phases)[keyof typeof Phases]

export const TideStates = {
  low: 'low',
  rising: 'rising',
  high: 'high',
  falling: 'falling',
} as const

export type TideState = (typeof TideStates)[keyof typeof TideStates]

export const DayModes = {
  day: 'day',
  night: 'night',
} as const

export type DayMode = (typeof DayModes)[keyof typeof DayModes]

/** Length of each phase, in cycle days. Sum should equal cycleLength. */
export type PhaseWindows = {
  menstrual: number
  follicular: number
  ovulatory: number
  luteal: number
}

export type CycleConfig = {
  cycleLength: number
  /** Day 1 of the current cycle (counts 周期第 N 天). */
  currentCycleStart: Date
  /** Displayed as 上次低潮. Often the previous period start. */
  lastLowTide: Date
  phaseWindows: PhaseWindows
}

export type DaySnapshot = {
  date: Date
  cycleDay: number
  phase: Phase
  tide: TideState
  /** 0–1 water height for calendar cells and illustrations. */
  tideHeight: number
}

export type CalendarCell =
  | { kind: 'empty'; key: string }
  | { kind: 'day'; key: string; date: Date; snapshot: DaySnapshot }
