import iconCalendar from '@/assets/me/icon-calendar.png'
import iconTide from '@/assets/me/icon-tide.png'
import grainSrc from '@/assets/me/paper-grain.png'
import wavesSrc from '@/assets/me/waves-clear.png'
import iconClue from '@/assets/stats/icon-clue.png'
import iconCycle from '@/assets/stats/icon-cycle.png'
import iconExperiment from '@/assets/stats/icon-experiment.png'
import iconInsight from '@/assets/stats/icon-insight.png'
import { DataImportSheet } from '@/components/me/DataImportSheet'
import { SAMPLE_STREAK_DAYS } from '@/data/sample'
import {
  PHASE_TIDE_LABEL,
  PHASE_TODAY_TIP,
  USER_DISPLAY_NAME,
} from '@/domain/copy'
import { daysUntilNextPeriod, daysUntilOvulation } from '@/domain/cycle'
import { diffDays, formatMonthDay } from '@/domain/dates'
import { buildExperimentConclusion } from '@/domain/experiment'
import { clearImportIntent, hasImportIntent } from '@/lib/importLink'
import { useAppState } from '@/state/useAppState'
import { CaretRight } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './StatsScreen.module.css'

function averageCycleLength(starts: Date[]): number | null {
  if (starts.length < 2) return null
  const sorted = [...starts].sort((a, b) => a.getTime() - b.getTime())
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i += 1) {
    gaps.push(diffDays(sorted[i], sorted[i - 1]))
  }
  return Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length)
}

function shellPortal(node: React.ReactNode) {
  const host = document.querySelector('[data-phone-shell]')
  return host ? createPortal(node, host) : node
}

