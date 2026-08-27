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
        <span className={styles.btnSilent} />
        <span className={styles.btnVolUp} />
        <span className={styles.btnVolDown} />
        <span className={styles.btnPower} />
        <div className={styles.screen}>{children}</div>
        <span className={styles.home} />
      </div>
    </div>
  )
}
