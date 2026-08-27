import type { Phase, TabId, TideState } from './types'

export const APP_NAME = '潮汐'

export const TAB_LABEL: Record<TabId, string> = {
  coast: '海岸',
  record: '记录',
  calendar: '日历',
  atlas: '图鉴',
}

export const PHASE_LABEL: Record<Phase, string> = {
  menstrual: '月经期',
  follicular: '卵泡期',
  ovulatory: '排卵期',
  luteal: '黄体期',
}

export const TIDE_LABEL: Record<TideState, string> = {
  low: '低潮',
  rising: '涨潮中',
  high: '高潮',
  falling: '退潮中',
}

export const TIDE_HINT: Record<TideState, string> = {
  low: '潮水退到最远处',
  rising: '潮水正在回来',
  high: '潮水到了最高处',
  falling: '潮水正在离开',
}

export const RECORD_PROMPT = '记录今日'
export const BACKFILL_PROMPT = '补记'
