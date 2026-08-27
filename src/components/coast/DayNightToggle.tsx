import { DayModes, type DayMode } from '@/domain/types'
import { Moon, Sun } from '@phosphor-icons/react'
import styles from './DayNightToggle.module.css'

export function DayNightToggle({
  mode,
  onChange,
}: {
  mode: DayMode
  onChange: (mode: DayMode) => void
}) {
  return (
    <div className={styles.track} role="group" aria-label="日夜切换">
      <span className={styles.thumb} data-mode={mode} />
      <button
        type="button"
        className={styles.side}
        data-active={mode === DayModes.day}
        onClick={() => onChange(DayModes.day)}
        aria-pressed={mode === DayModes.day}
        aria-label="日间海岸"
      >
        <Sun size={16} weight={mode === DayModes.day ? 'fill' : 'regular'} />
      </button>
      <button
        type="button"
        className={styles.side}
        data-active={mode === DayModes.night}
        onClick={() => onChange(DayModes.night)}
        aria-pressed={mode === DayModes.night}
        aria-label="夜间海岸"
      >
        <Moon size={16} weight={mode === DayModes.night ? 'fill' : 'regular'} />
      </button>
    </div>
  )
}
