import { EXPERIMENT_CATEGORIES, EXPERIMENT_PRESETS } from '@/data/content'
import { Tabs, type Experiment, type ExperimentCategory } from '@/domain/types'
import {
  buildExperimentConclusion,
  getExperimentProgress,
} from '@/domain/experiment'
import { useAppState } from '@/state/useAppState'
import {
  ArrowRight,
  CalendarBlank,
  CaretDown,
  CheckCircle,
  Flask,
  Eye,
  Hourglass,
  Info,
  MagnifyingGlass,
  Path,
  Seal,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import { useMemo, useState, type ReactNode } from 'react'
import shell from './shared/pageShell.module.css'
import styles from './ObserveScreen.module.css'

const STEPS = [
  { key: '问', label: '提出问题' },
  { key: '试', label: '尝试改变' },
  { key: '看', label: '持续观察' },
  { key: '比', label: '对比反馈' },
]

export function ObserveScreen() {
  const {
    setTab,
    experiments,
    clues,
    createExperiment,
    recordObservation,
    archiveExperimentClue,
    confirmClue,
  } = useAppState()
  const activeExperiments = experiments.filter((item) => item.status === 'active')
  const [sheet, setSheet] = useState<'create' | null>(null)
  const [recordingExperimentId, setRecordingExperimentId] = useState<
    string | null
  >(null)
  const [pathOpen, setPathOpen] = useState(false)
  const [expandedClue, setExpandedClue] = useState<string | null>(null)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(
    null,
  )
  const [completedExperimentId, setCompletedExperimentId] = useState<
    string | null
  >(null)
  const recordingExperiment = experiments.find(
    (item) => item.id === recordingExperimentId,
  )
  const completedExperiment = experiments.find(
    (item) => item.id === completedExperimentId,
  )

  return (
    <div className={shell.screen}>
      <div className={shell.glow} aria-hidden="true" />
      <header className={shell.header}>
        <p className={shell.kicker}>Observe</p>
        <h1 className={shell.title}>潮池观察</h1>
        <p className={shell.subtitle}>
          从一个真实困扰开始，做一次小改变，听听身体的反馈。
        </p>
      </header>

      <div className={styles.paperWaveBand} aria-hidden="true">
        {/* <span className={styles.waveFoamLine} /> */}
      </div>

      <div className={`${shell.body} ${styles.observeBody}`}>
        <section
          className={styles.activeGroup}
          aria-labelledby="active-group-title"
        >
          <div className={styles.groupHeading}>
            <div>
              <p className={styles.groupKicker}>In progress</p>
              <h2 id="active-group-title" className={styles.groupTitle}>
                正在进行的实验
              </h2>
            </div>
            <button
              type="button"
              className={styles.pathBadge}
              onClick={() => setPathOpen(true)}
              aria-haspopup="dialog"
              aria-label="查看身体小实验路径"
            >
              <Path size={13} weight="bold" />
              <span>实验路径</span>
              <span className={styles.pathBadgeStep}>
                {activeExperiments.length > 0 ? '3/4' : '1/4'}
              </span>
            </button>
          </div>
          {activeExperiments.length > 0 ? (
            <div className={styles.activeList}>
              {activeExperiments.map((experiment) => (
                <div key={experiment.id} className={styles.activeItem}>
                  <ActiveExperiment
                    experiment={experiment}
                    onRecord={() => setRecordingExperimentId(experiment.id)}
                    feedbackExpanded={expandedFeedbackId === experiment.id}
                    onToggleFeedback={() =>
                      setExpandedFeedbackId((current) =>
                        current === experiment.id ? null : experiment.id,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyExperiment />
          )}
          <button
            type="button"
            className={`${shell.cta} ${styles.paperPrimary}`}
            onClick={() => setSheet('create')}
          >
            <span>开始新的身体小实验</span>
            <Path size={18} weight="bold" />
          </button>
        </section>

        <section
          className={styles.archiveGroup}
          aria-labelledby="archive-group-title"
        >
          <div className={styles.groupHeading}>
            <div>
              <p className={styles.groupKicker}>Personal archive</p>
              <h2 id="archive-group-title" className={styles.groupTitle}>
                身体线索档案
              </h2>
            </div>
            <span className={styles.groupCount}>{clues.length} 条</span>
          </div>
      <p className={styles.groupDescription}>
            完成实验后留下的个人线索。
          </p>
          <div className={styles.clueList}>
            {clues.map((clue) => (
              <article
                key={clue.id}
                className={`${shell.card} ${styles.clueCard}`}
                data-expanded={expandedClue === clue.id}
              >
                <button
                  type="button"
                  className={styles.clueButton}
                  aria-expanded={expandedClue === clue.id}
                  onClick={() =>
                    setExpandedClue((current) =>
                      current === clue.id ? null : clue.id,
                    )
                  }
                >
                  <div className={styles.clueRow}>
                    <span className={styles.clueIcon}>
                      <MagnifyingGlass size={16} weight="bold" />
                    </span>
                    <div className={styles.clueSummary}>
                      <h3 className={shell.cardTitle}>{clue.title}</h3>
                      <span className={styles.clueQuickMeta}>
                        <CalendarBlank size={12} weight="bold" />
                        {clue.observationDays} 天
                      </span>
                    </div>
                    <div className={styles.clueAside}>
                      <span
                        className={styles.clueState}
                        data-state={clue.status}
                        role="img"
                        aria-label={
                          clue.status === 'observing'
                            ? '观察中'
                            : clue.status === 'pending'
                              ? '待确认'
                              : '已确认'
                        }
                      >
                        {clue.status === 'observing' ? (
                          <Eye size={14} weight="bold" />
                        ) : clue.status === 'pending' ? (
                          <Hourglass size={14} weight="bold" />
                        ) : (
                          <CheckCircle size={14} weight="fill" />
                        )}
                      </span>
                      <CaretDown
                        size={14}
                        className={styles.chevron}
                        weight="bold"
                      />
                    </div>
                  </div>
                </button>
                {expandedClue === clue.id ? (
                  <div className={styles.clueDetail}>
                    <p className={styles.clueNote}>{clue.note}</p>
                    <div className={styles.clueContext}>
                      <span>
                        <Flask size={12} weight="fill" />
                        {clue.sourceExperimentTitle}
                      </span>
                      <span>
                        <CalendarBlank size={12} weight="bold" />
                        {clue.observationDays} 天
                      </span>
                      <span>
                        <Seal size={12} weight="fill" /> {clue.shells} 贝壳
                      </span>
                    </div>
                    <p className={styles.clueDisclaimer}>
                      <Info size={12} weight="bold" />
                      个人观察，不代表医学诊断
                    </p>
                  </div>
                ) : null}
                {clue.status === 'pending' ? (
                  <button
                    type="button"
                    className={styles.confirm}
                    onClick={() => confirmClue(clue.id)}
                  >
                    收进我的身体档案
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <button
          type="button"
          className={styles.linkCal}
          onClick={() => setTab(Tabs.home)}
        >
          回到潮汐日志查看今日状态
        </button>
      </div>

      {sheet === 'create' ? (
        <CreateExperimentSheet
          onClose={() => setSheet(null)}
          onCreate={(input) => {
            createExperiment(input)
            setSheet(null)
          }}
        />
      ) : null}
      {recordingExperiment ? (
        <RecordObservationSheet
          experiment={recordingExperiment}
          onClose={() => setRecordingExperimentId(null)}
          onSave={(result, note) => {
            const completesExperiment =
              getExperimentProgress(recordingExperiment).currentDay + 1 >=
              recordingExperiment.totalDays
            recordObservation(
              recordingExperiment.id,
              result.values,
              result.completedTry,
              note,
            )
            setRecordingExperimentId(null)
            if (completesExperiment) {
              setCompletedExperimentId(recordingExperiment.id)
            }
          }}
        />
      ) : null}
      {pathOpen ? (
        <ExperimentPathSheet
          active={activeExperiments.length > 0}
          onClose={() => setPathOpen(false)}
        />
      ) : null}
      {completedExperiment ? (
        <ExperimentCompleteSheet
          experiment={completedExperiment}
          onClose={() => setCompletedExperimentId(null)}
          onArchive={() => {
            archiveExperimentClue(completedExperiment.id)
            setCompletedExperimentId(null)
          }}
        />
      ) : null}
    </div>
  )
}

function ExperimentCompleteSheet({
  experiment,
  onClose,
  onArchive,
}: {
  experiment: Experiment
  onClose: () => void
  onArchive: () => void
}) {
  const conclusion = buildExperimentConclusion(experiment)

  return (
    <Sheet title="这次实验完成了" onClose={onClose}>
      <div className={styles.completionBadge}>
        <Seal size={18} weight="fill" />
        <span>{conclusion.observationDays} 天观察完成</span>
      </div>
      <div className={styles.conclusionCard}>
        <p className={styles.groupKicker}>本次实验结论</p>
        <h3>{conclusion.title}</h3>
        <p>{conclusion.summary}</p>
        <div className={styles.metricConclusionList}>
          {conclusion.metrics.map((metric) => (
            <div
              key={metric.metric}
              className={styles.metricConclusion}
              data-trend={metric.trend}
            >
              <span className={styles.metricName}>{metric.metric}</span>
              <strong>{metric.result}</strong>
              <span>{metric.detail}</span>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.completionHint}>
        以上结论来自本次 {conclusion.observationDays} 天记录中的关联，不代表因果关系或医学诊断。你可以确认后将它收入身体线索档案。
      </p>
      <button type="button" className={shell.cta} onClick={onArchive}>
        <span>确认并收入身体线索档案</span>
        <ArrowRight size={16} weight="bold" />
      </button>
      <button type="button" className={styles.deferArchive} onClick={onClose}>
        暂不归档
      </button>
    </Sheet>
  )
}

function ActiveExperiment({
  experiment,
  onRecord,
  feedbackExpanded,
  onToggleFeedback,
}: {
  experiment: Experiment
  onRecord: () => void
  feedbackExpanded: boolean
  onToggleFeedback: () => void
}) {
  const progress = getExperimentProgress(experiment)

  return (
    <section className={`${shell.card} ${styles.active}`}>
      <div className={styles.activeTop}>
        <span className={shell.pill}>
          <Flask size={12} weight="fill" />
          进行中
        </span>
        <span className={styles.days}>
          Day {progress.currentDay}/{experiment.totalDays}
        </span>
      </div>
      <div className={styles.questionBlock}>
        <span className={styles.questionLabel}>想验证</span>
        <h2 className={styles.questionTitle}>{experiment.question}</h2>
      </div>
      <div className={styles.tryBlock}>
        <div className={styles.tryLabel}>
          <Sparkle size={13} weight="fill" />
          <span>今天这样做</span>
        </div>
        <strong className={styles.tryValue}>{experiment.try}</strong>
        <button type="button" className={styles.actionRecord} onClick={onRecord}>
          <span>记录今天</span>
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
      <div className={styles.watchRow} aria-label="观察这些变量">
        <span className={styles.watchLabel}>
          <Eye size={13} weight="bold" />
          看看
        </span>
        {experiment.watch.map((item) => (
          <span key={item} className={styles.watchChip}>
            {item}
          </span>
        ))}
      </div>
      <div className={styles.track} aria-hidden="true">
        <span
          className={styles.fill}
          style={{
            width: `${(progress.currentDay / experiment.totalDays) * 100}%`,
          }}
        />
      </div>
      <button
        type="button"
        className={styles.feedbackTrigger}
        aria-expanded={feedbackExpanded}
        onClick={onToggleFeedback}
      >
        <span>往期记录 · {experiment.observations.length} 条</span>
        <CaretDown
          size={13}
          weight="bold"
          className={feedbackExpanded ? styles.feedbackChevronOpen : undefined}
        />
      </button>
      {feedbackExpanded ? <RecentFeedback experiment={experiment} /> : null}
    </section>
  )
}

function EmptyExperiment() {
  return (
    <section className={`${shell.card} ${styles.active}`}>
      <h2 className={shell.cardTitle}>还没有进行中的身体实验</h2>
      <p className={shell.cardMeta}>
        从一个真实困扰开始，给自己 7–21 天的温柔观察。
      </p>
    </section>
  )
}

function RecentFeedback({ experiment }: { experiment: Experiment }) {
  const records = experiment.observations
  const progress = getExperimentProgress(experiment)
  const latest = records.at(-1)

  return (
    <div className={styles.feedbackBubble} aria-label="往期观察记录">
      <div className={styles.feedbackTop}>
        <div>
          <p className={styles.groupKicker}>Recent signal</p>
          <h3 className={`${shell.cardTitle} ${styles.feedbackTitle}`}>观察记录</h3>
        </div>
        <span className={styles.feedbackCount}>{records.length} 条记录</span>
      </div>
      {latest ? (
        <p className={styles.feedbackCopy}>
          最近：
          {Object.entries(latest.values)
            .map(([key, value]) => `${key} ${value}`)
            .join(' · ')}
        </p>
      ) : (
        <p className={styles.feedbackCopy}>
          完成第一条记录后，这里会出现你的身体反馈。
        </p>
      )}
      <div className={styles.feedbackMeta}>
        <span>完成尝试 {progress.completedTryDays}/{experiment.totalDays} 天</span>
        <span>还剩 {progress.remainingDays} 天</span>
      </div>
      {records.length > 0 ? (
        <div className={styles.recordList}>
          {records
            .slice()
            .reverse()
            .map((record) => (
              <div key={`${record.day}-${record.date.toISOString()}`} className={styles.recordRow}>
                <span>Day {record.day}</span>
                <span>
                  {Object.entries(record.values)
                    .map(([key, value]) => `${key} ${value}`)
                    .join(' · ')}
                </span>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  )
}

function ExperimentPathSheet({
  active,
  onClose,
}: {
  active: boolean
  onClose: () => void
}) {
  return (
    <Sheet title="身体小实验路径" onClose={onClose}>
      <p className={shell.cardMeta}>身体的答案，慢慢浮上来</p>
      <p className={styles.pathIntro}>
        不急着下结论，只改变一件小事，再和过去的自己轻轻比较。
      </p>
      <div className={styles.pathSteps}>
        <svg
          className={styles.pathLine}
          viewBox="0 0 300 58"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M18 35 C58 2 96 53 140 28 S225 8 282 31" />
        </svg>
        {STEPS.map((step, index) => (
          <div
            key={step.key}
            className={styles.pathStep}
            data-state={
              index < (active ? 2 : 0)
                ? 'done'
                : index === (active ? 2 : 0)
                  ? 'current'
                  : 'upcoming'
            }
          >
            <span className={styles.pathDot}>{step.key}</span>
            <span className={styles.pathLabel}>{step.label}</span>
          </div>
        ))}
      </div>
    </Sheet>
  )
}

function CreateExperimentSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (input: {
    category: ExperimentCategory
    question: string
    try: string
    watch: readonly string[]
    totalDays: number
  }) => void
}) {
  const [category, setCategory] = useState<ExperimentCategory>('sleep')
  const [length, setLength] = useState(14)
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    EXPERIMENT_PRESETS[0].question,
  )
  const available = useMemo(
    () => EXPERIMENT_PRESETS.filter((item) => item.category === category),
    [category],
  )
  const selected =
    available.find((item) => item.question === selectedQuestion) ??
    available[0] ??
    EXPERIMENT_PRESETS[0]

  const chooseCategory = (next: ExperimentCategory) => {
    setCategory(next)
    setSelectedQuestion(
      EXPERIMENT_PRESETS.find((item) => item.category === next)?.question ??
        EXPERIMENT_PRESETS[0].question,
    )
  }

  return (
    <Sheet title="开始新的身体小实验" onClose={onClose}>
      <p className={shell.cardMeta}>
        一次只改变一个变量，给身体一点时间回应。
      </p>
      <p className={shell.sectionLabel}>关注方向</p>
      <div className={styles.choiceGrid}>
        {EXPERIMENT_CATEGORIES.map((item) => (
          <button
            type="button"
            key={item.id}
            data-on={category === item.id}
            onClick={() => chooseCategory(item.id as ExperimentCategory)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className={shell.sectionLabel}>选择一个问题</p>
      <div className={styles.selectWrap}>
        <select
          className={styles.questionSelect}
          value={selected.question}
          onChange={(event) => setSelectedQuestion(event.target.value)}
          aria-label="选择实验问题"
        >
          {available.map((item) => (
            <option key={item.question} value={item.question}>
              {item.question}
            </option>
          ))}
        </select>
        <CaretDown size={15} weight="bold" aria-hidden="true" />
      </div>
      <p className={shell.sectionLabel}>观察周期</p>
      <div className={styles.choiceGrid}>
        {[7, 14, 21].map((days) => (
          <button
            type="button"
            key={days}
            data-on={length === days}
            onClick={() => setLength(days)}
          >
            {days} 天
          </button>
        ))}
      </div>
      <button
        type="button"
        className={shell.cta}
        onClick={() => onCreate({ ...selected, totalDays: length })}
      >
        创建实验
      </button>
    </Sheet>
  )
}

function RecordObservationSheet({
  experiment,
  onClose,
  onSave,
}: {
  experiment: Experiment
  onClose: () => void
  onSave: (
    result: { completedTry: boolean; values: Record<string, string> },
    note?: string,
  ) => void
}) {
  const progress = getExperimentProgress(experiment)
  const [completedTry, setCompletedTry] = useState(true)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(experiment.watch.map((item) => [item, '一般'])),
  )
  const [note, setNote] = useState('')

  return (
    <Sheet title="记录今日观察" onClose={onClose}>
      <p className={shell.cardMeta}>
        Day {progress.currentDay + 1} · 今天的状态不需要完美，只要诚实。
      </p>
      <p className={shell.sectionLabel}>今天完成尝试了吗？</p>
      <div className={styles.choiceGrid}>
        <button
          type="button"
          data-on={completedTry}
          onClick={() => setCompletedTry(true)}
        >
          已完成
        </button>
        <button
          type="button"
          data-on={!completedTry}
          onClick={() => setCompletedTry(false)}
        >
          还没有
        </button>
      </div>
      {experiment.watch.map((item) => (
        <div key={item} className={styles.metricBlock}>
          <p className={shell.sectionLabel}>{item}</p>
          <div className={styles.choiceGrid}>
            {['较低', '一般', '较高'].map((level) => (
              <button
                type="button"
                key={level}
                data-on={values[item] === level}
                onClick={() =>
                  setValues((current) => ({ ...current, [item]: level }))
                }
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className={shell.sectionLabel}>一句话备注（可选）</p>
      <textarea
        className={styles.note}
        value={note}
        maxLength={200}
        onChange={(event) => setNote(event.target.value)}
        placeholder="今天身体有什么变化？"
      />
      <button
        type="button"
        className={shell.cta}
        onClick={() => onSave({ completedTry, values }, note || undefined)}
      >
        存入今日观察
      </button>
    </Sheet>
  )
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <span className={styles.sheetHandle} aria-hidden="true" />
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={17} />
        </button>
        <h2 className={styles.sheetTitle}>{title}</h2>
        {children}
      </div>
    </div>
  )
}
