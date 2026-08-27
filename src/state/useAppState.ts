import type { DayMode, DaySnapshot, TabId } from '@/domain/types'
import { createContext, useContext } from 'react'

export type AppState = {
  tab: TabId
  setTab: (tab: TabId) => void
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
}

export const AppContext = createContext<AppState | null>(null)

export function useAppState(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used inside AppProvider')
  return ctx
}
