import { TAB_LABEL } from '@/domain/copy'
import { Tabs, type TabId } from '@/domain/types'
import {
  CalendarBlank,
  ChartBar,
  Compass,
  House,
} from '@phosphor-icons/react'
import styles from './TabBar.module.css'

const ITEMS = [
  { id: Tabs.home, Icon: House },
  { id: Tabs.calendar, Icon: CalendarBlank },
  { id: Tabs.stats, Icon: ChartBar },
  { id: Tabs.explore, Icon: Compass },
] as const

export function TabBar({
  active,
  onChange,
}: {
  active: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <div className={styles.dock}>
      <nav className={styles.bar} aria-label="主导航">
        {ITEMS.map(({ id, Icon }) => {
          const isActive = id === active
          return (
            <button
              key={id}
              type="button"
              className={styles.item}
              data-active={isActive}
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.iconWrap}>
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              </span>
              <span className={styles.label}>{TAB_LABEL[id]}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
