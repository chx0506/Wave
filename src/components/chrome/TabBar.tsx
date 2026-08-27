import { TAB_LABEL } from '@/domain/copy'
import { Tabs, type TabId } from '@/domain/types'
import {
  BookOpen,
  CalendarBlank,
  Heart,
  Waves,
} from '@phosphor-icons/react'
import styles from './TabBar.module.css'

const ITEMS = [
  { id: Tabs.coast, Icon: Waves },
  { id: Tabs.record, Icon: Heart },
  { id: Tabs.calendar, Icon: CalendarBlank },
  { id: Tabs.atlas, Icon: BookOpen },
] as const

export function TabBar({
  active,
  onChange,
  tone,
}: {
  active: TabId
  onChange: (tab: TabId) => void
  tone: 'frosted' | 'solid'
}) {
  return (
    <nav className={styles.bar} data-tone={tone} aria-label="主导航">
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
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
            </span>
            <span className={styles.label}>{TAB_LABEL[id]}</span>
          </button>
        )
      })}
    </nav>
  )
}
