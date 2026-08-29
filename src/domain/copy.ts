import type { LogKey, Phase, TabId, TideState } from './types'

export const APP_NAME = 'MoonWave'
export const APP_NAME_EN = 'MoonWave'
export const APP_NAME_ZH = '月潮'
export const APP_TAGLINE = 'Feel Your Wave. Be Your Wave.'
export const APP_TAGLINE_ZH = '读懂身体的潮汐，找到自己的节奏。'
export const USER_DISPLAY_NAME = '阿纯'
export const CRAB_NAME = 'Crab'

export const TAB_LABEL: Record<TabId, string> = {
  home: '首页',
  calendar: '日历',
  stats: '统计',
  explore: '探索',
}

export const TAB_SECTION: Record<TabId, string> = {
  home: '潮汐日志',
  calendar: '潮汐日历',
  stats: '身体健康',
  explore: '海岛探秘',
}

export const PHASE_LABEL: Record<Phase, string> = {
  menstrual: '月经期',
  follicular: '卵泡期',
  ovulatory: '排卵期',
  luteal: '黄体期',
}

/**
 * Home dial & primary phase label.
 * Order: 退→涨→满→平 maps to 月经→卵泡→排卵→黄体.
 */
export const PHASE_TIDE_LABEL: Record<Phase, string> = {
  menstrual: '月经期',
  follicular: '卵泡期',
  ovulatory: '排卵期',
  luteal: '黄体期',
}

/** Short tide metaphor for subtitles (退=月经, 涨=卵泡, 满=排卵, 平=黄体). */
export const TIDE_METAPHOR_SHORT: Record<Phase, string> = {
  menstrual: '退潮',
  follicular: '涨潮',
  ovulatory: '满潮',
  luteal: '平潮',
}

export const TIDE_LABEL: Record<TideState, string> = {
  low: '低潮',
  rising: '涨潮中',
  high: '满潮',
  falling: '退潮中',
}

export const TIDE_HINT: Record<TideState, string> = {
  low: '潮水退到最远处',
  rising: '潮水正在回来',
  high: '潮水到了最高处',
  falling: '潮水正在离开',
}

export const PHASE_TIDE_LEGEND: { phase: Phase; tide: string }[] = [
  { phase: 'menstrual', tide: '退潮' },
  { phase: 'follicular', tide: '涨潮' },
  { phase: 'ovulatory', tide: '满潮' },
  { phase: 'luteal', tide: '平潮' },
]

/** PRD: 经期 / 疼痛 / 情绪 / 睡眠 / 精力 / 压力 / 饮食 / 运动 */
export const LOG_LABEL: Record<LogKey, string> = {
  period: '经期',
  pain: '疼痛',
  mood: '情绪',
  sleep: '睡眠',
  energy: '精力',
  stress: '压力',
  diet: '饮食',
  exercise: '运动',
}

/** Mood → weather metaphor on the coast */
export const MOOD_WEATHER = {
  calm: { label: '晴朗', hint: '情绪像今天的晴空' },
  low: { label: '薄雾', hint: '情绪有一点起雾' },
  irritable: { label: '微风', hint: '心里有点不安稳' },
  happy: { label: '暖阳', hint: '情绪像被阳光照到' },
  sensitive: { label: '潮汐云', hint: '感觉更敏感一些' },
} as const

export type MoodWeatherKey = keyof typeof MOOD_WEATHER

export const PHASE_TODAY_TIP: Record<Phase, string> = {
  menstrual: '退潮期里，身体在释放与修复。今天可以少一点安排，多一点热水和休息。',
  follicular: '涨潮期能量在回升。适合轻量运动，或把想推进的小事往前推一点。',
  ovulatory: '满潮期通常更有社交与表达欲。留意身体信号，别把节奏拉得太满。',
  luteal: '平潮期里情绪和睡眠更容易波动。今晚试试提前收一收屏幕，给身体留出口岸。',
}

export const CRAB_LINES: Record<Phase, string> = {
  menstrual: '退潮开始了。记一下经量和睡眠，帮你看清这波节奏。',
  follicular: '涨潮中呢。记一下精力和情绪，过几天会更好对照。',
  ovulatory: '满潮附近了。压力如果偏高，也可以去静谧海湾待三分钟。',
  luteal: '平潮期常见睡眠变浅。要不要开一个「经前睡眠」小观察？',
}

export const RECORD_PROMPT = '记录今日状态'
export const HOME_QUESTION = '今天，我的身体怎么样？'
export const BACKFILL_PROMPT = '补记'

export function greetingForHour(hour: number): string {
  if (hour < 5) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}
