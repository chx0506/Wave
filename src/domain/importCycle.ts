import { addDays, diffDays, startOfDay } from './dates'
import type { CycleConfig, PhaseWindows } from './types'

export type ImportSource =
  | 'apple-health'
  | 'clue'
  | 'flo'
  | 'generic-csv'
  | 'generic-json'
  | 'unknown'

export type ParsedImport = {
  periodStarts: Date[]
  source: ImportSource
  sourceLabel: string
}

export type ImportResult =
  | {
      ok: true
      data: ParsedImport
      cycleConfig: CycleConfig
      avgCycleLength: number
    }
  | { ok: false; error: string }

function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return startOfDay(value)
  }
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const iso = Date.parse(trimmed)
  if (!Number.isNaN(iso)) return startOfDay(new Date(iso))

  let match = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (match) {
    return startOfDay(new Date(+match[1], +match[2] - 1, +match[3]))
  }

  match = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/)
  if (match) {
    return startOfDay(new Date(+match[3], +match[1] - 1, +match[2]))
  }

  return null
}

/** Apple Health export: `2022-05-25 12:00:00 +0800` */
function parseAppleHealthDate(value: string): Date | null {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return startOfDay(new Date(+match[1], +match[2] - 1, +match[3]))
  }
  return parseDate(trimmed)
}

const BLEEDING_NONE = /BleedingNone|Unspecified/i

function isMenstrualFlowRecord(record: Element): boolean {
  const type = record.getAttribute('type') ?? ''
  return type.includes('MenstrualFlow')
}

function isCycleStartRecord(record: Element): boolean {
  const entries = record.querySelectorAll('MetadataEntry')
  for (const entry of entries) {
    if (
      entry.getAttribute('key') === 'HKMenstrualCycleStart' &&
      entry.getAttribute('value') === '1'
    ) {
      return true
    }
  }
  return false
}

function hasBleeding(record: Element): boolean {
  const value = record.getAttribute('value') ?? ''
  return Boolean(value) && !BLEEDING_NONE.test(value)
}

function inferPeriodStartsFromFlowRecords(records: Element[]): Date[] {
  const flowDays = records
    .filter(hasBleeding)
    .map((record) => parseAppleHealthDate(record.getAttribute('startDate') ?? ''))
    .filter((date): date is Date => date !== null)

  const sorted = uniqueSortedDates(flowDays).sort((a, b) => a.getTime() - b.getTime())
  if (sorted.length === 0) return []

  const starts: Date[] = [sorted[0]]
  for (let index = 1; index < sorted.length; index += 1) {
    const gap = diffDays(sorted[index], sorted[index - 1])
    if (gap >= 7) starts.push(sorted[index])
  }
  return starts
}

function parseAppleHealthXml(text: string): ParsedImport | null {
  if (typeof DOMParser === 'undefined') return null

  const doc = new DOMParser().parseFromString(text, 'text/xml')
  if (doc.querySelector('parsererror')) return null

  const records = [...doc.querySelectorAll('Record')].filter(isMenstrualFlowRecord)
  if (records.length === 0) return null

  const cycleStartDates = records
    .filter(isCycleStartRecord)
    .map((record) => parseAppleHealthDate(record.getAttribute('startDate') ?? ''))
    .filter((date): date is Date => date !== null)

  const periodStarts =
    cycleStartDates.length > 0
      ? uniqueSortedDates(cycleStartDates)
      : uniqueSortedDates(inferPeriodStartsFromFlowRecords(records))

  if (periodStarts.length === 0) return null

  return {
    periodStarts,
    source: 'apple-health',
    sourceLabel: 'Apple 健康',
  }
}

function uniqueSortedDates(dates: Date[]): Date[] {
  const seen = new Set<string>()
  const result: Date[] = []
  for (const date of dates) {
    const key = date.toISOString()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(date)
    }
  }
  return result.sort((a, b) => b.getTime() - a.getTime())
}

function defaultPhaseWindows(cycleLength: number): PhaseWindows {
  const menstrual = 5
  const ovulatory = 3
  const luteal = Math.max(10, Math.round(cycleLength * 0.43))
  const follicular = Math.max(
    3,
    cycleLength - menstrual - ovulatory - luteal,
  )
  return { menstrual, follicular, ovulatory, luteal }
}

export function averageCycleLength(periodStarts: Date[]): number {
  const sorted = [...periodStarts].sort((a, b) => a.getTime() - b.getTime())
  if (sorted.length < 2) return 28

  const gaps: number[] = []
  for (let index = 1; index < sorted.length; index += 1) {
    gaps.push(diffDays(sorted[index], sorted[index - 1]))
  }

  const valid = gaps.filter((gap) => gap >= 21 && gap <= 45)
  if (valid.length === 0) return 28
  return Math.round(valid.reduce((sum, gap) => sum + gap, 0) / valid.length)
}

