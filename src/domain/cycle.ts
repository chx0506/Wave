import { diffDays, startOfDay } from './dates'
import { Phases, TideStates, type CycleConfig, type DaySnapshot, type Phase, type TideState } from './types'

export function cycleDayNumber(date: Date, config: CycleConfig): number {
  const offset = diffDays(date, config.currentCycleStart)
  const wrapped = ((offset % config.cycleLength) + config.cycleLength) % config.cycleLength
  return wrapped + 1
}

export function phaseForCycleDay(cycleDay: number, config: CycleConfig): Phase {
  const { menstrual, follicular, ovulatory } = config.phaseWindows
  if (cycleDay <= menstrual) return Phases.menstrual
  if (cycleDay <= menstrual + follicular) return Phases.follicular
  if (cycleDay <= menstrual + follicular + ovulatory) return Phases.ovulatory
  return Phases.luteal
}

/**
 * Beach coverage, 0-1. 1 = water covers the most sand.
 *
 * Day before period (cycleLength): peak.
 * Period days 1-N: tide recedes.
 * After period: tide climbs again toward the next peak.
 */
export function tideHeightForCycleDay(cycleDay: number, config: CycleConfig): number {
  const period = config.phaseWindows.menstrual
  const length = config.cycleLength
  const floor = 0.12
  const peak = 1

  if (cycleDay <= period) {
    const span = Math.max(period - 1, 1)
    return lerp(peak * 0.92, floor, (cycleDay - 1) / span)
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

function lerp(from: number, to: number, t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return from + (to - from) * clamped
}
