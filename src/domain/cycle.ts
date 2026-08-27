import { diffDays, startOfDay } from './dates'
import { Phases, TideStates, type CycleConfig, type DaySnapshot, type TideState } from './types'

export function cycleDayNumber(date: Date, config: CycleConfig): number {
  const offset = diffDays(date, config.currentCycleStart)
  const wrapped = ((offset % config.cycleLength) + config.cycleLength) % config.cycleLength
  return wrapped + 1
}

export function phaseForCycleDay(cycleDay: number, config: CycleConfig) {
  const { menstrual, follicular, ovulatory } = config.phaseWindows
  if (cycleDay <= menstrual) return Phases.menstrual
  if (cycleDay <= menstrual + follicular) return Phases.follicular
  if (cycleDay <= menstrual + follicular + ovulatory) return Phases.ovulatory
  return Phases.luteal
}

/**
 * Beach coverage 0–1 for a cycle day.
 * 1 = water covers the most sand.
 *
 * Loop:
 * - After period → day before next period: tide rises toward peak
 * - Day before period (cycleLength): highest tide
 * - Period days 1…N: tide gradually recedes to low
 */
export function tideHeightForCycleDay(cycleDay: number, config: CycleConfig): number {
  const period = config.phaseWindows.menstrual
  const length = config.cycleLength
  const floor = 0.1
  const peak = 1

  if (cycleDay <= period) {
    const span = Math.max(period - 1, 1)
    return lerp(peak, floor, (cycleDay - 1) / span)
  }

  return lerp(floor, peak, (cycleDay - period) / (length - period))
}

export function tideForCycleDay(cycleDay: number, config: CycleConfig): TideState {
  if (cycleDay <= config.phaseWindows.menstrual) return TideStates.falling
  if (cycleDay >= config.cycleLength) return TideStates.high
  return TideStates.rising
}

export function snapshotForDate(date: Date, config: CycleConfig): DaySnapshot {
  const cycleDay = cycleDayNumber(date, config)
  return {
    date: startOfDay(date),
    cycleDay,
    phase: phaseForCycleDay(cycleDay, config),
    tide: tideForCycleDay(cycleDay, config),
    tideHeight: tideHeightForCycleDay(cycleDay, config),
  }
}

export function snapshotForCycleDay(cycleDay: number, config: CycleConfig): DaySnapshot {
  const day = ((cycleDay - 1) % config.cycleLength) + 1
  return {
    date: startOfDay(config.currentCycleStart),
    cycleDay: day,
    phase: phaseForCycleDay(day, config),
    tide: tideForCycleDay(day, config),
    tideHeight: tideHeightForCycleDay(day, config),
  }
}

/** Days until next period start (退潮 / 月经 Day 1). */
export function daysUntilNextPeriod(cycleDay: number, config: CycleConfig): number {
  return config.cycleLength - cycleDay
}

/** Days until ovulatory window starts. 0 if already in / past window this cycle. */
export function daysUntilOvulation(cycleDay: number, config: CycleConfig): number {
  const start =
    config.phaseWindows.menstrual + config.phaseWindows.follicular + 1
  return Math.max(0, start - cycleDay)
}

function lerp(from: number, to: number, t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return from + (to - from) * clamped
}
