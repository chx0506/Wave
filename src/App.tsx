import { AppShell } from '@/app/AppShell'
import { AppProvider } from '@/state/AppProvider'

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
