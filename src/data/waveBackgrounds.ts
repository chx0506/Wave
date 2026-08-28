/** 滚动驱动流动视频（与 home-paper-waves-bg 同风格，10s 循环） */
export const WAVE_FLOW_VIDEO = '/textures/waves/wave-flow-scroll.mp4'

/** 首页纸浮雕海浪背景候选。改 ACTIVE_WAVE_BG 即可切换。 */
export type WaveBackgroundId = 'a' | 'b' | 'c' | 'd' | 'home'

export type WaveBackgroundOption = {
  id: WaveBackgroundId
  label: string
  path: string
  note: string
}

export const WAVE_BACKGROUNDS: WaveBackgroundOption[] = [
  {
    id: 'home',
    label: 'Home · 蓝白纸浪',
    path: '/textures/home-paper-waves-bg.png',
    note: '淡蓝天空 + 蓝白浪层，奶油金仅作浪顶描边（当前默认）',
  },
  {
    id: 'a',
    label: 'A · 暖金渐变',
    path: '/textures/waves/wave-bg-cream-gold-a.png',
    note: '奶油底 + 淡蓝，浪层带金黄渐变，层次最丰富',
  },
  {
    id: 'b',
    label: 'B · 极简奶油',
    path: '/textures/waves/wave-bg-cream-gold-b.png',
    note: '大面积留白，奶油纸雕浪，几乎无蓝，最安静',
  },
  {
    id: 'c',
    label: 'C · 奶油金边',
    path: '/textures/waves/wave-bg-cream-gold-c.png',
    note: '奶油浪顶 + 淡金高光 + 灰蓝底',
  },
  {
    id: 'd',
    label: 'D · 金线描边',
    path: '/textures/waves/wave-bg-cream-gold-d.png',
    note: '蓝浪 + 奶油金 crest 细金线',
  },
]

/** 当前使用的背景 id */
export const ACTIVE_WAVE_BG: WaveBackgroundId = 'home'

export function waveBackgroundPath(id: WaveBackgroundId = ACTIVE_WAVE_BG) {
  return WAVE_BACKGROUNDS.find((w) => w.id === id)?.path ?? WAVE_BACKGROUNDS[0].path
}
