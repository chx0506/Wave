import { EXPERIMENT_CATEGORIES, EXPERIMENT_PRESETS } from '@/data/content'
import { Tabs, type Experiment, type ExperimentCategory } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import {
  ArrowRight,
  CaretDown,
  Flask,
  MagnifyingGlass,
  Path,
  Seal,
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
    confirmClue,
  } = useAppState()
  const active = experiments.find((item) => item.status === 'active')
  const [sheet, setSheet] = useState<'create' | 'record' | null>(null)
  const [pathOpen, setPathOpen] = useState(false)
  const [expandedClue, setExpandedClue] = useState<string | null>(null)
  return (
    <div className={shell.screen}>
      <div className={shell.glow} aria-hidden="true" />
      <header className={shell.header}>
        <p className={shell.kicker}>Observe</p>
        <h1 className={shell.title}>潮池观察</h1>
        <p className={shell.subtitle}>
          如果一个问题反复出现，就陪自己认真看看。发现什么可能更适合我。
        </p>
      </header>
      <div className={shell.body}>
        <section className={styles.activeGroup} aria-labelledby="active-group-title">
          <div className={styles.groupHeading}>
            <div>
              <p className={styles.groupKicker}>In progress</p>
              <h2 id="active-group-title" className={styles.groupTitle}>正在进行的实验</h2>
            </div>
            <button type="button" className={styles.pathBadge} onClick={() => setPathOpen(true)} aria-haspopup="dialog" aria-label="查看身体小实验路径">
              <Path size={13} weight="bold" />
              <span>实验路径</span>
              <span className={styles.pathBadgeStep}>{active ? '3/4' : '1/4'}</span>
            </button>
          </div>
          {active ? (
            <ActiveExperiment experiment={active} onRecord={() => setSheet('record')} />
          ) : <EmptyExperiment />}
          {active ? <RecentFeedback experiment={active} /> : null}
        </section>

        <section className={styles.archiveGroup} aria-labelledby="archive-group-title">
          <div className={styles.groupHeading}>
            <div>
              <p className={styles.groupKicker}>Personal archive</p>
              <h2 id="archive-group-title" className={styles.groupTitle}>身体线索档案</h2>
            </div>
            <span className={styles.groupCount}>{clues.length} 条</span>
          </div>
          <p className={styles.groupDescription}>往期实验留下的个人观察，不是诊断结论，而是逐渐形成的身体经验。</p>
          <div className={styles.clueList}>{clues.map((clue) => (
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
                <MagnifyingGlass size={18} weight="fill" color="var(--tide-deep)" />
                <div>
                  <h3 className={shell.cardTitle}>{clue.title}</h3>
                  <p className={shell.cardMeta}>
                    {clue.sourceExperimentTitle} · {clue.observationDays} 天观察
                  </p>
                </div>
                <div className={styles.clueAside}>
                  <span className={styles.clueState} data-state={clue.status}>
                    {clue.status === 'observing'
                      ? '观察中'
                      : clue.status === 'pending'
                        ? '待确认'
                        : '已确认'}
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
                <p>{clue.note}。这只是你的个人观察，不代表医学诊断。</p>
                <div className={styles.clueDetailMeta}>
                  <span>来自「{clue.sourceExperimentTitle}」</span>
                  <span>
                    <Seal size={12} weight="fill" /> {clue.shells} 贝壳
                  </span>
                </div>
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
          ))}</div>
        </section>
        <button
          type="button"
          className={shell.cta}
          onClick={() => setSheet('create')}
        >
          <span>开始新的身体小实验</span>
          <Path size={18} weight="bold" />
        </button>
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
      {sheet === 'record' && active ? (
        <RecordObservationSheet
          experiment={active}
          onClose={() => setSheet(null)}
          onSave={(done, note) => {
            recordObservation(active.id, done.values, done.completedTry, note)
            setSheet(null)
          }}
        />
      ) : null}
      {pathOpen ? <ExperimentPathSheet active={Boolean(active)} onClose={() => setPathOpen(false)} /> : null}
    </div>
  )
}

