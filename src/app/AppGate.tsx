import { PhoneFrame } from '@/components/chrome/PhoneFrame'
import { StatusBar } from '@/components/chrome/StatusBar'
import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { DayModes } from '@/domain/types'
import { useEffect, useState } from 'react'
import { AppShell } from './AppShell'

const ENTERED_KEY = 'wave-entered'

function shouldForceWelcome() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('welcome') === '1'
}

function readEntered() {
  if (shouldForceWelcome()) return false
  try {
    return localStorage.getItem(ENTERED_KEY) === '1'
  } catch {
    return false
  }
}

export function AppGate() {
  const [entered, setEntered] = useState(readEntered)

  useEffect(() => {
    if (shouldForceWelcome()) setEntered(false)
  }, [])

  const handleEnter = () => {
    if (shouldForceWelcome()) {
      setEntered(true)
      return
    }
    try {
      localStorage.setItem(ENTERED_KEY, '1')
    } catch {
      /* ignore storage failures */
    }
    setEntered(true)
  }

  if (!entered) {
    return (
      <PhoneFrame mode={DayModes.day}>
        <StatusBar />
        <WelcomeScreen onEnter={handleEnter} />
      </PhoneFrame>
    )
  }

  return <AppShell />
}
