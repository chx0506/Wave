import type {
  DailyJournalRequest,
  DailyJournalResponse,
} from '@/types/dailyJournal'

const MEMORY_CACHE = new Map<string, DailyJournalResponse>()
const IN_FLIGHT = new Map<string, Promise<DailyJournalResponse>>()
const STORAGE_PREFIX = 'wave-daily-journal:v2-copy-style:'

export function dailyJournalRequestKey(request: DailyJournalRequest): string {
  return `${STORAGE_PREFIX}${JSON.stringify(request)}`
}

export async function fetchDailyJournal(
  request: DailyJournalRequest,
  options: { force?: boolean } = {},
): Promise<DailyJournalResponse> {
  const key = dailyJournalRequestKey(request)
  if (!options.force) {
    const memory = MEMORY_CACHE.get(key)
    if (memory) return memory

    const stored = readStoredResponse(key)
    if (stored) {
      MEMORY_CACHE.set(key, stored)
      return stored
    }
  }

  const pending = IN_FLIGHT.get(key)
  if (pending) return pending

  const promise = fetch('/api/daily-journal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
    .then(async (response) => {
      const body = (await response.json()) as DailyJournalResponse
      if (!response.ok && body.ok === false) return body
      if (body.ok) {
        MEMORY_CACHE.set(key, body)
        writeStoredResponse(key, body)
      }
      return body
    })
    .finally(() => {
      IN_FLIGHT.delete(key)
    })

  IN_FLIGHT.set(key, promise)
  return promise
}

function readStoredResponse(key: string): DailyJournalResponse | null {
  if (typeof sessionStorage === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DailyJournalResponse
    return parsed.ok ? { ...parsed, source: 'cache' } : null
  } catch {
    return null
  }
}

function writeStoredResponse(key: string, response: DailyJournalResponse) {
  if (typeof sessionStorage === 'undefined' || !response.ok) return

  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ ...response, source: 'cache' }),
    )
  } catch {
    /* Ignore storage failures. */
  }
}
