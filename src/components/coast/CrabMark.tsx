type Props = {
  className?: string
}

const SHADOW = 'var(--paper-wave-mid)'
const BODY = 'var(--foam)'
const STROKE = 'var(--tide)'
const DEEP = 'var(--tide-deep)'
const ACCENT = 'var(--seal)'

function CrabPlate({
  fill,
  stroke,
}: {
  fill: string
  stroke?: string
}) {
  const edge = stroke ? 0.5 : 0

  return (
    <>
      <path
        d="M4.5 15.2c0-4.8 6.2-8.4 15.2-8.2 7.6.2 14.8 3.4 16 7.6.8 2.8-1 5.2-5.8 6.2-4.2.8-11.8 1-17.2.2-4.2-.7-7.5-3-8.2-5.8z"
        fill={fill}
        stroke={stroke}
        strokeWidth={edge}
      />
      <path
        d="M31.5 10.6c3.6-2.6 8.8-3.2 11.4-.8 1.6 1.5 1.1 3.6-1.6 4.5-2.1.7-4.6-.2-6-1.9-.9-1.1-2.2-1.8-3.8-1.8z"
        fill={fill}
        stroke={stroke}
        strokeWidth={edge}
      />
      <path
        d="M39.8 8.4c2.4-.4 4.6.8 4.8 2.6.15 1.3-.9 2.2-2.6 2-1.4-.15-2.6-1.1-2.2-2.4"
        fill={fill}
        stroke={stroke}
        strokeWidth={edge}
      />
      <path
        d="M9.2 14.8c-2.8-1.4-4.4-3.6-3.5-5.4.7-1.3 2.2-1 3.5 1.6"
        fill={fill}
        stroke={stroke}
        strokeWidth={edge}
      />
      <ellipse cx="13.2" cy="18.4" rx="1" ry="3.1" fill={fill} transform="rotate(-14 13.2 18.4)" />
      <ellipse cx="19.2" cy="18.8" rx="0.92" ry="3.2" fill={fill} transform="rotate(-4 19.2 18.8)" />
      <ellipse cx="25" cy="18.5" rx="0.88" ry="3" fill={fill} transform="rotate(8 25 18.5)" />
    </>
  )
}

/** MoonWave paper-relief crab — side view, faces right. Hand-tuned SVG, no raster. */
export function CrabMark({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 52 22" aria-hidden="true">
      <g transform="translate(1.15 1.25)">
        <CrabPlate fill={SHADOW} />
      </g>
      <CrabPlate fill={BODY} stroke={STROKE} />
      <path
        d="M12.5 11.4c4.8-1.1 9.6-.8 14.2.8"
        stroke={DEEP}
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.28"
      />
      <path
        d="M42.2 9.8c1.1.25 1.8.95 1.6 2"
        stroke={ACCENT}
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.62"
      />
    </svg>
  )
}
