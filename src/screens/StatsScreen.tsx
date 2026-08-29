import iconChart from '@/assets/stats/icon-chart-paper.png'
import iconClue from '@/assets/stats/icon-clue-paper.png'
import iconInsight from '@/assets/stats/icon-insight-paper.png'
import iconPhase from '@/assets/stats/icon-phase-paper.png'
import iconStreak from '@/assets/stats/icon-streak-paper.png'
import grainSrc from '@/assets/me/paper-grain.png'
import {
  BodyCurveChart,
  CycleLengthBars,
  CycleProgressRing,
  ExperimentBars,
  FrequencyBars,
  type CurvePoint,
} from '@/components/stats/StatsCharts'
import { DataImportSheet } from '@/components/me/DataImportSheet'
import { MOCK_CYCLE_HISTORY } from '@/data/mockCycleHistory'
import {
  computeLogStreak,
  recentDailyLogs,
  summarizeDailyLog,
  symptomFrequencyFromLogs,
} from '@/domain/dailyLog'
import {
  APP_SEAL,
  PHASE_TIDE_LABEL,
  PHASE_TODAY_TIP,
  USER_DISPLAY_NAME,
} from '@/domain/copy'
import { daysUntilNextPeriod, daysUntilOvulation } from '@/domain/cycle'
import { diffDays, formatMonthDay } from '@/domain/dates'
import { getExperimentProgress } from '@/domain/experiment'
import { clearImportIntent, hasImportIntent } from '@/lib/importLink'
import { useAppState } from '@/state/useAppState'
import { CaretRight } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './StatsScreen.module.css'

const ENERGY_SCORE: Record<string, number> = {
  低: 0.28,
  一般: 0.55,
  较高: 0.86,
}

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

function buildEnergyCurve(): CurvePoint[] {
  const byDay = new Map<number, number[]>()
  for (const rec of MOCK_CYCLE_HISTORY.records) {
    const score = ENERGY_SCORE[rec.energy] ?? 0.5
    const list = byDay.get(rec.cycleDay) ?? []
    list.push(score)
    byDay.set(rec.cycleDay, list)
  }

  const points = [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, scores]) => ({
      day,
      value: scores.reduce((s, v) => s + v, 0) / scores.length,
    }))

  if (points.length >= 3) return points

  // Gentle synthetic fallback when history is sparse
  return [
    { day: 1, value: 0.22 },
    { day: 5, value: 0.35 },
    { day: 10, value: 0.62 },
    { day: 14, value: 0.88 },
    { day: 18, value: 0.72 },
    { day: 24, value: 0.48 },
    { day: 28, value: 0.3 },
  ]
}

