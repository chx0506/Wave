import { PhoneFrame } from '@/components/chrome/PhoneFrame'
import { StatusBar } from '@/components/chrome/StatusBar'
import { TabBar } from '@/components/chrome/TabBar'
import { BayScreen } from '@/screens/BayScreen'
import { CoastScreen } from '@/screens/CoastScreen'
import { ExploreScreen } from '@/screens/ExploreScreen'
import { MeScreen } from '@/screens/MeScreen'
import { ObserveScreen } from '@/screens/ObserveScreen'
import { Tabs } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import styles from './AppShell.module.css'

export function AppShell() {
  const { tab, setTab, mode } = useAppState()

  return (
    <PhoneFrame mode={mode}>
      <div className={styles.shell} data-phone-shell>
        <StatusBar />
        <main className={styles.main}>
          {tab === Tabs.home ? <CoastScreen /> : null}
          {tab === Tabs.observe ? <ObserveScreen /> : null}
          {tab === Tabs.bay ? <BayScreen /> : null}
          {tab === Tabs.explore ? <ExploreScreen /> : null}
          {tab === Tabs.me ? <MeScreen /> : null}
        </main>
        <TabBar active={tab} onChange={setTab} />
      </div>
    </PhoneFrame>
  )
}
