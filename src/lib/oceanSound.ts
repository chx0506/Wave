type Intensity = 'soft' | 'mid' | 'deep'

const INTENSITY_GAIN: Record<Intensity, number> = {
  soft: 0.18,
  mid: 0.28,
  deep: 0.38,
}

export type OceanSoundHandle = {
  start: () => void
  stop: () => void
  setIntensity: (intensity: Intensity) => void
  dispose: () => void
}

/** Gentle filtered noise loop — stand-in for ocean ambience when no asset is bundled. */
export function createOceanSound(): OceanSoundHandle {
  let ctx: AudioContext | null = null
  let gain: GainNode | null = null
  let low: BiquadFilterNode | null = null
  let source: AudioBufferSourceNode | null = null
  let intensity: Intensity = 'mid'

  const filterFreq = (level: Intensity) =>
    level === 'soft' ? 420 : level === 'mid' ? 620 : 820

  const ensureContext = () => {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  }

  const buildLoop = (audioCtx: AudioContext) => {
    const seconds = 4
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1
      last = last * 0.96 + white * 0.04
      data[i] = last
    }
    return buffer
  }

  const wire = () => {
    const audioCtx = ensureContext()
    if (source) {
      try {
        source.stop()
      } catch {
        /* already stopped */
      }
      source.disconnect()
    }

    source = audioCtx.createBufferSource()
    source.buffer = buildLoop(audioCtx)
    source.loop = true

    const lowPass = audioCtx.createBiquadFilter()
    lowPass.type = 'lowpass'
    lowPass.frequency.value = filterFreq(intensity)
    low = lowPass

    gain = audioCtx.createGain()
    gain.gain.value = INTENSITY_GAIN[intensity]

    source.connect(lowPass)
    lowPass.connect(gain)
    gain.connect(audioCtx.destination)
    source.start()
  }

  return {
    start() {
      wire()
    },
    stop() {
      if (source) {
        try {
          source.stop()
        } catch {
          /* noop */
        }
        source.disconnect()
        source = null
      }
    },
    setIntensity(next) {
      intensity = next
      if (gain) gain.gain.value = INTENSITY_GAIN[next]
      if (low) low.frequency.value = filterFreq(next)
    },
    dispose() {
      this.stop()
      if (ctx) {
        void ctx.close()
        ctx = null
      }
    },
  }
}
