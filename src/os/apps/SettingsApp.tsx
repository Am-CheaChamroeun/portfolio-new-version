import { Check, Languages, Monitor, Palette, RotateCcw, Sparkles, Volume2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { languages } from '../../i18n'
import { ACCENT_COLORS, ACCENTS, DEFAULTS, MOTIONS, WALLPAPERS, isReducedMotion, resetSettings, updateSettings, useSettings } from '../../lib/settings'
import { playSound } from '../../lib/sound'
import { easeOut } from '../../lib/motion'
import { WallpaperArt } from '../Wallpaper'
import { Eyebrow } from './shared'

type Cat = 'appearance' | 'language' | 'animation' | 'sound' | 'reset'
const CATS: { id: Cat; icon: typeof Palette }[] = [
  { id: 'appearance', icon: Palette },
  { id: 'language', icon: Languages },
  { id: 'animation', icon: Sparkles },
  { id: 'sound', icon: Volume2 },
  { id: 'reset', icon: RotateCcw },
]

/** Settings row: title + hint on the left, control on the right. */
function Row({ title, hint, children, stacked }: { title: string; hint?: string; children: ReactNode; stacked?: boolean }) {
  return (
    <div
      className={`border-b border-card-border py-5 last:border-b-0 ${stacked ? '' : 'flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-8'}`}
    >
      <div className={stacked ? 'mb-4' : 'max-w-md'}>
        <h3 className="text-[14px] font-semibold">{title}</h3>
        {hint && <p className="mt-1 text-[12.5px] leading-6 text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

/** Accessible on/off switch. */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ${checked ? 'border-primary bg-primary/25' : 'border-line-strong bg-fg/10'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow transition-all duration-200 ${checked ? 'translate-x-5 bg-primary' : 'bg-faint'}`}
      />
    </button>
  )
}

/** Segmented control (radio group). */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-card-border bg-bg-subtle p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${value === o.id ? 'bg-primary text-on-cta' : 'text-muted hover:text-fg'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Settings → System Settings: appearance, language, animation, sound and reset, saved in localStorage. */
export default function SettingsApp() {
  const { t, i18n } = useTranslation()
  const s = useSettings()
  const [cat, setCat] = useState<Cat>('appearance')
  const [notice, setNotice] = useState('')
  const tt = (k: string, o?: object) => (t as unknown as (k: string, o?: object) => string)(k, o)

  const reset = () => {
    resetSettings()
    void i18n.changeLanguage('en')
    setNotice(t('os.settings.reset.done'))
  }

  const panels: Record<Cat, ReactNode> = {
    appearance: (
      <>
        <Row stacked title={t('os.settings.wallpaper.label')} hint={t('os.settings.wallpaper.hint')}>
          <ul className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
            {WALLPAPERS.map((w) => {
              const on = s.wallpaper === w
              const name = tt(`os.settings.wallpaper.${w}`)
              return (
                <li key={w}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={t('os.settings.preview', { name })}
                    data-wallpaper-option={w}
                    onClick={() => updateSettings({ wallpaper: w })}
                    className={`group block w-full rounded-xl border p-1.5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      on ? 'border-primary bg-glow shadow-[0_0_24px_-10px_rgb(var(--neon-rgb)/0.6)]' : 'border-card-border bg-sheet hover:border-line-strong'
                    }`}
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-lg">
                      <WallpaperArt id={w} boost />
                      {on && (
                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-cta">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="mt-2 block px-1 pb-0.5 text-[12.5px] font-medium">{name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Row>
        <Row stacked title={t('os.settings.accent.label')} hint={t('os.settings.accent.hint')}>
          <div role="radiogroup" aria-label={t('os.settings.accent.label')} className="flex flex-wrap gap-3">
            {ACCENTS.map((a) => {
              const on = s.accent === a
              const name = tt(`os.settings.accent.${a}`)
              return (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={name}
                  data-accent-option={a}
                  onClick={() => updateSettings({ accent: a })}
                  className={`tip relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 ${on ? 'border-fg' : 'border-transparent'}`}
                  data-tip={name}
                >
                  <span className="h-8 w-8 rounded-full shadow-inner ring-1 ring-black/20" style={{ background: ACCENT_COLORS[a] }} />
                  {on && <Check size={15} strokeWidth={3} className="absolute text-graphite" />}
                </button>
              )
            })}
          </div>
          <p className="mt-3 font-mono text-[11px] text-faint">
            {tt(`os.settings.accent.${s.accent}`)}
            {s.accent === DEFAULTS.accent ? ` · ${t('os.settings.accent.default')}` : ''}
          </p>
        </Row>
      </>
    ),
    language: (
      <Row stacked title={t('os.settings.language.label')} hint={t('os.settings.language.hint')}>
        <div role="radiogroup" aria-label={t('os.settings.language.label')} className="grid gap-2 @xl:grid-cols-3">
          {languages.map((l) => {
            const on = i18n.language === l.code
            return (
              <button
                key={l.code}
                type="button"
                role="radio"
                aria-checked={on}
                lang={l.code}
                data-lang-option={l.code}
                onClick={() => void i18n.changeLanguage(l.code)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${on ? 'border-primary bg-glow' : 'border-card-border bg-sheet hover:border-line-strong'}`}
              >
                <span>
                  <span className="block text-[14px] font-semibold">{l.name}</span>
                  <span className="block font-mono text-[11px] text-faint">{l.code}</span>
                </span>
                {on && <Check size={16} className="text-primary" />}
              </button>
            )
          })}
        </div>
      </Row>
    ),
    animation: (
      <Row stacked title={t('os.settings.motion.label')} hint={t('os.settings.motion.hint')}>
        <Segmented
          label={t('os.settings.motion.label')}
          value={s.motion}
          options={MOTIONS.map((m) => ({ id: m, label: t(`os.settings.motion.${m}`) }))}
          onChange={(motion) => updateSettings({ motion })}
        />
        <p className="mt-3 text-[12px] text-faint">
          {t('os.settings.motion.systemNow', {
            value: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? t('os.settings.motion.less') : t('os.settings.motion.more'),
          })}
        </p>
        <p aria-live="polite" className="sr-only">
          {isReducedMotion(s) ? t('os.settings.motion.reduced') : t('os.settings.motion.full')}
        </p>
      </Row>
    ),
    sound: (
      <Row title={t('os.settings.sound.label')} hint={t('os.settings.sound.hint')}>
        <div className="flex items-center gap-3">
          {s.sound && (
            <button
              type="button"
              onClick={() => playSound('done')}
              data-sound="off"
              className="rounded-lg border border-card-border px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-primary hover:text-primary"
            >
              {t('os.settings.sound.test')}
            </button>
          )}
          <Toggle
            checked={s.sound}
            label={t('os.settings.sound.toggle')}
            onChange={(sound) => {
              updateSettings({ sound })
              if (sound) setTimeout(() => playSound('switch'), 30)
            }}
          />
        </div>
      </Row>
    ),
    reset: (
      <Row title={t('os.settings.reset.label')} hint={t('os.settings.reset.hint')}>
        <button
          type="button"
          onClick={reset}
          data-reset
          className="btn-glow inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2.5 text-[13px] font-semibold transition-all hover:border-primary hover:text-primary"
        >
          <RotateCcw size={15} />
          {t('os.settings.reset.button')}
        </button>
      </Row>
    ),
  }

  return (
    <div className="@container h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col @2xl:flex-row">
        <nav aria-label={t('os.settings.nav')} className="shrink-0 border-b border-card-border bg-bg-subtle/50 @2xl:w-56 @2xl:border-b-0 @2xl:border-r">
          <div className="hidden items-center gap-2.5 px-4 pb-2 pt-4 @2xl:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-graphite text-neon ring-1 ring-neon/40">
              <Monitor size={17} />
            </span>
            <span className="text-[13.5px] font-semibold">{t('os.titles.settings')}</span>
          </div>
          <ul className="flex gap-1 overflow-x-auto p-2 [scrollbar-width:none] @2xl:flex-col @2xl:overflow-visible">
            {CATS.map(({ id, icon: Icon }) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  data-settings-cat={id}
                  aria-current={cat === id ? 'page' : undefined}
                  onClick={() => {
                    setCat(id)
                    setNotice('')
                  }}
                  className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${cat === id ? 'bg-graphite text-neon' : 'text-muted hover:bg-fg/10 hover:text-fg'}`}
                >
                  <Icon size={15} />
                  {t(`os.settings.cat.${id}`)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 py-5 @2xl:px-8">
            <Eyebrow>{t(`os.settings.cat.${cat}`)}</Eyebrow>
            <p className="mt-1 text-[12.5px] text-muted">{t('os.settings.subtitle')}</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: easeOut }}
                className="mt-2"
              >
                {panels[cat]}
              </motion.div>
            </AnimatePresence>
            <p role="status" className="min-h-5 text-[12.5px] text-primary">
              {notice}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
