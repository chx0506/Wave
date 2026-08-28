import { PHASE_TIDE_LABEL } from '@/domain/copy'
import type { DaySnapshot, Phase } from '@/domain/types'

export type MindfulnessCategory = 'sleep' | 'stress' | 'mood' | 'fatigue'

export type MindfulnessThumb =
  | 'moon-waves'
  | 'pillow-stars'
  | 'paper-boat'
  | 'zen-stones'
  | 'hot-air'
  | 'wind-leaves'
  | 'sunset-hill'
  | 'pinwheel'
  | 'bay-breath'

export const MINDFULNESS_THUMB_SRC: Record<MindfulnessThumb, string> = {
  'moon-waves': '/textures/mindfulness/thumb-moon-waves.png',
  'pillow-stars': '/textures/mindfulness/thumb-pillow-stars.png',
  'paper-boat': '/textures/mindfulness/thumb-paper-boat.png',
  'zen-stones': '/textures/mindfulness/thumb-zen-stones.png',
  'hot-air': '/textures/mindfulness/thumb-hot-air.png',
  'wind-leaves': '/textures/mindfulness/thumb-wind-leaves.png',
  'sunset-hill': '/textures/mindfulness/thumb-sunset-hill.png',
  'pinwheel': '/textures/mindfulness/thumb-pinwheel.png',
  'bay-breath': '/textures/mindfulness/thumb-bay-breath.png',
}

export const MINDFULNESS_HERO_BG = '/textures/mindfulness/hero-recommend-bg.png'
export const MINDFULNESS_HERO_ART = '/textures/mindfulness/hero-recommend-art.png'
export const MINDFULNESS_HERO_WAVES = '/textures/mindfulness/hero-bay-waves.png'
export const MINDFULNESS_HERO_TAG = '/textures/mindfulness/hero-custom-tag-v2.png'

export const MINDFULNESS_SLEEP_AGAIN_VIDEO =
  '/textures/mindfulness/sleep-again-loop.mp4'
export const MINDFULNESS_SLEEP_AGAIN_POSTER =
  '/textures/mindfulness/sleep-again-poster.jpg'

export type MindfulnessSession = {
  id: string
  category: MindfulnessCategory
  title: string
  durationMin: number
  durationLabel: string
  timerHint: string
  thumb: MindfulnessThumb
  /** 播放器页主标题，默认「静谧海湾」 */
  playerTitle?: string
  /** 播放器页副标题 */
  playerSubtitle?: string
  /** 冥想循环视频（点击播放后 loop） */
  sceneVideo?: string
  /** 未播放时的封面 */
  scenePoster?: string
}

export const MINDFULNESS_CATEGORY_LABEL: Record<MindfulnessCategory, string> = {
  sleep: '睡眠',
  stress: '压力',
  mood: '情绪',
  fatigue: '疲劳',
}

export const MINDFULNESS_SESSIONS: MindfulnessSession[] = [
  {
    id: 'sleep-again',
    category: 'sleep',
    title: '再次入睡',
    durationMin: 10,
    durationLabel: '5-15 分钟',
    timerHint: '呼吸 · 慢慢沉下去',
    thumb: 'moon-waves',
    playerTitle: '再次入睡',
    playerSubtitle: '闭上眼睛，让云与浪带你慢慢沉下去',
    sceneVideo: MINDFULNESS_SLEEP_AGAIN_VIDEO,
    scenePoster: MINDFULNESS_SLEEP_AGAIN_POSTER,
  },
  {
    id: 'sleep-fast',
    category: 'sleep',
    title: '快速入眠',
    durationMin: 5,
    durationLabel: '5 分钟',
    timerHint: '呼吸 · 让身体松下来',
    thumb: 'pillow-stars',
  },
  {
    id: 'stress-release',
    category: 'stress',
    title: '释放身心压力',
    durationMin: 10,
    durationLabel: '10 分钟',
    timerHint: '呼吸 · 把压力交给浪',
    thumb: 'paper-boat',
  },
  {
    id: 'stress-focus',
    category: 'stress',
    title: '高压下专注',
    durationMin: 10,
    durationLabel: '10 分钟',
    timerHint: '呼吸 · 稳住注意力',
    thumb: 'zen-stones',
  },
  {
    id: 'mood-rhythm',
    category: 'mood',
    title: '找回自己的节奏',
    durationMin: 15,
    durationLabel: '15 分钟',
    timerHint: '呼吸 · 跟随自己的潮',
    thumb: 'hot-air',
  },
  {
    id: 'mood-calm',
    category: 'mood',
    title: '平复烦躁',
    durationMin: 5,
    durationLabel: '5 分钟',
    timerHint: '呼吸 · 让心慢慢平',
    thumb: 'wind-leaves',
  },
  {
    id: 'fatigue-afternoon',
    category: 'fatigue',
    title: '午后恢复',
    durationMin: 8,
    durationLabel: '8 分钟',
    timerHint: '呼吸 · 补一点能量',
    thumb: 'sunset-hill',
  },
  {
    id: 'fatigue-low',
    category: 'fatigue',
    title: '低能量呼吸',
    durationMin: 6,
    durationLabel: '6 分钟',
    timerHint: '呼吸 · 轻柔地醒一醒',
    thumb: 'pinwheel',
  },
  {
    id: 'bay-breath',
    category: 'stress',
    title: '三分钟呼吸 · 跟随浪',
    durationMin: 3,
    durationLabel: '3 分钟',
    timerHint: '呼吸 · 跟随浪',
    thumb: 'bay-breath',
  },
]

const RECOMMEND_BY_PHASE: Record<Phase, string> = {
  menstrual: 'sleep-again',
  follicular: 'bay-breath',
  ovulatory: 'mood-rhythm',
  luteal: 'sleep-fast',
}

export function mindfulnessSessionById(id: string): MindfulnessSession | undefined {
  return MINDFULNESS_SESSIONS.find((s) => s.id === id)
}

export function sessionsForCategory(category: MindfulnessCategory): MindfulnessSession[] {
  return MINDFULNESS_SESSIONS.filter(
    (s) => s.category === category && s.id !== 'bay-breath',
  )
}

export function recommendMindfulness(snapshot: DaySnapshot): MindfulnessSession {
  const id = RECOMMEND_BY_PHASE[snapshot.phase]
  return mindfulnessSessionById(id) ?? MINDFULNESS_SESSIONS[0]
}

export function recommendHint(snapshot: DaySnapshot): string {
  const hints: Record<Phase, string> = {
    menstrual: '根据你最近的睡眠与疼痛记录',
    follicular: '根据你最近的压力与睡眠记录',
    ovulatory: '根据你最近的情绪与精力记录',
    luteal: '根据你最近的睡眠与情绪记录',
  }
  return hints[snapshot.phase]
}

export function recommendReason(snapshot: DaySnapshot): string {
  const phaseLine = `${PHASE_TIDE_LABEL[snapshot.phase]} · 第 ${snapshot.cycleDay} 天`
  return `${phaseLine}\n${recommendHint(snapshot)}`
}

export function recommendPhaseLine(snapshot: DaySnapshot): string {
  return `${PHASE_TIDE_LABEL[snapshot.phase]} · 第 ${snapshot.cycleDay} 天`
}
