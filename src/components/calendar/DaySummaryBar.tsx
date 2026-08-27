import { BACKFILL_PROMPT, PHASE_LABEL, TIDE_LABEL } from '@/domain/copy'
import { formatMonthDay } from '@/domain/dates'
import type { DaySnapshot } from '@/domain/types'
import { Circle, PencilSimple, Waves } from '@phosphor-icons/react'
import styles from './DaySummaryBar.module.css'

export function DaySummaryBar({
  snapshot,
  onBackfill,
}: {
  snapshot: DaySnapshot
  onBackfill: () => void
}) {
  return (
    <div className={styles.bar}>
      <strong className={styles.date}>{formatMonthDay(snapshot.date)}</strong>
      <span className={styles.chip}>
        <Waves size={14} weight="fill" />
        {TIDE_LABEL[snapshot.tide]}
      </span>
      <span className={styles.chip}>
        <Circle size={12} weight="fill" />
        {PHASE_LABEL[snapshot.phase]}
      </span>
      <button type="button" className={styles.action} onClick={onBackfill}>
        <PencilSimple size={14} weight="bold" />
        {BACKFILL_PROMPT}
      </button>
    </div>
  )
}
