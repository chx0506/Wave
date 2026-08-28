import { AppGate } from '@/app/AppGate'
import { AppProvider } from '@/state/AppProvider'

export default function App() {
  return (
    <AppProvider>
      <AppGate />
    </AppProvider>
  )
}
