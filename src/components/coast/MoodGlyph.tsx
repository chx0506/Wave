import type { CSSProperties } from 'react'

type MoodTone = 'calm' | 'low' | 'irritable' | 'happy' | 'sensitive'

const INK = '#3d5b73'
const INK_SOFT = '#6fa8d0'
const BLUSH = '#f9dab4'

/** Face features only — paper disc comes from CSS */
export function MoodGlyph({ tone }: { tone: MoodTone }) {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={INK}
        strokeWidth="2"
      >
        {tone === 'calm' && (
          <>
            <path d="M8 13 H12" strokeWidth="1.75" opacity="0.75" />
            <path d="M20 13 H24" strokeWidth="1.75" opacity="0.75" />
            <path d="M11 20 H21" strokeWidth="1.85" />
          </>
        )}

        {tone === 'low' && (
          <>
            <circle cx="10.5" cy="13.5" r="1.35" fill={INK} stroke="none" />
            <circle cx="21.5" cy="13.5" r="1.35" fill={INK} stroke="none" />
            <path d="M9 22 Q16 17 23 22" strokeWidth="2.1" />
          </>
        )}

        {tone === 'irritable' && (
          <>
            <path d="M7.5 10 L10.5 13" strokeWidth="2.2" />
            <path d="M24.5 10 L21.5 13" strokeWidth="2.2" />
            <circle cx="10.5" cy="15" r="1.15" fill={INK} stroke="none" />
            <circle cx="21.5" cy="15" r="1.15" fill={INK} stroke="none" />
            <path d="M10 22 H22" strokeWidth="2.2" />
          </>
        )}

        {tone === 'happy' && (
          <>
            <path d="M7.5 12.5 Q10 15.5 12.5 12.5" strokeWidth="2.15" />
            <path d="M19.5 12.5 Q22 15.5 24.5 12.5" strokeWidth="2.15" />
            <path d="M8.5 19 Q16 25.5 23.5 19" strokeWidth="2.15" />
            <circle cx="8" cy="18.5" r="1.4" fill={BLUSH} stroke="none" />
            <circle cx="24" cy="18.5" r="1.4" fill={BLUSH} stroke="none" />
          </>
        )}

        {tone === 'sensitive' && (
          <>
            <circle cx="10.5" cy="14" r="2.65" stroke={INK_SOFT} strokeWidth="1.6" />
            <circle cx="10.5" cy="14" r="0.95" fill={INK} stroke="none" />
            <circle cx="21.5" cy="14" r="2.65" stroke={INK_SOFT} strokeWidth="1.6" />
            <circle cx="21.5" cy="14" r="0.95" fill={INK} stroke="none" />
            <path d="M9.5 21 Q12 23.5 16 21 Q20 18.5 22.5 21" strokeWidth="1.85" />
            <path
              d="M23.5 16.5 Q24.5 18 23.8 19.2"
              stroke={INK_SOFT}
              strokeWidth="1.5"
              fill="none"
            />
          </>
        )}
      </g>
    </svg>
  )
}

export function moodDiscStyle(tone: MoodTone, selected: boolean): CSSProperties {
  const tints: Record<MoodTone, string> = {
    calm: '#f8fbfe',
    low: '#eef4f8',
    irritable: '#edf3f8',
    happy: '#fffaf3',
    sensitive: '#f5f8fc',
  }
  return {
    background: `radial-gradient(circle at 34% 28%, #ffffff 0%, ${tints[tone]} 52%, #ebe0cc 100%)`,
    transform: selected ? 'translateY(-2px)' : undefined,
  }
}
