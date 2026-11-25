import { Pause, Play, RotateCcw } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createEngine, type Engine, type NarrationStatus } from '../../lib/narration'

/** Bar heights (% of the track) — a fixed, natural-looking waveform. */
const BARS = [
  20, 32, 46, 38, 54, 36, 48, 40, 58, 44, 62, 48, 64, 52, 62, 46, 58, 40, 54, 42, 52, 40, 46, 32, 22, 42, 48, 36, 60, 46, 56, 40, 62, 52, 66, 46, 54, 38, 46,
  36, 28, 36, 30, 48, 56, 46, 62, 58, 44,
]

/**
 * Voice narration of the bio: a pill with a round play / pause / replay button and a waveform
 * that pulses while the voice speaks and fills neon as it progresses. Nothing plays until clicked.
 * Mount it with `key={language}` so changing language stops playback and starts fresh.
 */
export const NarrationPlayer = memo(function NarrationPlayer({ text, lang }: { text: string; lang: string }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<NarrationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const engine = useRef<Engine | null>(null)
  const request = useRef(0)

  const stop = useCallback(() => {
    request.current += 1
    engine.current?.stop()
    engine.current = null
  }, [])
  useEffect(() => stop, [stop]) // leaving the app (or the language changing) silences the voice

  const begin = async () => {
    const id = ++request.current
    setStatus('loading')
    setProgress(0)
    engine.current?.stop()
    const live = () => request.current === id
    const e = await createEngine(text, lang, {
      onStart: () => live() && setStatus('playing'),
      onProgress: (p) => live() && setProgress(p),
      onEnd: () => {
        if (!live()) return
        setProgress(1)
        setStatus('ended')
      },
      onError: () => live() && setStatus('unavailable'),
    })
    if (!live()) return e?.stop()
    if (!e) return setStatus('unavailable')
    engine.current = e
    e.start()
  }

  const toggle = () => {
    if (status === 'playing') {
      engine.current?.pause()
      setStatus('paused')
    } else if (status === 'paused') {
      engine.current?.resume()
      setStatus('playing')
    } else if (status !== 'loading') void begin()
  }

  const playing = status === 'playing'
  const label =
    status === 'playing'
      ? t('os.about.narration.pause')
      : status === 'ended'
        ? t('os.about.narration.replay')
        : status === 'paused'
          ? t('os.about.narration.resume')
          : t('os.about.narration.play')
  const Icon = playing ? Pause : status === 'ended' ? RotateCcw : Play
  const played = Math.round(progress * BARS.length)

  return (
    <div>
      <div
        role="group"
        aria-label={t('os.about.narration.label')}
        className="os-chrome flex h-[68px] items-center gap-3.5 rounded-[26px] border border-edge bg-graphite px-4 text-warm @md:h-[76px] @md:gap-4 @md:px-5"
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          title={label}
          aria-busy={status === 'loading'}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neon text-graphite shadow-[0_0_22px_-6px_rgb(var(--neon-rgb)/0.55)] transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon @md:h-12 @md:w-12"
        >
          {status === 'loading' ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-graphite/30 border-t-graphite motion-reduce:animate-none" />
          ) : (
            <Icon size={20} strokeWidth={0} fill="currentColor" className={status === 'ended' ? '[stroke-width:2.2] fill-none' : ''} />
          )}
        </button>

        <div
          role="progressbar"
          aria-label={t('os.about.narration.progress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="flex h-full min-w-0 flex-1 items-center justify-between gap-[2px] @md:gap-[3px]"
        >
          {BARS.map((h, i) => {
            const done = i < played
            const head = playing && i === played
            return (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  height: `${h}%`,
                  animationDelay: `${(i * 53) % 700}ms`,
                }}
                className={`min-w-[2px] max-w-[7px] flex-1 rounded-full transition-colors duration-200 ${
                  done ? 'bg-neon' : head ? 'bg-neon shadow-[0_0_10px_var(--neon)]' : 'bg-warm/30'
                } ${playing ? 'animate-wave motion-reduce:animate-none' : ''}`}
              />
            )
          })}
        </div>
      </div>

      <p role="status" aria-live="polite" className={status === 'unavailable' ? 'mt-2 text-[12px] text-faint' : 'sr-only'}>
        {status === 'unavailable' ? t('os.about.narration.unavailable') : status === 'loading' ? t('os.about.narration.loading') : ''}
      </p>
    </div>
  )
})
