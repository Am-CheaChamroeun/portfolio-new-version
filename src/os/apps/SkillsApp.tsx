import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockImages } from '../../data/images'
import { skillGroups } from '../../data/portfolio'
import { TechIcon } from '../../lib/icons'
import { Eyebrow, SearchField, StatusBar, Toolbar } from './shared'

const SEGMENTS = 12
const LEVELS = ['expert', 'advanced', 'proficient', 'learning'] as const
type Level = (typeof LEVELS)[number]
const levelKey = (l: number): Level => (l >= 11 ? 'expert' : l >= 9 ? 'advanced' : l >= 7 ? 'proficient' : 'learning')
const pad = (n: number) => String(n).padStart(2, '0')

/** Skills → a developer-tools panel: categories, search + level filter, meters per tool. */
export default function SkillsApp() {
  const { t } = useTranslation()
  const [group, setGroup] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<Level | 'all'>('all')
  const label = (key: string) => t(`content.skills.${key}` as 'content.skills.frontend')

  const total = skillGroups.reduce((n, g) => n + g.skills.length, 0)
  const panels = useMemo(() => {
    const q = query.trim().toLowerCase()
    return skillGroups
      .filter((g) => group === 'all' || g.key === group)
      .map((g) => ({
        ...g,
        skills: g.skills.filter((s) => (level === 'all' || levelKey(s.level) === level) && (!q || s.name.toLowerCase().includes(q))),
      }))
      .filter((g) => g.skills.length > 0)
    // label() only depends on i18n via t
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, query, level])
  const shown = panels.reduce((n, g) => n + g.skills.length, 0)

  const chip = (on: boolean) =>
    `rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors ${
      on ? 'border-graphite bg-graphite text-neon dark:border-neon/50' : 'border-card-border bg-sheet text-muted hover:border-line-strong hover:text-fg'
    }`

  return (
    <div className="@container flex h-full min-h-0 flex-col">
      <Toolbar>
        <SearchField value={query} onChange={(e) => setQuery(e.target.value)} label={t('os.skills.searchLabel')} placeholder={t('os.skills.search')} className="w-full @lg:w-60" />
        <div role="group" aria-label={t('os.skills.levelFilter')} className="flex flex-wrap gap-1">
          <button type="button" aria-pressed={level === 'all'} onClick={() => setLevel('all')} className={chip(level === 'all')}>
            {t('os.skills.all')}
          </button>
          {LEVELS.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={chip(level === l)}>
              {t(`skills.levels.${l}`)}
            </button>
          ))}
        </div>
      </Toolbar>

      <div className="flex min-h-0 flex-1 flex-col @2xl:flex-row">
        <nav
          aria-label={t('os.skills.categories')}
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-card-border bg-bg-subtle/50 p-2 @2xl:w-52 @2xl:flex-col @2xl:overflow-y-auto @2xl:border-b-0 @2xl:border-r"
        >
          <Eyebrow className="hidden px-2 pb-1 pt-1 @2xl:block">{t('os.skills.categories')}</Eyebrow>
          {[{ key: 'all', icon: null, count: total }, ...skillGroups.map((g) => ({ key: g.key, icon: g.icon, count: g.skills.length }))].map((g) => {
            const on = group === g.key
            const Icon = g.icon
            return (
              <button
                key={g.key}
                type="button"
                aria-pressed={on}
                onClick={() => setGroup(g.key)}
                className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  on ? 'bg-graphite text-neon' : 'text-muted hover:bg-fg/10 hover:text-fg'
                }`}
              >
                {Icon ? <Icon size={15} strokeWidth={1.7} className="shrink-0" /> : <span className="h-[15px] w-[15px] shrink-0 rounded-sm border border-current opacity-60" />}
                <span className="whitespace-nowrap">{g.key === 'all' ? t('os.skills.all') : label(g.key)}</span>
                <span className={`ml-auto pl-2 font-mono text-[10.5px] ${on ? 'text-steel' : 'text-faint'}`}>{pad(g.count)}</span>
              </button>
            )
          })}
        </nav>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
          {panels.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <img src={mockImages.skillsDecoration} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-24 w-auto opacity-80" />
              <p className="text-sm text-faint">{t('os.skills.none')}</p>
            </div>
          )}
          {panels.map((g) => {
            const Icon = g.icon
            return (
              <section key={g.key} aria-label={label(g.key)} className="overflow-hidden rounded-xl border border-card-border bg-sheet">
                <header className="flex items-center gap-2.5 border-b border-card-border bg-titlebar px-3.5 py-2">
                  <Icon size={15} strokeWidth={1.8} className="text-primary" />
                  <h3 className="text-[13px] font-semibold">{label(g.key)}</h3>
                  <span className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px] text-faint">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
                    {pad(g.skills.length)}
                  </span>
                </header>
                <ul className="divide-y divide-card-border">
                  {g.skills.map((s, i) => (
                    <li key={s.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3.5 py-2.5 @lg:grid-cols-[auto_1fr_auto_5.5rem]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm ring-1 ring-black/5">
                        <TechIcon name={s.icon} size={18} />
                      </span>
                      <span className="truncate text-[14px] font-medium">{s.name}</span>
                      <span className="flex gap-[3px]" role="img" aria-label={t('skills.meterAria', { level: s.level, max: SEGMENTS })}>
                        {Array.from({ length: SEGMENTS }, (_, n) => (
                          <motion.span
                            key={n}
                            initial={{ scaleY: 0.2, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            transition={{ delay: 0.04 * i + 0.018 * n, duration: 0.18 }}
                            className={`h-3.5 w-[4px] origin-bottom rounded-[1.5px] ${n < s.level ? 'bg-accent shadow-[0_0_6px_-1px_var(--accent)]' : 'bg-fg/12'}`}
                          />
                        ))}
                      </span>
                      <span className="hidden text-right font-mono text-[11px] text-faint @lg:block">{t(`skills.levels.${levelKey(s.level)}`)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>

      <StatusBar>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span>{t('os.skills.results', { shown, total })}</span>
      </StatusBar>
    </div>
  )
}
