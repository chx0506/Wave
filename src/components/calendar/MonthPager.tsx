import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { formatYearMonth } from '@/domain/dates'
import styles from './MonthPager.module.css'

export function MonthPager({
  year,
  month,
  onChange,
}: {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}) {
  function shift(delta: number) {
    const date = new Date(year, month - 1 + delta, 1)
    onChange(date.getFullYear(), date.getMonth() + 1)
  }

  return (
    <div className={styles.pager}>
      <button type="button" className={styles.arrow} onClick={() => shift(-1)} aria-label="上个月">
        <CaretLeft size={18} weight="bold" />
      </button>
      <p className={styles.label}>{formatYearMonth(year, month)}</p>
      <button type="button" className={styles.arrow} onClick={() => shift(1)} aria-label="下个月">
        <CaretRight size={18} weight="bold" />
      </button>
    </div>
  )
}
