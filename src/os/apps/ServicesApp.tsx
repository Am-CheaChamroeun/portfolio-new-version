import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockImages } from '../../data/images'
import { highlightedServices, services } from '../../data/portfolio'
import { uniqueTechnologies } from '../../lib/specializations'
import { SearchField, StatusBar, TechBadge, Toolbar } from './shared'

/** i18n returns the key text when a list is missing — only accept a real list */
const tagsOf = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])

/** Specializations → a technical dashboard: KPI tiles and a card per practice, with a live filter. */
export default function ServicesApp() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return services
      .map((s, i) => ({
        s,
        i,
        title: t(`content.services.${s.id}.title` as 'content.services.fullstack.title'),
        description: t(`content.services.${s.id}.description` as 'content.services.fullstack.description'),
        // domain / practice badges (translated) — the programming technologies come from the data
        tags: tagsOf(t(`content.services.${s.id}.tags` as 'content.about.paragraphs', { returnObjects: true, defaultValue: [] })),
      }))
      .filter(({ s, title, description, tags }) => !q || `${title} ${description} ${(s.technologies ?? []).join(' ')} ${tags.join(' ')}`.toLowerCase().includes(q))
  }, [query, t])

  const kpis = [
    { label: t('os.services.kpiPractices'), value: services.length },
    { label: t('os.services.kpiTech'), value: uniqueTechnologies.length },
    { label: t('os.services.kpiCore'), value: highlightedServices },
  ]

  return (
    <div className="@container flex h-full min-h-0 flex-col">
      <Toolbar>
        <SearchField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          label={t('os.services.searchLabel')}
          placeholder={t('os.services.search')}
          className="w-full @lg:w-64"
        />
      </Toolbar>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ul className="grid grid-cols-3 gap-2.5">
          {kpis.map((k) => (
            <li key={k.label} className="rounded-xl border border-card-border bg-bg-subtle/60 px-3.5 py-3">
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-primary @lg:text-3xl">{k.value}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-faint">{k.label}</p>
            </li>
          ))}
        </ul>

        {list.length === 0 && <p className="py-12 text-center text-sm text-faint">{t('os.services.none')}</p>}
        <ul className="mt-4 grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3" aria-live="polite">
          {list.map(({ s, i, title, description, tags }) => {
            const hot = !!s.core
            const Icon = s.icon
            const art = mockImages.specializations[s.id]
            return (
              <li
                key={s.id}
                className={`group flex flex-col overflow-hidden rounded-xl border bg-sheet transition-colors ${hot ? 'border-primary/50' : 'border-card-border hover:border-line-strong'}`}
              >
                <div className="relative flex h-24 items-center justify-center overflow-hidden border-b border-card-border bg-graphite">
                  <div className="grid-bg absolute inset-0 [--grid-line:rgba(245,245,233,0.05)]" />
                  {art && (
                    <img
                      src={art}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="relative h-16 w-auto opacity-90 transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-2.5 top-2.5 font-mono text-[10px] text-neon/80">{String(i + 1).padStart(2, '0')}</span>
                  {hot && (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-neon px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-graphite">
                      {t('os.services.core')}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-graphite text-neon ring-1 ring-neon/30">
                      <Icon size={14} strokeWidth={1.7} />
                    </span>
                    <h3 className="text-[14px] font-semibold leading-snug">{title}</h3>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{description}</p>
                  <div className="mt-auto pt-3">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint">{t('services.spec')}</p>
                    <ul className="mt-1.5 flex flex-wrap gap-1">
                      {(s.technologies ?? []).map((name) => (
                        <li key={name}>
                          <TechBadge name={name} compact />
                        </li>
                      ))}
                      {tags.map((tag) => (
                        <li key={tag} className="rounded-md border border-card-border bg-bg-subtle px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <StatusBar>
        <span>
          {t('os.services.results', {
            shown: list.length,
            total: services.length,
          })}
        </span>
      </StatusBar>
    </div>
  )
}
