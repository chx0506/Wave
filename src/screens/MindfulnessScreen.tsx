import type { MindfulnessSession } from '@/data/mindfulness'
import { BayScreen } from '@/screens/BayScreen'
import { MindfulnessLibrary } from '@/screens/MindfulnessLibrary'
import { useState } from 'react'

export function MindfulnessScreen() {
  const [activeSession, setActiveSession] = useState<MindfulnessSession | null>(null)

  if (activeSession) {
    return (
      <BayScreen
        session={activeSession}
        onBack={() => setActiveSession(null)}
      />
    )
  }

  return <MindfulnessLibrary onSelect={setActiveSession} />
}