export function StatsScreen() {
  const {
    today,
    snapshotFor,
    cycleConfig,
    periodStarts,
    experiments,
    clues,
    importCycleData,
    importedFrom,
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

  const avgCycle = useMemo(
    () => averageCycleLength(periodStarts),
    [periodStarts],
  )

  const activeExperiments = experiments.filter((item) => item.status === 'active')
  const completedExperiments = experiments.filter((item) => item.status === 'completed')
  const confirmedClues = clues.filter((item) => item.status === 'confirmed')
  const daysToPeriod = daysUntilNextPeriod(snap.cycleDay, cycleConfig)
  const daysToOvulation = daysUntilOvulation(snap.cycleDay, cycleConfig)

  const periodHistory = useMemo(() => {
    const starts =
      periodStarts.length > 0
        ? [...periodStarts].sort((a, b) => b.getTime() - a.getTime())
        : [cycleConfig.lastLowTide]
    return starts.slice(0, 6)
  }, [periodStarts, cycleConfig.lastLowTide])

  const insights = useMemo(() => {
    const lines: string[] = []
    lines.push(
      `当前处于${PHASE_TIDE_LABEL[snap.phase]}（周期第 ${snap.cycleDay} 天）。${PHASE_TODAY_TIP[snap.phase]}`,
    )

    if (daysToPeriod <= 5) {
      lines.push(`距离下次经期约 ${daysToPeriod} 天，经前阶段睡眠与情绪更容易波动，建议提前留意记录。`)
    }

    if (avgCycle && Math.abs(avgCycle - cycleConfig.cycleLength) >= 2) {
      lines.push(
        `根据历史记录，你的平均周期约 ${avgCycle} 天，与当前设置 ${cycleConfig.cycleLength} 天略有差异，可在数据导入后校准。`,
      )
    }

    if (activeExperiments.length > 0) {
      lines.push(
        `你有 ${activeExperiments.length} 个进行中的小实验，持续记录会帮助识别身体规律。`,
      )
    }

    if (confirmedClues.length > 0) {
      lines.push(
        `已确认 ${confirmedClues.length} 条身体线索，这些是你与身体对话的积累。`,
      )
    }

    return lines
  }, [
    snap.phase,
    snap.cycleDay,
    daysToPeriod,
    avgCycle,
    cycleConfig.cycleLength,
    activeExperiments.length,
    confirmedClues.length,
  ])

  return (
    <div
      className={styles.screen}
      style={{ ['--stats-grain' as string]: `url(${grainSrc})` }}
    >
      <div className={styles.grain} aria-hidden="true" />
      <SoftBotany />

      <header className={styles.header}>
        <div className={styles.brandRow}>
          <h1 className={styles.title}>统计</h1>
          <span className={styles.seal} aria-hidden="true">
            潮记
          </span>
        </div>
        <p className={styles.subtitle}>
          {USER_DISPLAY_NAME}的经期与身体记录，汇成一份温和洞察。
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.heroWave} aria-hidden="true" />

        <div className={styles.metricRow}>
          <article className={styles.metric}>
            <p className={styles.metricLabel}>连续记录</p>
            <img className={styles.metricIcon} src={iconCalendar} alt="" />
            <p className={styles.metricValue}>{SAMPLE_STREAK_DAYS}天</p>
          </article>
          <article className={styles.metric}>
            <p className={styles.metricLabel}>本周期</p>
            <img className={styles.metricIcon} src={iconTide} alt="" />
            <p className={styles.metricValue}>第{snap.cycleDay}天</p>
          </article>
          <article className={styles.metric}>
            <p className={styles.metricLabel}>身体线索</p>
            <img className={styles.metricIcon} src={iconClue} alt="" />
            <p className={styles.metricValue}>{confirmedClues.length}条</p>
          </article>
        </div>

        <section className={styles.panel} aria-labelledby="cycle-rhythm-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconCycle} alt="" />
            <h2 id="cycle-rhythm-title" className={styles.panelTitle}>
              周期节律
            </h2>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>当前阶段</dt>
              <dd>{PHASE_TIDE_LABEL[snap.phase]}</dd>
            </div>
            <div>
              <dt>周期长度</dt>
              <dd>
                {cycleConfig.cycleLength} 天
                {avgCycle ? ` · 均值 ${avgCycle}` : ''}
              </dd>
            </div>
            <div>
              <dt>距下次经期</dt>
              <dd>{daysToPeriod} 天</dd>
            </div>
            <div>
              <dt>距排卵窗口</dt>
              <dd>
                {daysToOvulation === 0 ? '已进入或已过' : `${daysToOvulation} 天`}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="insight-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconInsight} alt="" />
            <h2 id="insight-title" className={styles.panelTitle}>
              身体洞察
            </h2>
          </div>
          <ul className={styles.insightList}>
            {insights.map((line) => (
              <li key={line}>
                <span className={styles.insightMark} aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="period-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconCalendar} alt="" />
            <div className={styles.panelHeadText}>
              <h2 id="period-title" className={styles.panelTitle}>
                经期记录
              </h2>
              {importedFrom ? (
                <p className={styles.panelMeta}>来源：{importedFrom}</p>
              ) : null}
            </div>
          </div>
          <ul className={styles.periodList}>
            {periodHistory.map((date) => (
              <li key={date.toISOString()}>
                <span>{formatMonthDay(date)}</span>
                <span className={styles.periodTag}>经期开始</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="experiment-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconExperiment} alt="" />
            <div className={styles.panelHeadText}>
              <h2 id="experiment-title" className={styles.panelTitle}>
                小实验回顾
              </h2>
              <p className={styles.panelMeta}>
                进行中 {activeExperiments.length} · 已完成{' '}
                {completedExperiments.length}
              </p>
            </div>
          </div>
          <ul className={styles.experimentList}>
            {experiments.slice(0, 4).map((experiment) => {
              const conclusion =
                experiment.status === 'completed'
                  ? buildExperimentConclusion(experiment)
                  : null
              return (
                <li key={experiment.id}>
                  <p className={styles.itemTitle}>{experiment.question}</p>
                  <p className={styles.itemMeta}>
                    {experiment.status === 'active'
                      ? `进行中 · 已记录 ${experiment.observations.length}/${experiment.totalDays} 天`
                      : (conclusion?.title ?? '已完成')}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>

        {confirmedClues.length > 0 ? (
          <section className={styles.panel} aria-labelledby="clue-title">
            <div className={styles.panelHead}>
              <img className={styles.panelIcon} src={iconClue} alt="" />
              <h2 id="clue-title" className={styles.panelTitle}>
                已确认的身体线索
              </h2>
            </div>
            <ul className={styles.clueList}>
              {confirmedClues.map((clue) => (
                <li key={clue.id}>
                  <p className={styles.itemTitle}>{clue.title}</p>
                  <p className={styles.itemMeta}>{clue.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <button
          type="button"
          className={styles.importRow}
          onClick={() => {
            setImportFromLink(false)
            setImportOpen(true)
          }}
        >
          <span className={styles.importGlyph} aria-hidden="true">
            <ImportGlyph />
          </span>
          <span className={styles.importTitle}>数据导入</span>
          <CaretRight size={14} weight="bold" className={styles.importCaret} />
        </button>
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

function ImportGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <rect
        x="6"
        y="3.5"
        width="12"
        height="15"
        rx="2"
        fill="#d7ebf7"
        stroke="#9fc8e8"
        strokeWidth="1.2"
      />
      <path
        d="M9 8h6M9 11h6M9 14h3.5"
        stroke="#7eb4dc"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M12 19.7V12.5"
        stroke="#6fa8d4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.6 14.9 12 12.3l2.4 2.6"
        fill="none"
        stroke="#6fa8d4"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
