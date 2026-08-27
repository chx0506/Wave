import { WEEKDAYS } from '@/domain/calendar'
import { toKey } from '@/domain/dates'
import type { CalendarCell } from '@/domain/types'
import { DayCell } from './DayCell'
import styles from './CalendarGrid.module.css'

export function CalendarGrid({
  cells,
  selectedDate,
  onSelect,
}: {
  cells: CalendarCell[]
  selectedDate: Date
  onSelect: (date: Date) => void
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((cell) =>
          cell.kind === 'empty' ? (
            <div key={cell.key} />
          ) : (
            <DayCell
              key={cell.key}
              snapshot={cell.snapshot}
              selected={cell.key === toKey(selectedDate)}
              onSelect={onSelect}
            />
          ),
        )}
      </div>
    </div>
  )
}
