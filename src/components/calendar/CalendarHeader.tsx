import { formatMonthDay } from '@/domain/dates'
import styles from './CalendarHeader.module.css'

export function CalendarHeader({
  lastLowTide,
  cycleLength,
}: {
  lastLowTide: Date
  cycleLength: number
}) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>潮汐日历</h1>
      <p className={styles.meta}>
        上次低潮 {formatMonthDay(lastLowTide)} · 周期 {cycleLength} 天
      </p>
    </header>
  )
}
