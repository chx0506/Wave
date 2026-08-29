export const IMPORT_PARAM = 'import'

export function hasImportIntent(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get(IMPORT_PARAM) === '1'
}

export function clearImportIntent() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.delete(IMPORT_PARAM)
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

/** Shareable link — opens welcome with import entry, then data import sheet. */
export function buildImportShareUrl(): string {
  if (typeof window === 'undefined') return '/?import=1'
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(IMPORT_PARAM, '1')
  return url.toString()
}

export async function copyImportShareLink(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false
  try {
    await navigator.clipboard.writeText(buildImportShareUrl())
    return true
  } catch {
    return false
  }
}
