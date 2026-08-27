/** Brand wave mark used on the coast status card. */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="18" fill="var(--tide-wash)" />
      <path
        d="M8 21.5c2.4-3.2 4.6-3.2 7 0 2.4 3.2 4.6 3.2 7 0 2.4-3.2 4.6-3.2 6.4-1"
        fill="none"
        stroke="var(--tide-deep)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M9 16.2c2.2-2.6 4.2-2.6 6.4 0 2.2 2.6 4.2 2.6 6.4 0"
        fill="none"
        stroke="var(--tide)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}
