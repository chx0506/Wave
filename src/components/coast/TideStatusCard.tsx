import { BrandMark } from '@/components/visuals/BrandMark'
import { PHASE_LABEL, RECORD_PROMPT, TIDE_HINT, TIDE_LABEL } from '@/domain/copy'
import type { DaySnapshot } from '@/domain/types'
import styles from './TideStatusCard.module.css'

export function TideStatusCard({
  snapshot,
  onRecord,
}: {
  snapshot: DaySnapshot
  onRecord: () => void
}) {
  return (
    <section className={styles.card}>
      <BrandMark />
      <h1 className={styles.title}>
        {TIDE_LABEL[snapshot.tide]} · {PHASE_LABEL[snapshot.phase]}
      </h1>
      <p className={styles.hint}>
        {TIDE_HINT[snapshot.tide]}
        <svg className={styles.wave} viewBox="0 0 120 10" aria-hidden="true">
          <path
            d="M2 6 C 18 1, 30 9, 46 5 C 62 1, 74 9, 90 5 C 102 2, 110 7, 118 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </p>
      <button type="button" className={styles.cta} onClick={onRecord}>
        {RECORD_PROMPT}
      </button>
    </section>
  )
}
