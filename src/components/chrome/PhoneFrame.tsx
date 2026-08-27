import type { DayMode } from '@/domain/types'
import type { ReactNode } from 'react'
import styles from './PhoneFrame.module.css'

export function PhoneFrame({
  mode,
  children,
}: {
  mode: DayMode
  children: ReactNode
}) {
  return (
    <div className={styles.studio}>
      <div className={styles.device} data-mode={mode}>
        <div className={styles.bezel}>
          <div className={styles.island} aria-hidden="true" />
          <div className={styles.screen}>{children}</div>
        </div>
      </div>
    </div>
  )
}
