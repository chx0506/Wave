import { SAMPLE_CYCLE } from '@/data/sample'
import type { CycleConfig } from '@/domain/types'

const STORAGE_KEY = 'wave-cycle-v1'

type StoredCycleData = {
  cycleConfig: {
    cycleLength: number
    currentCycleStart: string
    lastLowTide: string
    phaseWindows: CycleConfig['phaseWindows']
  }
  periodStarts: string[]
  importedFrom?: string
}

export type CycleStorageData = {
  cycleConfig: CycleConfig
  periodStarts: Date[]
  importedFrom?: string
}

function cloneSampleCycle(): CycleConfig {
  return {
    ...SAMPLE_CYCLE,
    currentCycleStart: new Date(SAMPLE_CYCLE.currentCycleStart),
    lastLowTide: new Date(SAMPLE_CYCLE.lastLowTide),
    phaseWindows: { ...SAMPLE_CYCLE.phaseWindows },
  }
}

export function getDefaultCycleConfig(): CycleConfig {
  return cloneSampleCycle()
}

export function loadCycleData(): CycleStorageData | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const stored = JSON.parse(raw) as StoredCycleData
    return {
      cycleConfig: {
        ...stored.cycleConfig,
        currentCycleStart: new Date(stored.cycleConfig.currentCycleStart),
        lastLowTide: new Date(stored.cycleConfig.lastLowTide),
        phaseWindows: { ...stored.cycleConfig.phaseWindows },
      },
      periodStarts: stored.periodStarts.map((value) => new Date(value)),
      importedFrom: stored.importedFrom,
    }
  } catch {
    return null
  }
}

export function saveCycleData(
  cycleConfig: CycleConfig,
  periodStarts: Date[],
  importedFrom?: string,
) {
  if (typeof window === 'undefined') return

  const stored: StoredCycleData = {
    cycleConfig: {
      cycleLength: cycleConfig.cycleLength,
      currentCycleStart: cycleConfig.currentCycleStart.toISOString(),
      lastLowTide: cycleConfig.lastLowTide.toISOString(),
      phaseWindows: cycleConfig.phaseWindows,
    },
    periodStarts: periodStarts.map((date) => date.toISOString()),
    importedFrom,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    /* ignore storage failures */
  }
}
