import type { MindfulnessSession } from '@/data/mindfulness'
import { BayScreen } from '@/screens/BayScreen'
import { MindfulnessLibrary } from '@/screens/MindfulnessLibrary'
import { mindfulnessSessionById } from '@/data/mindfulness'
import { useAppState } from '@/state/useAppState'
import { useEffect, useState } from 'react'

export function MindfulnessScreen({ onClose }: { onClose?: () => void }) {
  const { consumePendingMindfulness } = useAppState()
  const [activeSession, setActiveSession] = useState<MindfulnessSession | null>(null)

  useEffect(() => {
    const pendingId = consumePendingMindfulness()
    if (!pendingId) return
    const session = mindfulnessSessionById(pendingId)
    if (session) setActiveSession(session)
  }, [consumePendingMindfulness])

  if (activeSession) {
    return (
      <BayScreen
        session={activeSession}
        onBack={() => setActiveSession(null)}
      />
    )
  }

  return <MindfulnessLibrary onSelect={setActiveSession} onClose={onClose} />
}
