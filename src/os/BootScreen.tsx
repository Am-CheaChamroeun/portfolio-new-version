import { isReducedMotion } from '../lib/settings'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OSLogo } from './OSLogo'

const reduced = () => isReducedMotion()

/**
 * Short boot sequence (≈1.8 s). The desktop is already mounted underneath, so it
 * never delays content; click or any key skips it.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()
  const steps = t('os.boot.steps', { returnObjects: true })
  const [duration] = useState(() => (reduced() ? 700 : 1800))
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i), (duration / steps.length) * i))
    const done = setTimeout(onDone, duration)
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
      window.removeEventListener('keydown', skip)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, onDone])

  return (
    <motion.div
      role="status"
      aria-label={t('os.boot.aria')}
      aria-live="polite"
      onClick={onDone}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="os-chrome fixed inset-0 z-[10000] flex cursor-pointer flex-col items-center justify-center bg-graphite text-warm"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(50% 45% at 50% 45%, rgb(var(--neon-rgb)/0.10), transparent 70%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <OSLogo size={84} className="drop-shadow-[0_0_28px_rgb(var(--neon-rgb)/0.35)]" />
      </motion.div>
      <p className="relative mt-6 text-lg font-semibold tracking-tight">
        Developer<span className="text-neon">OS</span>
      </p>

      <div className="relative mt-9 h-[3px] w-56 overflow-hidden rounded-full bg-warm/10" aria-hidden="true">
        <div
          className="animate-boot h-full origin-left rounded-full bg-neon shadow-[0_0_12px_var(--neon)]"
          style={{ ['--boot-ms' as string]: `${duration}ms` }}
        />
      </div>
      <p className="relative mt-4 h-5 font-mono text-[12px] text-steel">{steps[step]}</p>
      <p className="absolute bottom-8 text-[11px] text-steel/60">{t('os.boot.skip')}</p>
    </motion.div>
  )
}
