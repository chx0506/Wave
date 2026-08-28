import { CrabMark } from '@/components/coast/CrabMark'
import { CRAB_LINES, CRAB_NAME } from '@/domain/copy'
import type { Phase } from '@/domain/types'
import { X } from '@phosphor-icons/react'
import { useState } from 'react'
import styles from './CrabFloat.module.css'

export function CrabFloat({
  phase,
  onOpenBay,
  onOpenObserve,
}: {
  phase: Phase
  onOpenBay: () => void
  onOpenObserve: () => void
}) {
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label={`打开 ${CRAB_NAME}`}
      >
        <CrabMark />
      </button>
    )
  }

  const line = CRAB_LINES[phase]
  const secondary =
    phase === 'luteal'
      ? { label: '去潮池观察', action: onOpenObserve }
      : { label: '去静谧海湾', action: onOpenBay }

  return (
    <aside className={styles.card} aria-label={CRAB_NAME}>
      <button
        type="button"
        className={styles.close}
        aria-label="收起"
        onClick={() => setOpen(false)}
      >
        <X size={14} weight="bold" />
      </button>
      <div className={styles.row}>
        <span className={styles.avatar} aria-hidden="true">
          <CrabMark />
        </span>
        <div className={styles.copy}>
          <p className={styles.name}>{CRAB_NAME}</p>
          <p className={styles.line}>{line}</p>
          <button type="button" className={styles.link} onClick={secondary.action}>
            {secondary.label}
          </button>
        </div>
      </div>
    </aside>
  )
}

