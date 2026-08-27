import { SAMPLE_CYCLE, TODAY } from '@/data/sample'
import { snapshotForDate } from '@/domain/cycle'
import { DayModes, Tabs, type DayMode, type TabId } from '@/domain/types'
import { AppContext } from '@/state/useAppState'
import { useCallback, useMemo, useState, type ReactNode } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>(Tabs.coast)
  const [mode, setMode] = useState<DayMode>(DayModes.day)
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY)
  const [viewedYear, setViewedYear] = useState(TODAY.getFullYear())
  const [viewedMonthNum, setViewedMonthNum] = useState(TODAY.getMonth() + 1)

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
    }),
    [tab, mode, selectedDate, viewedYear, viewedMonthNum, setViewedMonth, snapshot, snapshotFor],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