function buildSymptomFreq() {
  const counts = new Map<string, number>()
  for (const rec of MOCK_CYCLE_HISTORY.records) {
    for (const s of rec.symptoms) {
      counts.set(s, (counts.get(s) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export function StatsScreen() {
  const {
    today,
    snapshotFor,
    cycleConfig,
    periodStarts,
    experiments,
    clues,
    dayLogs,
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

  const streakDays = useMemo(
    () => computeLogStreak(dayLogs, today),
    [dayLogs, today],
  )

  const recentLogs = useMemo(() => recentDailyLogs(dayLogs, 5), [dayLogs])

  const avgCycle = useMemo(
    () => averageCycleLength(periodStarts),
    [periodStarts],
  )

  const cycleBars = useMemo(() => {
    const starts =
      periodStarts.length >= 2
        ? [...periodStarts].sort((a, b) => a.getTime() - b.getTime())
        : null
    if (!starts) return []
    const bars = []
    for (let i = 1; i < starts.length; i += 1) {
      bars.push({
        label: `${starts[i].getMonth() + 1}/${starts[i].getDate()}`,
        days: diffDays(starts[i], starts[i - 1]),
      })
    }
    return bars.slice(-5)
  }, [periodStarts])

  const energyCurve = useMemo(() => buildEnergyCurve(), [])
  const symptomFreq = useMemo(() => {
    const fromLogs = symptomFrequencyFromLogs(dayLogs, 5)
    return fromLogs.length > 0 ? fromLogs : buildSymptomFreq()
  }, [dayLogs])

  const activeExperiments = experiments.filter((item) => item.status === 'active')
  const completedExperiments = experiments.filter(
    (item) => item.status === 'completed',
  )
  const confirmedClues = clues.filter((item) => item.status === 'confirmed')
  const daysToPeriod = daysUntilNextPeriod(snap.cycleDay, cycleConfig)
  const daysToOvulation = daysUntilOvulation(snap.cycleDay, cycleConfig)

  const periodHistory = useMemo(() => {
    const starts =
      periodStarts.length > 0
        ? [...periodStarts].sort((a, b) => b.getTime() - a.getTime())
        : [cycleConfig.lastLowTide]
    return starts.slice(0, 5)
  }, [periodStarts, cycleConfig.lastLowTide])

  const experimentItems = useMemo(
    () =>
      experiments.slice(0, 4).map((experiment) => {
        const { currentDay } = getExperimentProgress(experiment)
        const progress =
          experiment.status === 'completed'
            ? 1
            : currentDay / Math.max(1, experiment.totalDays)
        return {
          id: experiment.id,
          title: experiment.question,
          progress,
          meta:
            experiment.status === 'active'
              ? `进行中 · ${experiment.observations.length}/${experiment.totalDays} 天`
              : '已完成',
        }
      }),
    [experiments],
  )

  const insights = useMemo(() => {
    const lines: string[] = []
    lines.push(
      `当前处于${PHASE_TIDE_LABEL[snap.phase]}（周期第 ${snap.cycleDay} 天）。${PHASE_TODAY_TIP[snap.phase]}`,
    )

    if (avgCycle && Math.abs(avgCycle - cycleConfig.cycleLength) >= 2) {
      lines.push(
        `历史均值约 ${avgCycle} 天，与当前设置 ${cycleConfig.cycleLength} 天略有差异，可在导入后校准。`,
      )
    }

    if (symptomFreq[0]) {
      lines.push(
        `近期最常出现的身体信号是「${symptomFreq[0].label}」，可对照周期阶段持续观察。`,
      )
    }

    if (activeExperiments.length > 0) {
      lines.push(
        `有 ${activeExperiments.length} 个小实验进行中，曲线会随记录逐渐清晰。`,
      )
    }

    return lines.slice(0, 3)
  }, [
    snap.phase,
    snap.cycleDay,
    avgCycle,
    cycleConfig.cycleLength,
    symptomFreq,
    activeExperiments.length,
  ])

  return (
    <div
      className={styles.screen}
      style={{ ['--stats-grain' as string]: `url(${grainSrc})` }}
    >
      <div className={styles.grain} aria-hidden="true" />
      <RingBotany />

      <header className={styles.header}>
        <div className={styles.brandRow}>
          <h1 className={styles.title}>统计</h1>
          <span className={styles.seal} aria-hidden="true">
            {APP_SEAL}
          </span>
        </div>
        <p className={styles.subtitle}>
          {USER_DISPLAY_NAME}的经期与身体记录，汇成一份温和洞察。
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.heroRings} aria-hidden="true" />

        <div className={styles.metricRow}>
          <article className={styles.metric}>
            <p className={styles.metricLabel}>连续记录</p>
            <img className={styles.metricIcon} src={iconStreak} alt="" />
            <p className={styles.metricValue}>{streakDays}天</p>
          </article>
          <article className={styles.metric}>
            <p className={styles.metricLabel}>本周期</p>
            <img className={styles.metricIcon} src={iconPhase} alt="" />
            <p className={styles.metricValue}>第{snap.cycleDay}天</p>
          </article>
          <article className={styles.metric}>
            <p className={styles.metricLabel}>身体线索</p>
            <img className={styles.metricIcon} src={iconClue} alt="" />
            <p className={styles.metricValue}>{confirmedClues.length}条</p>
          </article>
        </div>

        <section className={styles.panel} aria-labelledby="daily-log-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconStreak} alt="" />
            <div className={styles.panelHeadText}>
              <h2 id="daily-log-title" className={styles.panelTitle}>
                近日记录
              </h2>
              <p className={styles.panelMeta}>
                {recentLogs.length > 0
                  ? `已存入潮汐 ${Object.keys(dayLogs).length} 天`
                  : '记录今日状态后会出现在这里'}
              </p>
            </div>
          </div>
          {recentLogs.length > 0 ? (
            <ul className={styles.logTimeline}>
              {recentLogs.map((log) => (
                <li key={log.dateKey}>
                  <span className={styles.timelineDot} aria-hidden="true" />
                  <div className={styles.timelineBody}>
                    <span className={styles.timelineDate}>
                      {log.dateKey.slice(5).replace('-', '/')}
                    </span>
                    <span className={styles.logSummary}>
                      {summarizeDailyLog(log)}
                    </span>
                    <span className={styles.loggedTag}>已记录</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyLog}>还没有日记录，去首页「记录今日状态」写一笔吧。</p>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="cycle-rhythm-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconPhase} alt="" />
            <h2 id="cycle-rhythm-title" className={styles.panelTitle}>
              周期节律
            </h2>
          </div>
          <div className={styles.rhythmLayout}>
            <CycleProgressRing
              cycleDay={snap.cycleDay}
              cycleLength={cycleConfig.cycleLength}
              phase={snap.phase}
            />
            <dl className={styles.factsStack}>
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
                  {daysToOvulation === 0
                    ? '已进入或已过'
                    : `${daysToOvulation} 天`}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="cycle-bars-title">
          <div className={styles.panelHead}>
            <div className={styles.panelHeadText}>
              <h2 id="cycle-bars-title" className={styles.panelTitle}>
                周期长度
              </h2>
              <p className={styles.panelMeta}>
                近几次经期间隔
                {avgCycle != null ? ` · 均值 ${avgCycle} 天` : ''}
              </p>
            </div>
          </div>
          <CycleLengthBars bars={cycleBars} average={avgCycle} />
        </section>

        <section className={styles.panel} aria-labelledby="energy-curve-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconInsight} alt="" />
            <div className={styles.panelHeadText}>
              <h2 id="energy-curve-title" className={styles.panelTitle}>
                精力曲线
              </h2>
              <p className={styles.panelMeta}>按周期日汇总</p>
            </div>
          </div>
          <BodyCurveChart points={energyCurve} unitLabel="精力" />
        </section>

        <section className={styles.panel} aria-labelledby="symptom-freq-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconClue} alt="" />
            <div className={styles.panelHeadText}>
              <h2 id="symptom-freq-title" className={styles.panelTitle}>
                身体信号频次
              </h2>
              <p className={styles.panelMeta}>近期记录 Top 5</p>
            </div>
          </div>
          <FrequencyBars items={symptomFreq} />
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
            <img className={styles.panelIcon} src={iconStreak} alt="" />
            <div className={styles.panelHeadText}>
              <h2 id="period-title" className={styles.panelTitle}>
                经期记录
              </h2>
              {importedFrom ? (
                <p className={styles.panelMeta}>来源：{importedFrom}</p>
              ) : null}
            </div>
          </div>
          <ul className={styles.periodTimeline}>
            {periodHistory.map((date, index) => (
              <li key={date.toISOString()}>
                <span className={styles.timelineDot} aria-hidden="true" />
                {index < periodHistory.length - 1 ? (
                  <span className={styles.timelineStem} aria-hidden="true" />
                ) : null}
                <div className={styles.timelineBody}>
                  <span className={styles.timelineDate}>
                    {formatMonthDay(date)}
                  </span>
                  <span className={styles.periodTag}>经期开始</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="experiment-title">
          <div className={styles.panelHead}>
            <img className={styles.panelIcon} src={iconChart} alt="" />
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
          <ExperimentBars items={experimentItems} />
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

/** Concentric ring botanicals — distinct from Observe wave motifs. */
function RingBotany() {
  return (
    <svg className={styles.botany} viewBox="0 0 390 780" aria-hidden="true">
      <g fill="none" stroke="var(--tide)" strokeWidth="1.1" opacity="0.18">
        <circle cx="48" cy="220" r="28" />
        <circle cx="48" cy="220" r="18" />
        <circle cx="48" cy="220" r="8" />
        <circle cx="342" cy="520" r="36" />
        <circle cx="342" cy="520" r="24" />
        <circle cx="342" cy="520" r="12" />
      </g>
      <g fill="var(--tide-soft)" opacity="0.14">
        <path d="M0 640 C36 610, 62 668, 98 638 C78 690, 36 708, 0 720 Z" />
        <path d="M390 660 C350 630, 318 688, 278 654 C302 710, 348 728, 390 740 Z" />
      </g>
    </svg>
  )
}
