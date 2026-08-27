import { Leaf, X } from '@phosphor-icons/react'
import { useState } from 'react'
import styles from './RecordSheet.module.css'

const FLOW_OPTIONS = [
  { id: 'none', label: '干涸', level: 0 },
  { id: 'light', label: '偏少', level: 1 },
  { id: 'medium', label: '偏多', level: 2 },
  { id: 'heavy', label: '充盈', level: 3 },
] as const

const SYMPTOMS = [
  '腹痛',
  '腰酸',
  '腹胀',
  '头痛',
  '疲惫',
  '情绪低落',
  '长痘',
  '睡眠不佳',
] as const

const MOODS = [
  { id: 'calm', label: '平静', tone: 'calm' },
  { id: 'low', label: '低落', tone: 'low' },
  { id: 'irritable', label: '烦躁', tone: 'irritable' },
  { id: 'happy', label: '愉悦', tone: 'happy' },
  { id: 'sensitive', label: '敏感', tone: 'sensitive' },
] as const

export function RecordSheet({
  dateLabel,
  onClose,
  onSave,
}: {
  dateLabel: string
  onClose: () => void
  onSave: () => void
}) {
  const [flow, setFlow] = useState<string>('light')
  const [symptoms, setSymptoms] = useState<string[]>(['疲惫'])
  const [mood, setMood] = useState<string>('calm')
  const [note, setNote] = useState('')

  const toggleSymptom = (item: string) => {
    setSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item],
    )
  }

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
            <strong>月潮</strong>
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
                  <span className={styles.flowArt} data-level={opt.level} aria-hidden="true">
                    <FlowGlyph level={opt.level} />
                  </span>
                  <span className={styles.flowLabel}>{opt.label}</span>
                  <span className={styles.radio} data-on={flow === opt.id} />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>症状</h3>
            <div className={styles.symptomGrid}>
              {SYMPTOMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={styles.symptom}
                  data-on={symptoms.includes(item)}
                  onClick={() => toggleSymptom(item)}
                >
                  {item}
                </button>
              ))}
              <button type="button" className={styles.symptomMore}>
                + 其他
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>心情</h3>
            <div className={styles.moodRow}>
              {MOODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.moodCard}
                  data-on={mood === item.id}
                  onClick={() => setMood(item.id)}
                >
                  <span className={styles.moodFace} data-tone={item.tone} aria-hidden="true">
                    <MoodGlyph tone={item.tone} />
                  </span>
                  <span className={styles.moodLabel}>{item.label}</span>
                  <span className={styles.radio} data-on={mood === item.id} />
                </button>
              ))}
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
              onSave()
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

function FlowGlyph({ level }: { level: number }) {
  const h = 10 + level * 8
  return (
    <svg viewBox="0 0 48 40" width="48" height="40">
      <ellipse cx="24" cy="34" rx="14" ry="3" fill="rgba(90,140,180,0.12)" />
      <path
        d={`M8 ${32 - h * 0.15} C14 ${20 - level * 2}, 18 ${28 - level}, 24 ${18 - level * 2}
            C30 ${28 - level}, 34 ${20 - level * 2}, 40 ${32 - h * 0.15}
            C36 ${34}, 12 ${34}, 8 ${32 - h * 0.15} Z`}
        fill={`url(#flow${level})`}
      />
      <defs>
        <linearGradient id={`flow${level}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c5e6f7" />
          <stop offset="100%" stopColor={level > 1 ? '#5fafdf' : '#9fd0ef'} />
        </linearGradient>
      </defs>
    </svg>
  )
}

function MoodGlyph({ tone }: { tone: string }) {
  return (
    <svg viewBox="0 0 44 44" width="40" height="40">
      <circle cx="22" cy="22" r="20" fill="currentColor" opacity="0.18" />
      <circle cx="15" cy="19" r="2" fill="currentColor" />
      <circle cx="29" cy="19" r="2" fill="currentColor" />
      {tone === 'happy' ? (
        <path d="M15 26 Q22 32 29 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : tone === 'low' ? (
        <path d="M15 30 Q22 24 29 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : tone === 'irritable' ? (
        <>
          <path d="M14 27 H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 12 L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 12 L30 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <path d="M16 28 Q22 30 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  )
}
