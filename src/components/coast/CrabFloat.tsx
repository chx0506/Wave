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

function CrabMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="14" fill="var(--tide-wash)" />
      <ellipse cx="14" cy="16" rx="7.5" ry="5.5" fill="var(--tide)" />
      <circle cx="11" cy="14.5" r="1.2" fill="#fff" />
      <circle cx="17" cy="14.5" r="1.2" fill="#fff" />
      <path
        d="M6 15 C4 12, 5 9, 7.5 10"
        fill="none"
        stroke="var(--tide-deep)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M22 15 C24 12, 23 9, 20.5 10"
        fill="none"
        stroke="var(--tide-deep)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9 20 C11 22, 17 22, 19 20"
        fill="none"
        stroke="var(--tide-deep)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
