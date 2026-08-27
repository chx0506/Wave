/** Layered watercolor bands behind the calendar title. */
export function LayeredWaves() {
  return (
    <svg className="layered-waves" viewBox="0 0 390 260" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 70 C 60 20, 120 110, 190 50 C 260 0, 330 90, 390 35 L 390 0 L 0 0 Z"
        fill="#d7eef8"
      />
      <path
        d="M0 118 C 80 68, 140 160, 220 100 C 290 50, 340 140, 390 88 L 390 0 L 0 0 Z"
        fill="#c5e4f4"
        opacity="0.85"
      />
      <path
        d="M0 168 C 90 118, 160 198, 240 148 C 310 108, 350 188, 390 138 L 390 0 L 0 0 Z"
        fill="var(--tide-soft)"
        opacity="0.45"
      />
      <path
        d="M0 210 C 100 168, 170 230, 250 190 C 320 156, 360 220, 390 186 L 390 260 L 0 260 Z"
        fill="var(--tide-wash)"
      />
    </svg>
  )
}
