import { TODAY } from '@/data/sample'
import { OBSERVE_ACTIVE, OBSERVE_CLUES } from '@/data/content'
import { snapshotForDate } from '@/domain/cycle'
import type { ImportResult } from '@/domain/importCycle'
import {
  buildExperimentClue,
  getExperimentProgress,
  normalizeExperiment,
} from '@/domain/experiment'
import {
  DayModes,
  StackScreens,
  Tabs,
  type BodyClue,
  type CycleConfig,
  type DayMode,
  type Experiment,
  type ExperimentCategory,
  type PeriodRecord,
  type StackScreenId,
  type TabId,
} from '@/domain/types'
import {
  buildCyclePrediction,
  predictionSnapshotForDate,
} from '@/domain/periodPrediction'
import {
  getDefaultCycleConfig,
  loadCycleData,
  saveCycleData,
} from '@/lib/cycleStorage'
import { hasImportIntent } from '@/lib/importLink'
import { AppContext } from '@/state/useAppState'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
  const storedCycle = loadCycleData()
  const [tab, setTabState] = useState<TabId>(Tabs.home)
  const [stackScreen, setStackScreen] = useState<StackScreenId | null>(null)
  const [pendingMindfulnessId, setPendingMindfulnessId] = useState<string | null>(
    null,
  )
  const [mode, setMode] = useState<DayMode>(DayModes.day)
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY)
  const [viewedYear, setViewedYear] = useState(TODAY.getFullYear())
  const [viewedMonthNum, setViewedMonthNum] = useState(TODAY.getMonth() + 1)
  const [cycleConfig, setCycleConfig] = useState<CycleConfig>(
    storedCycle?.cycleConfig ?? getDefaultCycleConfig(),
  )
  const [periodStarts, setPeriodStarts] = useState<Date[]>(
    storedCycle?.periodStarts ?? [],
  )
  const [periodRecords, setPeriodRecords] = useState<PeriodRecord[]>(
    storedCycle?.periodRecords ?? [],
  )
  const [importedFrom, setImportedFrom] = useState<string | undefined>(
    storedCycle?.importedFrom,
  )

  const setTab = useCallback((next: TabId) => {
    setStackScreen(null)
    setTabState(next)
  }, [])

  const openStackScreen = useCallback((screen: StackScreenId) => {
    setStackScreen(screen)
  }, [])

  const closeStackScreen = useCallback(() => {
    setStackScreen(null)
  }, [])

  useEffect(() => {
    if (hasImportIntent()) openStackScreen(StackScreens.me)
  }, [openStackScreen])
  const [experiments, setExperiments] = useState<Experiment[]>([
    normalizeExperiment({
      id: 'exp-sleep',
      category: 'sleep',
      question: OBSERVE_ACTIVE.question,
      try: OBSERVE_ACTIVE.try,
      watch: OBSERVE_ACTIVE.watch,
      totalDays: OBSERVE_ACTIVE.total,
      status: 'active',
      startedAt: new Date(2026, 7, 22),
      observations: OBSERVE_ACTIVE.observations.map((observation) => ({
        day: observation.day,
        date: new Date(2026, 7, 21 + observation.day),
        values: {
          睡眠: observation.sleep,
          压力: observation.stress,
          精力: observation.energy,
        },
        completedTry: observation.completedTry,
      })),
    }),
  ])
  const [clues, setClues] = useState<BodyClue[]>(
    OBSERVE_CLUES.map((clue, index) => ({
      ...clue,
      id: `clue-${index}`,
      category: index === 0 ? 'sleep' : index === 1 ? 'energy' : 'pain',
      status: clue.status as BodyClue['status'],
    })),
  )

  const setViewedMonth = useCallback((year: number, month: number) => {
    setViewedYear(year)
    setViewedMonthNum(month)
  }, [])

  const cyclePrediction = useMemo(
    () => buildCyclePrediction(periodRecords),
    [periodRecords],
  )

  const snapshotFor = useCallback(
    (date: Date) =>
      cyclePrediction
        ? predictionSnapshotForDate(date, cyclePrediction)
        : snapshotForDate(date, cycleConfig),
    [cycleConfig, cyclePrediction],
  )

  const importCycleData = useCallback(
    (result: Extract<ImportResult, { ok: true }>) => {
      setCycleConfig(result.cycleConfig)
      setPeriodStarts(result.data.periodStarts)
      setPeriodRecords(result.data.periodRecords)
      setImportedFrom(result.data.sourceLabel)
      saveCycleData(
        result.cycleConfig,
        result.data.periodStarts,
        result.data.periodRecords,
        result.data.sourceLabel,
      )
    },
    [],
  )

  const snapshot = useMemo(
    () => snapshotFor(selectedDate),
    [selectedDate, snapshotFor],
  )

  const createExperiment = useCallback(
    (input: {
      category: ExperimentCategory
      question: string
      try: string
      watch: readonly string[]
      totalDays: number
    }) => {
      setExperiments((previous) => [
        {
          ...input,
          watch: [...input.watch],
          id: `exp-${Date.now()}`,
          status: 'active',
          startedAt: new Date(),
          observations: [],
        },
        ...previous,
      ])
    },
    [],
  )

  const recordObservation = useCallback(
    (
      id: string,
      values: Record<string, string>,
      completedTry: boolean,
      note?: string,
    ) => {
      const target = experiments.find((item) => item.id === id)
      if (!target || target.status === 'completed') return

      const day = getExperimentProgress(target).currentDay + 1
      const completed = day >= target.totalDays
      setExperiments((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status: completed ? 'completed' : 'active',
                observations: [
                  ...item.observations,
                  { day, date: new Date(), values, completedTry, note },
                ],
              }
            : item,
        ),
      )

    },
    [experiments],
  )

  const archiveExperimentClue = useCallback(
    (experimentId: string) => {
      const experiment = experiments.find((item) => item.id === experimentId)
      if (!experiment || experiment.status !== 'completed') return

      setClues((previous) => {
        if (previous.some((clue) => clue.sourceExperimentId === experimentId)) {
          return previous
        }
        return [
          {
            id: `clue-${Date.now()}`,
            ...buildExperimentClue(experiment),
            status: 'confirmed',
            shells: 1,
            sourceExperimentTitle: experiment.question,
            sourceExperimentId: experiment.id,
          },
          ...previous,
        ]
      })
    },
    [experiments],
  )

  const confirmClue = useCallback((id: string) => {
    setClues((previous) =>
      previous.map((clue) =>
        clue.id === id ? { ...clue, status: 'confirmed' } : clue,
      ),
    )
  }, [])

  const openMindfulnessSession = useCallback((sessionId: string) => {
    setPendingMindfulnessId(sessionId)
    setStackScreen(StackScreens.bay)
  }, [])

  const consumePendingMindfulness = useCallback(() => {
    const id = pendingMindfulnessId
    setPendingMindfulnessId(null)
    return id
  }, [pendingMindfulnessId])

  const value = useMemo(
    () => ({
      tab,
      setTab,
      stackScreen,
      openStackScreen,
      closeStackScreen,
      mode,
      setMode,
      selectedDate,
      setSelectedDate,
      viewedYear,
      viewedMonth: viewedMonthNum,
      setViewedMonth,
      today: TODAY,
      snapshot,
      snapshotFor,
      cycleConfig,
      periodStarts,
      periodRecords,
      importedFrom,
      importCycleData,
      experiments,
      clues,
      createExperiment,
      recordObservation,
      archiveExperimentClue,
      confirmClue,
      openMindfulnessSession,
      consumePendingMindfulness,
    }),
    [
      tab,
      setTab,
      stackScreen,
      openStackScreen,
      closeStackScreen,
      mode,
      selectedDate,
      viewedYear,
      viewedMonthNum,
      setViewedMonth,
      snapshot,
      snapshotFor,
      cycleConfig,
      periodStarts,
      periodRecords,
      importedFrom,
      importCycleData,
      experiments,
      clues,
      createExperiment,
      recordObservation,
      archiveExperimentClue,
      confirmClue,
      openMindfulnessSession,
      consumePendingMindfulness,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
