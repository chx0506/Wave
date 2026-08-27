import { SAMPLE_CYCLE, TODAY } from '@/data/sample'
import { snapshotForDate } from '@/domain/cycle'
import { DayModes, Tabs, type BodyClue, type DayMode, type Experiment, type ExperimentCategory, type TabId } from '@/domain/types'
import { OBSERVE_ACTIVE, OBSERVE_CLUES } from '@/data/content'
import { AppContext } from '@/state/useAppState'
import { useCallback, useMemo, useState, type ReactNode } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>(Tabs.home)
  const [mode, setMode] = useState<DayMode>(DayModes.day)
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY)
  const [viewedYear, setViewedYear] = useState(TODAY.getFullYear())
  const [viewedMonthNum, setViewedMonthNum] = useState(TODAY.getMonth() + 1)
  const [experiments, setExperiments] = useState<Experiment[]>([{
    id: 'exp-sleep', category: 'sleep', question: OBSERVE_ACTIVE.question, try: OBSERVE_ACTIVE.try,
    watch: OBSERVE_ACTIVE.watch, totalDays: OBSERVE_ACTIVE.total, currentDay: OBSERVE_ACTIVE.day,
    status: 'active', startedAt: new Date(2026, 7, 22), observations: [],
  }])
  const [clues, setClues] = useState<BodyClue[]>(OBSERVE_CLUES.map((c, i) => ({ ...c, id: `clue-${i}`, category: i === 0 ? 'sleep' : i === 1 ? 'energy' : 'pain', status: 'confirmed' as const })))

  const createExperiment = useCallback((input: { category: ExperimentCategory; question: string; try: string; watch: readonly string[]; totalDays: number }) => {
    setExperiments((prev) => [{ ...input, watch: [...input.watch], id: `exp-${Date.now()}`, currentDay: 0, status: 'active', startedAt: new Date(), observations: [] }, ...prev])
  }, [])
  const recordObservation = useCallback((id: string, values: Record<string, string>, completedTry: boolean, note?: string) => {
    setExperiments((prev) => prev.map((item) => {
      if (item.id !== id || item.status === 'completed') return item
      const day = item.currentDay + 1
      const next = { ...item, currentDay: day, status: day >= item.totalDays ? 'completed' as const : 'active' as const, observations: [...item.observations, { day, date: new Date(), values, completedTry, note }] }
      if (next.status === 'completed') setClues((existing) => [{ id: `clue-${Date.now()}`, title: `${item.question.replace('为什么', '').replace('？', '')} · 出现了新的线索`, note: '完成一次身体实验后生成，继续在下个周期观察', category: item.category, status: 'pending', shells: 1, sourceExperimentId: item.id }, ...existing])
      return next
    }))
  }, [])
  const confirmClue = useCallback((id: string) => setClues((prev) => prev.map((clue) => clue.id === id ? { ...clue, status: 'confirmed' } : clue)), [])

  const setViewedMonth = useCallback((year: number, month: number) => {
    setViewedYear(year)
    setViewedMonthNum(month)
  }, [])

  const snapshotFor = useCallback(
    (date: Date) => snapshotForDate(date, SAMPLE_CYCLE),
    [],
  )

  const snapshot = useMemo(
    () => snapshotFor(selectedDate),
    [selectedDate, snapshotFor],
  )

  const value = useMemo(
    () => ({
      tab,
      setTab,
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
      experiments, clues, createExperiment, recordObservation, confirmClue,
    }),
    [tab, mode, selectedDate, viewedYear, viewedMonthNum, setViewedMonth, snapshot, snapshotFor, experiments, clues, createExperiment, recordObservation, confirmClue],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
