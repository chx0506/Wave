/**
 * Calendar-cell water. `level` is 0–1; only the fill height changes
 * when cycle math is tweaked.
 */
export function TideMark({ level }: { level: number }) {
  const y = 26 - level * 20
  return (
    <svg className="tide-mark" viewBox="0 0 48 28" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={`M0 28 L0 ${y + 5}
           Q 6 ${y - 1} 12 ${y + 4}
           T 24 ${y + 2}
           T 36 ${y + 5}
           T 48 ${y + 1}
           L 48 28 Z`}
        fill="var(--tide-soft)"
      />
      <path
        d={`M0 28 L0 ${y + 9}
           Q 8 ${y + 3} 16 ${y + 8}
           T 32 ${y + 6}
           T 48 ${y + 9}
           L 48 28 Z`}
        fill="var(--tide)"
        opacity="0.5"
      />
    </svg>
  )
}
