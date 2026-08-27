import { EXPERIMENT_CATEGORIES, EXPERIMENT_PRESETS } from '@/data/content'
import { Tabs, type Experiment, type ExperimentCategory } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { ArrowRight, Flask, MagnifyingGlass, Path, Seal, X } from '@phosphor-icons/react'
import { useMemo, useState, type ReactNode } from 'react'
import shell from './shared/pageShell.module.css'
import styles from './ObserveScreen.module.css'

const STEPS = [{ key: '问', label: '提出问题' }, { key: '试', label: '尝试改变' }, { key: '看', label: '持续观察' }, { key: '比', label: '对比反馈' }]

export function ObserveScreen() {
  const { setTab, experiments, clues, createExperiment, recordObservation, confirmClue } = useAppState()
  const active = experiments.find((item) => item.status === 'active')
  const [sheet, setSheet] = useState<'create' | 'record' | null>(null)
  return <div className={shell.screen}><div className={shell.glow} aria-hidden="true" /><header className={shell.header}><p className={shell.kicker}>Observe</p><h1 className={shell.title}>潮池观察</h1><p className={shell.subtitle}>如果一个问题反复出现，就陪自己认真看看。发现什么可能更适合我。</p></header><div className={shell.body}>{active ? <ActiveExperiment experiment={active} onRecord={() => setSheet('record')} /> : <EmptyExperiment />}<p className={shell.sectionLabel}>小实验流程</p><div className={styles.steps}>{STEPS.map((step, i) => <div key={step.key} className={styles.step}><span className={styles.stepKey}>{step.key}</span><span className={styles.stepLabel}>{step.label}</span>{i < STEPS.length - 1 ? <span className={styles.stepLine} /> : null}</div>)}</div><p className={shell.sectionLabel}>身体线索</p>{clues.map((clue) => <article key={clue.id} className={shell.card}><div className={styles.clueRow}><MagnifyingGlass size={18} weight="fill" color="var(--tide-deep)" /><div><h3 className={shell.cardTitle}>{clue.title}</h3><p className={shell.cardMeta}>{clue.note} · {clue.status === 'pending' ? '待确认' : '已确认'}</p></div><span className={styles.shells}><Seal size={12} weight="fill" />{clue.shells}</span></div>{clue.status === 'pending' ? <button type="button" className={styles.confirm} onClick={() => confirmClue(clue.id)}>确认这条线索</button> : null}</article>)}<button type="button" className={shell.cta} onClick={() => setSheet('create')}><span>开始新的身体小实验</span><Path size={18} weight="bold" /></button><button type="button" className={styles.linkCal} onClick={() => setTab(Tabs.home)}>回到潮汐日志查看今日状态</button></div>{sheet === 'create' ? <CreateExperimentSheet onClose={() => setSheet(null)} onCreate={(input) => { createExperiment(input); setSheet(null) }} /> : null}{sheet === 'record' && active ? <RecordObservationSheet experiment={active} onClose={() => setSheet(null)} onSave={(done, note) => { recordObservation(active.id, { 状态: done ? '完成尝试' : '未完成' }, done, note); setSheet(null) }} /> : null}</div>
}

function ActiveExperiment({ experiment, onRecord }: { experiment: Experiment; onRecord: () => void }) {
  return <section className={`${shell.card} ${styles.active}`}><div className={styles.activeTop}><span className={shell.pill}><Flask size={12} weight="fill" />进行中</span><span className={styles.days}>Day {experiment.currentDay}/{experiment.totalDays}</span></div><h2 className={shell.cardTitle}>{experiment.question}</h2><p className={shell.cardMeta}>尝试：{experiment.try}<br />观察：{experiment.watch.join(' · ')}</p><div className={styles.track} aria-hidden="true"><span className={styles.fill} style={{ width: `${experiment.currentDay / experiment.totalDays * 100}%` }} /></div><button type="button" className={styles.secondary} onClick={onRecord}>记录今日观察<ArrowRight size={14} weight="bold" /></button></section>
}

function EmptyExperiment() { return <section className={`${shell.card} ${styles.active}`}><h2 className={shell.cardTitle}>还没有进行中的身体实验</h2><p className={shell.cardMeta}>从一个真实困扰开始，给自己 7–21 天的温柔观察。</p></section> }

function CreateExperimentSheet({ onClose, onCreate }: { onClose: () => void; onCreate: (input: { category: ExperimentCategory; question: string; try: string; watch: readonly string[]; totalDays: number }) => void }) {
  const [category, setCategory] = useState<ExperimentCategory>('sleep')
  const [length, setLength] = useState(14)
  const [selectedQuestion, setSelectedQuestion] = useState<string>(EXPERIMENT_PRESETS[0].question)
  const available = useMemo(() => EXPERIMENT_PRESETS.filter((item) => item.category === category), [category])
  const selected = available.find((item) => item.question === selectedQuestion) ?? available[0] ?? EXPERIMENT_PRESETS[0]
  const chooseCategory = (next: ExperimentCategory) => { setCategory(next); setSelectedQuestion(EXPERIMENT_PRESETS.find((item) => item.category === next)?.question ?? EXPERIMENT_PRESETS[0].question) }
  return <Sheet title="开始新的身体小实验" onClose={onClose}><p className={shell.cardMeta}>一次只改变一个变量，给身体一点时间回应。</p><p className={shell.sectionLabel}>关注方向</p><div className={styles.choiceGrid}>{EXPERIMENT_CATEGORIES.map((item) => <button type="button" key={item.id} data-on={category === item.id} onClick={() => chooseCategory(item.id as ExperimentCategory)}>{item.label}</button>)}</div><p className={shell.sectionLabel}>选择一个问题</p><div className={styles.choiceStack}>{available.length ? available.map((item) => <button type="button" key={item.question} data-on={selected.question === item.question} onClick={() => setSelectedQuestion(item.question)}>{item.question}</button>) : <p className={styles.helper}>这个方向的预设正在准备中，先从“经前睡眠”开始体验。</p>}</div><p className={shell.sectionLabel}>观察周期</p><div className={styles.choiceGrid}>{[7, 14, 21].map((days) => <button type="button" key={days} data-on={length === days} onClick={() => setLength(days)}>{days} 天</button>)}</div><button type="button" className={shell.cta} onClick={() => onCreate({ ...selected, totalDays: length })}>创建实验</button></Sheet>
}

function RecordObservationSheet({ experiment, onClose, onSave }: { experiment: Experiment; onClose: () => void; onSave: (done: boolean, note?: string) => void }) {
  const [done, setDone] = useState(true); const [note, setNote] = useState('')
  return <Sheet title="记录今日观察" onClose={onClose}><p className={shell.cardMeta}>Day {experiment.currentDay + 1} · 今天的状态不需要完美，只要诚实。</p><p className={shell.sectionLabel}>今天完成尝试了吗？</p><div className={styles.choiceGrid}><button type="button" data-on={done} onClick={() => setDone(true)}>已完成</button><button type="button" data-on={!done} onClick={() => setDone(false)}>还没有</button></div><p className={shell.sectionLabel}>一句话备注（可选）</p><textarea className={styles.note} value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="今天身体有什么变化？" /><button type="button" className={shell.cta} onClick={() => onSave(done, note || undefined)}>存入今日观察</button></Sheet>
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className={styles.overlay} role="presentation" onClick={onClose}><div className={styles.sheet} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}><button type="button" className={styles.close} onClick={onClose} aria-label="关闭"><X size={17} /></button><h2 className={shell.cardTitle}>{title}</h2>{children}</div></div>
}
