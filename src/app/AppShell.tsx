import { PhoneFrame } from '@/components/chrome/PhoneFrame'
import { StatusBar } from '@/components/chrome/StatusBar'
import { TabBar } from '@/components/chrome/TabBar'
import { CalendarScreen } from '@/screens/CalendarScreen'
import { CoastScreen } from '@/screens/CoastScreen'
import { PlaceholderScreen } from '@/screens/PlaceholderScreen'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import styles from './AppShell.module.css'

export function AppShell() {
  const { tab, setTab, mode } = useAppState()

  return (
    <PhoneFrame mode={mode}>
      <StatusBar />
      <main className={styles.main}>
        {tab === Tabs.coast ? <CoastScreen /> : null}
        {tab === Tabs.calendar ? <CalendarScreen /> : null}
        {tab === Tabs.record || tab === Tabs.atlas ? (
          <PlaceholderScreen tab={tab} />
        ) : null}
      </main>
      <TabBar
        active={tab}
        onChange={setTab}
        tone={tab === Tabs.coast ? 'frosted' : 'solid'}
      />
    </PhoneFrame>
  )
}
