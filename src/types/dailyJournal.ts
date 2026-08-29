import type { AdviceCategory } from '@/data/tideJournal'
import type { Phase, TideState } from '@/domain/types'

export type DailyJournalAdvice = Record<AdviceCategory, string>

export type DailyJournalAiResult = {
  todayHeadline: string
  todayIntro: string
  advice: DailyJournalAdvice
}

export type DailyJournalRequest = {
  date: string
  cycle: {
    cycleDay: number
    cycleLength: number
    phase: Phase
    tide: TideState
    currentCycleStart: string
    periodStarts: string[]
  }
}

export type DailyJournalResponse =
  | {
      ok: true
      source: 'ai' | 'cache' | 'fast'
      result: DailyJournalAiResult
    }
  | {
      ok: false
      error: string
    }
