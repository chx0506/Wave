import phaseEbb from '@/assets/phases/ebb.png'
import phaseHigh from '@/assets/phases/high-blue.png'
import phaseRise from '@/assets/phases/rise.png'
import phaseSlack from '@/assets/phases/slack.png'
import type { Phase } from './types'

/** 与潮汐日历一致：退潮用 rise 图标，涨潮用 ebb 图标 */
export const PHASE_ICON: Record<Phase, string> = {
  menstrual: phaseRise,
  follicular: phaseEbb,
  ovulatory: phaseHigh,
  luteal: phaseSlack,
}

/** 日历页 phaseCard / 日历格主色 (RGB 三元组) */
export const PHASE_RGB: Record<Phase, `${number}, ${number}, ${number}`> = {
  menstrual: '232, 145, 122',
  follicular: '107, 191, 160',
  ovulatory: '61, 127, 212',
  luteal: '224, 192, 106',
}

export const PHASE_HINT: Record<Phase, string> = {
  menstrual: '能量较低\n适合休息',
  follicular: '状态上升\n适合行动',
  ovulatory: '能量高峰\n释放光芒',
  luteal: '平稳平衡\n适合整合',
}

export const PHASE_ORDER: Phase[] = [
  'menstrual',
  'follicular',
  'ovulatory',
  'luteal',
]
