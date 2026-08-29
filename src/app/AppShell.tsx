import { PhoneFrame } from '@/components/chrome/PhoneFrame'
import { StatusBar } from '@/components/chrome/StatusBar'
import { TabBar } from '@/components/chrome/TabBar'
import { StackScreens, Tabs } from '@/domain/types'
import { CalendarScreen } from '@/screens/CalendarScreen'
import { CoastScreen } from '@/screens/CoastScreen'
import { ExploreScreen } from '@/screens/ExploreScreen'
import { MeScreen } from '@/screens/MeScreen'
import { MindfulnessScreen } from '@/screens/MindfulnessScreen'
import { ObserveScreen } from '@/screens/ObserveScreen'
import { StatsScreen } from '@/screens/StatsScreen'
import { useAppState } from '@/state/useAppState'
import styles from './AppShell.module.css'

export function AppShell() {
  const { tab, setTab, mode, stackScreen, closeStackScreen } = useAppState()

  const mainContent =
    stackScreen === StackScreens.observe ? (
      <ObserveScreen onClose={closeStackScreen} />
    ) : stackScreen === StackScreens.bay ? (
      <MindfulnessScreen onClose={closeStackScreen} />
    ) : stackScreen === StackScreens.me ? (
      <MeScreen onClose={closeStackScreen} />
    ) : (
      <>
        {tab === Tabs.home ? <CoastScreen /> : null}
        {tab === Tabs.calendar ? <CalendarScreen /> : null}
        {tab === Tabs.stats ? <StatsScreen /> : null}
        {tab === Tabs.explore ? <ExploreScreen /> : null}
      </>
    )

  return (
    <PhoneFrame mode={mode}>
      <div className={styles.shell} data-phone-shell>
        <StatusBar />
        <main className={styles.main}>{mainContent}</main>
        {!stackScreen ? <TabBar active={tab} onChange={setTab} /> : null}
      </div>
    </PhoneFrame>
  )
}
