import avatarSrc from '@/assets/me/avatar.png'
import iconCalendar from '@/assets/me/icon-calendar.png'
import iconPhase from '@/assets/me/icon-phase.png'
import iconTide from '@/assets/me/icon-tide.png'
import grainSrc from '@/assets/me/paper-grain.png'
import wavesSrc from '@/assets/me/waves-clear.png'
import { DataImportSheet } from '@/components/me/DataImportSheet'
import { SAMPLE_STREAK_DAYS } from '@/data/sample'
import {
  APP_NAME,
  PHASE_TIDE_LABEL,
  USER_DISPLAY_NAME,
} from '@/domain/copy'
import { clearImportIntent, hasImportIntent } from '@/lib/importLink'
import { useAppState } from '@/state/useAppState'
import { CaretRight, GearSix } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './MeScreen.module.css'

const ROWS = [
  { id: 'cycle', title: '周期设置', glyph: 'moon' },
  { id: 'remind', title: '提醒', glyph: 'bell' },
  { id: 'import', title: '数据导入', glyph: 'import' },
  { id: 'about', title: '关于 MoonWave', glyph: 'info' },
] as const

export function MeScreen({ onClose }: { onClose?: () => void }) {
  const {
    today,
    snapshotFor,
    importCycleData,
    importedFrom,
    closeStackScreen,
  } = useAppState()
  const snap = snapshotFor(today)
  const [importOpen, setImportOpen] = useState(false)
  const [importFromLink, setImportFromLink] = useState(false)

  useEffect(() => {
    if (!hasImportIntent()) return
    setImportFromLink(true)
    setImportOpen(true)
    clearImportIntent()
  }, [])

  const handleClose = onClose ?? closeStackScreen

  const handleRowClick = (id: (typeof ROWS)[number]['id']) => {
    if (id === 'import') {
      setImportFromLink(false)
      setImportOpen(true)
      return
    }
    if (id === 'about') {
      handleClose()
    }
  }

  return (
    <div
      className={styles.screen}
      style={{ ['--me-grain' as string]: `url(${grainSrc})` }}
    >
      <div className={styles.grain} aria-hidden="true" />
      <SoftBotany />

      <header className={styles.header}>
        <div className={styles.brandRow}>
          {handleClose ? (
            <button
              type="button"
              className={styles.backBtn}
              aria-label="返回"
              onClick={handleClose}
            >
              <CaretRight
                size={16}
                weight="bold"
                style={{ transform: 'rotate(180deg)' }}
              />
            </button>
          ) : null}
          <h1 className={styles.brand}>{APP_NAME}</h1>
          <span className={styles.seal} aria-hidden="true">
            潮记
          </span>
        </div>
        <button type="button" className={styles.iconBtn} aria-label="设置">
          <GearSix size={18} weight="regular" />
        </button>
      </header>

      <div className={styles.body}>
        <section className={styles.profile}>
          <div className={styles.profileText}>
            <h2 className={styles.name}>{USER_DISPLAY_NAME}的潮汐</h2>
            <p className={styles.tagline}>与自己温柔相处</p>
          </div>
          <div className={styles.avatarWrap}>
            <img className={styles.avatar} src={`${avatarSrc}?v=15`} alt="" />
          </div>
        </section>

        <div className={styles.stats}>
          <article className={styles.stat}>
            <p className={styles.statLabel}>连续记录</p>
            <img className={styles.statIcon} src={iconCalendar} alt="" />
            <p className={styles.statValue}>{SAMPLE_STREAK_DAYS}天</p>
          </article>
          <article className={styles.stat}>
            <p className={styles.statLabel}>本周期第</p>
            <img className={styles.statIcon} src={iconTide} alt="" />
            <p className={styles.statValue}>{snap.cycleDay}天</p>
          </article>
          <article className={styles.stat}>
            <p className={styles.statLabel}>{PHASE_TIDE_LABEL[snap.phase]}</p>
            <img className={styles.statIcon} src={iconPhase} alt="" />
            <p className={styles.statValue}>进行中</p>
          </article>
        </div>

        <div className={styles.list}>
          {ROWS.map(({ id, title, glyph }) => (
            <button
              key={id}
              type="button"
              className={styles.row}
              onClick={() => handleRowClick(id)}
            >
              <span className={styles.rowIcon} aria-hidden="true">
                <RowGlyph kind={glyph} />
              </span>
              <span className={styles.rowTitle}>{title}</span>
              <CaretRight size={14} weight="bold" className={styles.rowCaret} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.waveFoot} aria-hidden="true">
        <img className={styles.waveImg} src={wavesSrc} alt="" />
      </div>

      {importOpen
        ? shellPortal(
            <DataImportSheet
              importedFrom={importedFrom}
              requireConsent={importFromLink}
              onClose={() => {
                setImportOpen(false)
                setImportFromLink(false)
              }}
              onImport={importCycleData}
            />,
          )
        : null}
    </div>
  )
}

function shellPortal(node: React.ReactNode) {
  const host = document.querySelector('[data-phone-shell]')
  return host ? createPortal(node, host) : node
}

function RowGlyph({ kind }: { kind: (typeof ROWS)[number]['glyph'] }) {
  if (kind === 'moon') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <circle cx="12" cy="12" r="9" fill="#d7ebf7" />
        <path
          d="M14.2 6.2a7 7 0 1 0 3.6 11.6 6.2 6.2 0 0 1-3.6-11.6Z"
          fill="#7eb4dc"
        />
        <circle cx="12" cy="12" r="9" fill="none" stroke="#9fc8e8" strokeWidth="1.2" />
      </svg>
    )
  }
  if (kind === 'bell') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path
          d="M12 4c-3.2 0-5.5 2.4-5.5 5.4v2.2c0 1.1-.4 2.1-1.1 2.9l-.5.5c-.4.4-.2 1.1.4 1.1h13.4c.6 0 .8-.7.4-1.1l-.5-.5c-.7-.8-1.1-1.8-1.1-2.9V9.4C17.5 6.4 15.2 4 12 4Z"
          fill="#9fc8e8"
        />
        <path d="M10.2 18.2a1.8 1.8 0 0 0 3.6 0" fill="none" stroke="#6fa8d4" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="3.6" r="1.1" fill="#6fa8d4" />
      </svg>
    )
  }
  if (kind === 'import') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <rect x="6" y="3.5" width="12" height="15" rx="2" fill="#d7ebf7" stroke="#9fc8e8" strokeWidth="1.2" />
        <path d="M9 8h6M9 11h6M9 14h3.5" stroke="#7eb4dc" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M12 19.7V12.5" stroke="#6fa8d4" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.6 14.9 12 12.3l2.4 2.6" fill="none" stroke="#6fa8d4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <circle cx="12" cy="12" r="9" fill="#d7ebf7" stroke="#9fc8e8" strokeWidth="1.2" />
      <circle cx="12" cy="8.2" r="1.35" fill="#6fa8d4" />
      <rect x="10.9" y="10.4" width="2.2" height="6.4" rx="1.1" fill="#6fa8d4" />
    </svg>
  )
}

function SoftBotany() {
  return (
    <svg className={styles.botany} viewBox="0 0 390 780" aria-hidden="true">
      <g fill="none" stroke="var(--tide)" strokeWidth="1.15" opacity="0.2">
        <path d="M10 300 C36 278, 48 318, 72 296 C88 284, 78 340, 108 324" />
        <path d="M16 332 C42 318, 50 350, 78 334" />
        <circle cx="70" cy="296" r="2.6" fill="var(--tide-soft)" stroke="none" />
        <circle cx="94" cy="318" r="2" fill="var(--tide-soft)" stroke="none" />
      </g>
      <g fill="var(--tide-soft)" opacity="0.16">
        <path d="M0 620 C42 582, 72 640, 112 604 C92 662, 42 682, 0 700 Z" />
        <path d="M8 688 C48 658, 78 708, 118 678 C72 728, 32 748, 0 756 Z" />
      </g>
      <g fill="var(--tide)" opacity="0.1">
        <path d="M390 630 C348 592, 318 650, 276 612 C298 670, 348 690, 390 708 Z" />
        <path d="M390 700 C342 670, 312 720, 270 692 C312 740, 360 752, 390 760 Z" />
      </g>
    </svg>
  )
}