export function buildCycleConfig(periodStarts: Date[]): CycleConfig {
  const sorted = uniqueSortedDates(periodStarts)
  if (sorted.length === 0) {
    throw new Error('没有找到有效的经期开始日期')
  }

  const latest = sorted[0]
  const previous = sorted[1] ?? addDays(latest, -28)
  const cycleLength = averageCycleLength(sorted)

  return {
    cycleLength,
    currentCycleStart: latest,
    lastLowTide: previous,
    phaseWindows: defaultPhaseWindows(cycleLength),
  }
}

function extractDatesFromJson(value: unknown, dates: Date[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => extractDatesFromJson(item, dates))
    return
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of [
      'start',
      'startDate',
      'date',
      'period_start',
      'begin',
      'firstDay',
      'first_day',
    ]) {
      if (key in record) {
        const parsed = parseDate(record[key])
        if (parsed) dates.push(parsed)
      }
    }

    for (const key of [
      'period',
      'cycles',
      'periods',
      'periodStarts',
      'menstruation',
      'history',
    ]) {
      if (key in record) extractDatesFromJson(record[key], dates)
    }
    return
  }

  if (typeof value === 'string') {
    const parsed = parseDate(value)
    if (parsed) dates.push(parsed)
  }
}

function detectJsonSource(value: unknown): ImportSource {
  if (!value || typeof value !== 'object') return 'unknown'
  const record = value as Record<string, unknown>
  if ('cycles' in record || 'tracker' in record) return 'clue'
  if ('periods' in record && Array.isArray(record.periods)) return 'flo'
  return 'generic-json'
}

function parseCSV(text: string): ParsedImport | null {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 1) return null

  const header = lines[0].split(/[,;\t]/).map((cell) => cell.trim().toLowerCase())
  const dateColIdx = header.findIndex((cell) =>
    /date|start|period|经期|开始|日期/.test(cell),
  )

  const dates: Date[] = []

  if (dateColIdx >= 0) {
    for (let index = 1; index < lines.length; index += 1) {
      const cols = lines[index].split(/[,;\t]/)
      const parsed = parseDate(cols[dateColIdx]?.trim())
      if (parsed) dates.push(parsed)
    }
  } else {
    for (let index = 0; index < lines.length; index += 1) {
      const cols = lines[index].split(/[,;\t]/)
      for (const col of cols) {
        const parsed = parseDate(col.trim())
        if (parsed) dates.push(parsed)
      }
    }
  }

  if (dates.length === 0) return null

  return {
    periodStarts: uniqueSortedDates(dates),
    source: 'generic-csv',
    sourceLabel: 'CSV 文件',
  }
}

export function parseImportFile(text: string, filename: string): ImportResult {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const trimmed = text.trim()
  const head = trimmed.slice(0, 512)

  try {
    if (
      ext === 'xml' ||
      head.includes('HealthData') ||
      head.includes('HKCategoryTypeIdentifierMenstrualFlow')
    ) {
      const appleHealth = parseAppleHealthXml(text)
      if (appleHealth) {
        const cycleConfig = buildCycleConfig(appleHealth.periodStarts)
        return {
          ok: true,
          data: appleHealth,
          cycleConfig,
          avgCycleLength: cycleConfig.cycleLength,
        }
      }
      if (ext === 'xml' || head.includes('HealthData')) {
        return {
          ok: false,
          error: 'Apple 健康导出里没有找到经期记录。请确认已在「健康」App 中记录过月经数据。',
        }
      }
    }

    if (ext === 'json' || trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsedJson = JSON.parse(text) as unknown
      const dates: Date[] = []
      extractDatesFromJson(parsedJson, dates)

      if (dates.length === 0) {
        return { ok: false, error: 'JSON 文件里没有识别到经期开始日期' }
      }

      const source = detectJsonSource(parsedJson)
      const sourceLabel =
        source === 'clue' ? 'Clue' : source === 'flo' ? 'Flo' : 'JSON 文件'
      const periodStarts = uniqueSortedDates(dates)
      const cycleConfig = buildCycleConfig(periodStarts)

      return {
        ok: true,
        data: { periodStarts, source, sourceLabel },
        cycleConfig,
        avgCycleLength: cycleConfig.cycleLength,
      }
    }

    const csv = parseCSV(text)
    if (csv) {
      const cycleConfig = buildCycleConfig(csv.periodStarts)
      return {
        ok: true,
        data: csv,
        cycleConfig,
        avgCycleLength: cycleConfig.cycleLength,
      }
    }

    return {
      ok: false,
      error: '无法识别文件格式。请上传 Apple 健康导出（ZIP/XML）、或其他 App 的 CSV / JSON 文件。',
    }
  } catch {
    return { ok: false, error: '文件解析失败，请检查格式是否正确。' }
  }
}

export const IMPORT_FORMAT_HINTS = [
  'Apple 健康导出（ZIP 或 export.xml）',
  'Clue / Flo / 美柚等 App 的数据导出（CSV 或 JSON）',
  '导入后会在本设备本地保存，不会上传到服务器',
] as const