function ExperimentPathSheet({ active, onClose }: { active: boolean; onClose: () => void }) {
  return (
    <Sheet title="身体小实验路径" onClose={onClose}>
      <p className={shell.cardMeta}>身体的答案，慢慢浮上来</p>
      <p className={styles.pathIntro}>不急着下结论，只改变一件小事，再和过去的自己轻轻比较。</p>
      <div className={styles.pathSteps}>
        <svg className={styles.pathLine} viewBox="0 0 300 58" preserveAspectRatio="none" aria-hidden="true"><path d="M18 35 C58 2 96 53 140 28 S225 8 282 31" /></svg>
        {STEPS.map((step, index) => <div key={step.key} className={styles.pathStep} data-state={index < (active ? 2 : 0) ? 'done' : index === (active ? 2 : 0) ? 'current' : 'upcoming'}><span className={styles.pathDot}>{step.key}</span><span className={styles.pathLabel}>{step.label}</span></div>)}
      </div>
    </Sheet>
  )
}

function RecentFeedback({ experiment }: { experiment: Experiment }) {
  const records = experiment.observations
  const completed = records.filter((item) => item.completedTry).length
  const latest = records.at(-1)
  return (
    <section className={styles.feedbackCard} aria-label="最近观察反馈">
      <div className={styles.feedbackTop}>
        <div>
          <p className={styles.pathKicker}>Recent signal</p>
          <h2 className={styles.feedbackTitle}>最近观察反馈</h2>
        </div>
        <span className={styles.feedbackCount}>{records.length} 条记录</span>
      </div>
      {latest ? (
        <p className={styles.feedbackCopy}>
          最近一次记录：{Object.entries(latest.values).map(([key, value]) => `${key} ${value}`).join(' · ')}
        </p>
      ) : (
        <p className={styles.feedbackCopy}>完成第一条记录后，这里会出现你的身体反馈。</p>
      )}
      <div className={styles.feedbackMeta}>
        <span>尝试完成 {completed}/{records.length || 0} 天</span>
        <span>再观察 {Math.max(experiment.totalDays - experiment.currentDay, 0)} 天</span>
      </div>
    </section>
  )
}

function ActiveExperiment({
  experiment,
  onRecord,
}: {
  experiment: Experiment
  onRecord: () => void
}) {
  return (
    <section className={`${shell.card} ${styles.active}`}>
      <div className={styles.activeTop}>
        <span className={shell.pill}>
          <Flask size={12} weight="fill" />
          进行中
        </span>
        <span className={styles.days}>
          Day {experiment.currentDay}/{experiment.totalDays}
        </span>
      </div>
      <h2 className={shell.cardTitle}>{experiment.question}</h2>
      <p className={shell.cardMeta}>
        尝试：{experiment.try}
        <br />
        观察：{experiment.watch.join(' · ')}
      </p>
      <div className={styles.track} aria-hidden="true">
        <span
          className={styles.fill}
          style={{
            width: `${(experiment.currentDay / experiment.totalDays) * 100}%`,
          }}
        />
      </div>
      <button type="button" className={styles.secondary} onClick={onRecord}>
        记录今日观察
        <ArrowRight size={14} weight="bold" />
      </button>
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
      <p className={shell.cardMeta}>一次只改变一个变量，给身体一点时间回应。</p>
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
      <div className={styles.choiceStack}>
        {available.length ? (
          available.map((item) => (
            <button
              type="button"
              key={item.question}
              data-on={selected.question === item.question}
              onClick={() => setSelectedQuestion(item.question)}
            >
              {item.question}
            </button>
          ))
        ) : (
          <p className={styles.helper}>
            这个方向的预设正在准备中，先从“经前睡眠”开始体验。
          </p>
        )}
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
  const [completedTry, setCompletedTry] = useState(true)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(experiment.watch.map((item) => [item, '一般'])),
  )
  const [note, setNote] = useState('')
  return (
    <Sheet title="记录今日观察" onClose={onClose}>
      <p className={shell.cardMeta}>
        Day {experiment.currentDay + 1} · 今天的状态不需要完美，只要诚实。
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
        onChange={(e) => setNote(e.target.value)}
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
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={17} />
        </button>
        <h2 className={shell.cardTitle}>{title}</h2>
        {children}
      </div>
    </div>
  )
}
