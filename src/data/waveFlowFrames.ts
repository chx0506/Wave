/** 从 wave-flow-scroll.mp4 提取的序列帧（10s @ 10fps） */
export const WAVE_FLOW_FRAME_COUNT = 100

export function waveFlowFramePath(index: number) {
  const clamped = Math.min(
    WAVE_FLOW_FRAME_COUNT - 1,
    Math.max(0, Math.round(index)),
  )
  const num = String(clamped + 1).padStart(3, '0')
  return `/textures/waves/flow-frames/frame_${num}.jpg`
}

export function waveFlowFrameForProgress(flow: number) {
  const index = Math.min(
    WAVE_FLOW_FRAME_COUNT - 1,
    Math.max(0, Math.round(flow * (WAVE_FLOW_FRAME_COUNT - 1))),
  )
  return waveFlowFramePath(index)
}

export function prefetchWaveFlowFrames(step = 4) {
  if (typeof Image === 'undefined') return
  for (let i = 0; i < WAVE_FLOW_FRAME_COUNT; i += step) {
    const img = new Image()
    img.src = waveFlowFramePath(i)
  }
}
