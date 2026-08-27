import { CoastBackdrop } from '@/components/coast/CoastBackdrop'
import { DayNightToggle } from '@/components/coast/DayNightToggle'
import { TideStatusCard } from '@/components/coast/TideStatusCard'
import { formatMonthDay } from '@/domain/dates'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import styles from './CoastScreen.module.css'

export function CoastScreen() {
  const { mode, setMode, today, snapshotFor, setTab } = useAppState()
  const snapshot = snapshotFor(today)

  return (
    <div className={styles.screen}>
      <CoastBackdrop mode={mode} coverage={snapshot.tideHeight} />
      <header className={styles.top}>
        <p className={styles.date}>
          {formatMonthDay(today)} / 周期第 {snapshot.cycleDay} 天
        </p>
        <DayNightToggle mode={mode} onChange={setMode} />
      </header>
      <div className={styles.bottom}>
        <TideStatusCard snapshot={snapshot} onRecord={() => setTab(Tabs.record)} />
      </div>
    </div>
  )
}
