import {
  cycleDayNumber,
  phaseForCycleDay,
  tideForCycleDay,
  tideHeightForCycleDay,
} from './cycle'
import { addDays, diffDays, startOfDay, toKey } from './dates'
import {
  Phases,
  type CycleConfig,
  type DaySnapshot,
  type PeriodRecord,
  type Phase,
} from './types'

export type CyclePrediction = {
  config: CycleConfig
  records: PeriodRecord[]
  loggedPeriodDays: Set<string>
  typicalPeriodLength: number
  typicalCycleLength: number
  latestPeriodStart: Date
}

const DEFAULT_CYCLE_LENGTH = 28
const DEFAULT_PERIOD_LENGTH = 5
const OVULATORY_WINDOW = 6
const LUTEAL_DAYS_BEFORE_NEXT_PERIOD = 14

export function buildCyclePrediction(records: PeriodRecord[]): CyclePrediction | null {
  const normalized = records
    .map((record) => ({
      startDate: startOfDay(record.startDate),
      endDate: startOfDay(record.endDate),
    }))
    .filter((record) => record.endDate >= record.startDate)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  if (normalized.length === 0) return null

  const periodLengths = normalized.map((record) =>
    diffDays(record.endDate, record.startDate) + 1,
  )
  const cycleLengths = normalized
    .slice(1)
    .map((record, index) => diffDays(record.startDate, normalized[index].startDate))
    .filter((length) => length >= 18 && length <= 45)

  const typicalPeriodLength = clampRoundedAverage(
    periodLengths,
    DEFAULT_PERIOD_LENGTH,
    3,
    7,
  )
  const typicalCycleLength = clampRoundedAverage(
    cycleLengths,
    DEFAULT_CYCLE_LENGTH,
    21,
    35,
  )
  const latestPeriodStart = normalized[normalized.length - 1].startDate
  const currentCycleStart = latestPeriodStart
  const config = cycleConfigFromHistory(
    currentCycleStart,
    typicalCycleLength,
    typicalPeriodLength,
  )

  return {
    config,
    records: normalized,
    loggedPeriodDays: loggedPeriodKeys(normalized),
    typicalPeriodLength,
    typicalCycleLength,
    latestPeriodStart,
  }
}

export function predictionSnapshotForDate(
  date: Date,
  prediction: CyclePrediction,
): DaySnapshot {
  const cycleDay = cycleDayNumber(date, prediction.config)
  const phase = phaseForCycleDay(cycleDay, prediction.config)
  const key = toKey(date)
  return {
    date: startOfDay(date),
    cycleDay,
    phase,
    tide: tideForCycleDay(cycleDay, prediction.config),
    tideHeight: tideHeightForCycleDay(cycleDay, prediction.config),
    source:
      prediction.loggedPeriodDays.has(key) || phase === Phases.menstrual
        ? prediction.loggedPeriodDays.has(key)
          ? 'logged'
          : 'predicted'
        : undefined,
  }
}

export function phaseRangeForCycle(
  cycleStart: Date,
  prediction: CyclePrediction,
  phase: Phase,
) {
  const { phaseWindows } = prediction.config
  const startDayByPhase: Record<Phase, number> = {
    menstrual: 1,
    follicular: phaseWindows.menstrual + 1,
    ovulatory: phaseWindows.menstrual + phaseWindows.follicular + 1,
    luteal:
      phaseWindows.menstrual + phaseWindows.follicular + phaseWindows.ovulatory + 1,
  }
  const length = phaseWindows[phase]
  return {
    start: addDays(cycleStart, startDayByPhase[phase] - 1),
    end: addDays(cycleStart, startDayByPhase[phase] + length - 2),
  }
}

function cycleConfigFromHistory(
  currentCycleStart: Date,
  cycleLength: number,
  periodLength: number,
): CycleConfig {
  const ovulationDay = Math.max(
    periodLength + 2,
    cycleLength - LUTEAL_DAYS_BEFORE_NEXT_PERIOD,
  )
  const ovulatoryStart = Math.max(periodLength + 1, ovulationDay - OVULATORY_WINDOW + 1)
  const luteal = Math.max(1, cycleLength - ovulatoryStart - OVULATORY_WINDOW + 1)
  const follicular = Math.max(
    1,
    cycleLength - periodLength - OVULATORY_WINDOW - luteal,
  )

  return {
    cycleLength,
    currentCycleStart,
    lastLowTide: currentCycleStart,
    phaseWindows: {
      menstrual: periodLength,
      follicular,
      ovulatory: OVULATORY_WINDOW,
      luteal,
    },
  }
}

function loggedPeriodKeys(records: PeriodRecord[]) {
  const keys = new Set<string>()
  records.forEach((record) => {
    const length = diffDays(record.endDate, record.startDate)
    for (let day = 0; day <= length; day += 1) {
      keys.add(toKey(addDays(record.startDate, day)))
    }
  })
  return keys
}

function clampRoundedAverage(
  values: number[],
  fallback: number,
  min: number,
  max: number,
) {
  if (values.length === 0) return fallback
  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  return Math.min(max, Math.max(min, Math.round(average)))
}
