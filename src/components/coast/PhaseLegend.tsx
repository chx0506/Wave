import { PHASE_LABEL, PHASE_TIDE_LEGEND } from '@/domain/copy'
import type { Phase } from '@/domain/types'
import styles from './PhaseLegend.module.css'

export function PhaseLegend({ activePhase }: { activePhase: Phase }) {
  return (
    <div className={styles.chip} aria-label="周期与潮汐对照">
      {PHASE_TIDE_LEGEND.map((item, index) => (
        <span key={item.phase} className={styles.item} data-active={item.phase === activePhase}>
          {index > 0 ? <span className={styles.dot} aria-hidden="true" /> : null}
          <span className={styles.phase}>{PHASE_LABEL[item.phase].replace('期', '')}</span>
          <span className={styles.eq} aria-hidden="true">
            =
          </span>
          <span className={styles.tide}>{item.tide}</span>
        </span>
      ))}
    </div>
  )
}
