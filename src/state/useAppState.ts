import type { ImportResult } from '@/domain/importCycle'
import type {
  BodyClue,
  CycleConfig,
  DayMode,
  DaySnapshot,
  Experiment,
  ExperimentCategory,
  PeriodRecord,
  StackScreenId,
  TabId,
} from '@/domain/types'
import { createContext, useContext } from 'react'

export type AppState = {
  tab: TabId
  setTab: (tab: TabId) => void
  stackScreen: StackScreenId | null
  openStackScreen: (screen: StackScreenId) => void
  closeStackScreen: () => void
  mode: DayMode
  setMode: (mode: DayMode) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  viewedYear: number
  viewedMonth: number
  setViewedMonth: (year: number, month: number) => void
  today: Date
  snapshot: DaySnapshot
  snapshotFor: (date: Date) => DaySnapshot
  cycleConfig: CycleConfig
  periodStarts: Date[]
  periodRecords: PeriodRecord[]
  importedFrom?: string
  importCycleData: (result: Extract<ImportResult, { ok: true }>) => void
  experiments: Experiment[]
  clues: BodyClue[]
  createExperiment: (input: {
    category: ExperimentCategory
    question: string
    try: string
    watch: readonly string[]
    totalDays: number
  }) => void
  recordObservation: (
    id: string,
    values: Record<string, string>,
    completedTry: boolean,
    note?: string,
  ) => void
  archiveExperimentClue: (experimentId: string) => void
  confirmClue: (id: string) => void
  openMindfulnessSession: (sessionId: string) => void
  consumePendingMindfulness: () => string | null
}

export const AppContext = createContext<AppState | null>(null)

export function useAppState(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used inside AppProvider')
  return ctx
}
