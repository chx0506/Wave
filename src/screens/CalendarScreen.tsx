import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { DaySummaryBar } from '@/components/calendar/DaySummaryBar'
import { LayeredWaves } from '@/components/calendar/LayeredWaves'
import { MonthPager } from '@/components/calendar/MonthPager'
import { monthCells } from '@/domain/calendar'
import { SAMPLE_CYCLE } from '@/data/sample'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { useMemo } from 'react'
import styles from './CalendarScreen.module.css'

export function CalendarScreen() {
  const {
    viewedYear,
    viewedMonth,
    setViewedMonth,
    selectedDate,
    setSelectedDate,
    snapshotFor,
    setTab,
  } = useAppState()

  const cells = useMemo(
    () => monthCells(viewedYear, viewedMonth, SAMPLE_CYCLE),
    [viewedYear, viewedMonth],
  )

  return (
    <div className={styles.screen}>
      <div className={styles.waves}>
        <LayeredWaves />
      </div>
      <div className={styles.body}>
        <CalendarHeader
          lastLowTide={SAMPLE_CYCLE.lastLowTide}
          cycleLength={SAMPLE_CYCLE.cycleLength}
        />
        <section className={styles.card}>
          <MonthPager year={viewedYear} month={viewedMonth} onChange={setViewedMonth} />
          <CalendarGrid cells={cells} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </section>
        <DaySummaryBar
          snapshot={snapshotFor(selectedDate)}
          onBackfill={() => setTab(Tabs.record)}
        />
      </div>
    </div>
  )
}
