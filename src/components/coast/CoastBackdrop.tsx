import { IllustratedTide } from '@/components/coast/IllustratedTide'
import type { DayMode } from '@/domain/types'
import styles from './CoastBackdrop.module.css'

export function CoastBackdrop({
  mode,
  coverage,
}: {
  mode: DayMode
  coverage: number
}) {
  return (
    <div className={styles.scene} aria-hidden="true">
      <IllustratedTide mode={mode} coverage={coverage} />
    </div>
  )
}
