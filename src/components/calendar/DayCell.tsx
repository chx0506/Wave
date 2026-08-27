import { TideMark } from '@/components/visuals/TideMark'
import { TODAY } from '@/data/sample'
import { sameDay } from '@/domain/dates'
import type { DaySnapshot } from '@/domain/types'
import styles from './DayCell.module.css'

export function DayCell({
  snapshot,
  selected,
  onSelect,
}: {
  snapshot: DaySnapshot
  selected: boolean
  onSelect: (date: Date) => void
}) {
  const day = snapshot.date.getDate()
  const isToday = sameDay(snapshot.date, TODAY)

  return (
    <button
      type="button"
      className={styles.cell}
      data-selected={selected}
      onClick={() => onSelect(snapshot.date)}
      aria-label={`${day}日`}
      aria-pressed={selected}
    >
      <span className={styles.num} data-today={isToday}>
        {day}
      </span>
      <span className={styles.wave}>
        <TideMark level={snapshot.tideHeight} />
      </span>
    </button>
  )
}
