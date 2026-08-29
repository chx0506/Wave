import { MoodGlyph, moodDiscStyle } from '@/components/coast/MoodGlyph'
import {
  DISCHARGE_OPTIONS,
  EXERCISE_OPTIONS,
  INTIMACY_OPTIONS,
  SYMPTOM_OPTIONS,
  type RecordChip,
} from '@/data/recordStatusArt'
import type { DailyLog, DailyLogInput } from '@/domain/types'
import { Leaf, Plus, X } from '@phosphor-icons/react'
import { useState } from 'react'
import flowDry from '@/assets/flow/flow-dry.png'
import flowFull from '@/assets/flow/flow-full.png'
import flowLight from '@/assets/flow/flow-light.png'
import flowMedium from '@/assets/flow/flow-medium.png'
import styles from './RecordSheet.module.css'

const FLOW_OPTIONS = [
  { id: 'none', label: '干涸', src: flowDry },
  { id: 'light', label: '偏少', src: flowLight },
  { id: 'medium', label: '偏多', src: flowMedium },
  { id: 'heavy', label: '充盈', src: flowFull },
] as const

const MOODS = [
  { id: 'calm', label: '平静', tone: 'calm' },
  { id: 'low', label: '低落', tone: 'low' },
  { id: 'irritable', label: '烦躁', tone: 'irritable' },
  { id: 'happy', label: '愉悦', tone: 'happy' },
  { id: 'sensitive', label: '敏感', tone: 'sensitive' },
] as const

function toggleId(prev: string[], id: string) {
  return prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
}

function ChipGrid({
  options,
  selected,
  onToggle,
  withMore,
}: {
  options: readonly RecordChip[]
  selected: string[]
  onToggle: (id: string) => void
  withMore?: boolean
}) {
  return (
    <div className={styles.chipGrid}>
      {options.map((item) => {
        const on = selected.includes(item.id)
        return (
          <button
            key={item.id}
            type="button"
            className={styles.chip}
            data-on={on}
            onClick={() => onToggle(item.id)}
          >
            <span className={styles.chipArt} aria-hidden="true">
              <img className={styles.chipImg} src={item.src} alt="" draggable={false} />
            </span>
            <span className={styles.chipLabel}>{item.label}</span>
          </button>
        )
      })}
      {withMore ? (
        <button type="button" className={styles.chipMore}>
          <span className={styles.chipMoreIcon} aria-hidden="true">
            <Plus size={18} weight="bold" />
          </span>
          <span className={styles.chipLabel}>其他</span>
        </button>
      ) : null}
    </div>
  )
}

export function RecordSheet({
  dateLabel,
  initialLog,
  onClose,
  onSave,
}: {
  dateLabel: string
  initialLog?: DailyLog
  onClose: () => void
  onSave: (input: DailyLogInput) => void
}) {
  const [flow, setFlow] = useState<string>(initialLog?.flow ?? 'light')
  const [symptoms, setSymptoms] = useState<string[]>(
    initialLog?.symptoms ?? [],
  )
  const [discharge, setDischarge] = useState<string[]>(
    initialLog?.discharge ?? [],
  )
  const [exercise, setExercise] = useState<string[]>(
    initialLog?.exercise ?? [],
  )
  const [intimacy, setIntimacy] = useState<string[]>(
    initialLog?.intimacy ?? [],
  )
  const [mood, setMood] = useState<string>(initialLog?.mood ?? 'calm')
  const [note, setNote] = useState(initialLog?.note ?? '')

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="今日记录"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.brand}>
            <strong>MoonWave</strong>
            <span>daily record</span>
          </div>
          <h2 className={styles.title}>
            <Leaf size={14} weight="fill" />
            今日记录 · {dateLabel}
            <Leaf size={14} weight="fill" />
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="关闭">
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className={styles.scroll}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>经量</h3>
            <div className={styles.flowRow}>
              {FLOW_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={styles.flowCard}
                  data-on={flow === opt.id}
                  onClick={() => setFlow(opt.id)}
                >
                  <span className={styles.flowArt} aria-hidden="true">
                    <img
                      className={styles.flowImg}
                      src={opt.src}
                      alt=""
                      draggable={false}
                    />
                  </span>
                  <span className={styles.flowLabel}>{opt.label}</span>
                  <span className={styles.radio} data-on={flow === opt.id} />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>身体症状</h3>
            <ChipGrid
              options={SYMPTOM_OPTIONS}
              selected={symptoms}
              onToggle={(id) => setSymptoms((prev) => toggleId(prev, id))}
              withMore
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>分泌物</h3>
            <ChipGrid
              options={DISCHARGE_OPTIONS}
              selected={discharge}
              onToggle={(id) => setDischarge((prev) => toggleId(prev, id))}
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>运动</h3>
            <ChipGrid
              options={EXERCISE_OPTIONS}
              selected={exercise}
              onToggle={(id) => setExercise((prev) => toggleId(prev, id))}
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>性活动</h3>
            <ChipGrid
              options={INTIMACY_OPTIONS}
              selected={intimacy}
              onToggle={(id) => setIntimacy((prev) => toggleId(prev, id))}
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>心情</h3>
            <div className={styles.moodRow}>
              {MOODS.map((item) => {
                const selected = mood === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.moodCard}
                    data-on={selected}
                    onClick={() => setMood(item.id)}
                  >
                    <span
                      className={styles.moodFace}
                      data-tone={item.tone}
                      data-on={selected ? '1' : '0'}
                      style={moodDiscStyle(item.tone, selected)}
                      aria-hidden="true"
                    >
                      <MoodGlyph tone={item.tone} />
                    </span>
                    <span className={styles.moodLabel}>{item.label}</span>
                    <span className={styles.radio} data-on={selected} />
                  </button>
                )
              })}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>备注</h3>
            <div className={styles.noteWrap}>
              <textarea
                className={styles.note}
                value={note}
                maxLength={200}
                placeholder="记录一下你的感受吧..."
                onChange={(e) => setNote(e.target.value)}
              />
              <span className={styles.noteCount}>{note.length}/200</span>
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.save}
            onClick={() => {
              onSave({
                flow,
                symptoms,
                discharge,
                exercise,
                intimacy,
                mood,
                note,
              })
              onClose()
            }}
          >
            <Leaf size={16} weight="fill" />
            存入潮汐
            <Leaf size={16} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
