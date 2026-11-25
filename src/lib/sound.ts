import { getSettings } from './settings'

/**
 * Optional interaction sounds — synthesised with the Web Audio API, so there are no audio
 * files to download. Off unless the visitor turns it on in Settings; never loops or autoplays.
 */
export type Cue = 'click' | 'switch' | 'open' | 'done'

let ctx: AudioContext | null = null
let last = 0

const cues: Record<Cue, { f: number[]; d: number; g: number; type: OscillatorType }> = {
  click: { f: [520], d: 0.05, g: 0.035, type: 'sine' },
  switch: { f: [440, 660], d: 0.09, g: 0.04, type: 'sine' },
  open: { f: [330, 495, 660], d: 0.12, g: 0.04, type: 'triangle' },
  done: { f: [660, 880], d: 0.14, g: 0.04, type: 'sine' },
}

export function playSound(cue: Cue) {
  if (!getSettings().sound) return
  const now = performance.now()
  if (now - last < 45) return // never stack sounds
  last = now
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const { f, d, g, type } = cues[cue]
    const t0 = ctx.currentTime
    f.forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      const start = t0 + (i * d) / f.length
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(g, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + d)
      osc.connect(gain).connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + d + 0.02)
    })
  } catch {
    /* audio unavailable */
  }
}

/** One delegated listener gives every button a soft tick. App-switch buttons play their own cue. */
let installed = false
export function installClickSounds() {
  if (installed) return
  installed = true
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest('button, [role="button"], a[href]')
      if (!el || el.matches('[data-task], [data-app], [data-sound="off"], :disabled')) return
      playSound('click')
    },
    { capture: true },
  )
}
