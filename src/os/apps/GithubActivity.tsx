import { ArrowUpRight, GitCommitHorizontal, GitFork, GitPullRequest, Package, RefreshCw, Star, TriangleAlert, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MockBadge } from '../../components/ui/MockBadge'
import { githubUsername } from '../../data/github'
import { GithubIcon } from '../../lib/icons'
import { languages, formatDate } from '../../i18n'
import { loadGithub, peekGithub, type GhData, type GhDay, type GhEvent, type GhResult } from '../../lib/githubData'
import { Eyebrow, Skeleton, SmartImage } from './shared'

type Tt = (k: string, o?: object) => string
const num = (n: number, lng: string) => new Intl.NumberFormat(languages.find((l) => l.code === lng)?.dateLocale).format(n)

function ago(iso: string | number, lng: string) {
  const locale = languages.find((l) => l.code === lng)?.dateLocale ?? 'en-GB'
  const s = (new Date(iso).getTime() - Date.now()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  for (const [u, sec] of units) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), u)
  return rtf.format(0, 'second')
}

function Card({ title, aside, children, className = '' }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={`overflow-hidden rounded-xl border border-card-border bg-sheet ${className}`}>
      <header className="flex items-center gap-2 border-b border-card-border bg-titlebar px-3.5 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
        <h3 className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{title}</h3>
        {aside}
      </header>
      {children}
    </section>
  )
}

/** Contribution heatmap — columns are weeks, rows are weekdays; the accent colour sets the intensity. */
function Heatmap({ days, source }: { days: GhDay[]; source: 'calendar' | 'events' }) {
  const { t, i18n } = useTranslation()
  const tt = t as unknown as Tt
  const locale = languages.find((l) => l.code === i18n.language)?.dateLocale ?? 'en-GB'
  const [sel, setSel] = useState<GhDay | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  // ~13 weeks of events get bigger cells than a full year of calendar data
  const size = source === 'events' ? 20 : 11
  const step = size + 3

  const { cells, months, max, total } = useMemo(() => {
    const first = new Date(days[0].date + 'T00:00:00Z')
    const pad = first.getUTCDay()
    const cells: (GhDay | null)[] = [...Array<null>(pad).fill(null), ...days]
    const cols = Math.ceil(cells.length / 7)
    const months: { col: number; label: string }[] = []
    let lastMonth = -1
    for (let c = 0; c < cols; c++) {
      const d = cells.slice(c * 7, c * 7 + 7).find(Boolean)
      if (!d) continue
      const dt = new Date(d.date + 'T00:00:00Z')
      if (dt.getUTCMonth() !== lastMonth && (c > 0 || dt.getUTCDate() < 22)) {
        months.push({ col: c, label: new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(dt) })
        lastMonth = dt.getUTCMonth()
      }
    }
    const spaced = months.filter((m, i) => !months[i + 1] || months[i + 1].col - m.col >= 3)
    return { cells, months: spaced, max: Math.max(1, ...days.map((d) => d.count)), total: days.reduce((n, d) => n + d.count, 0) }
  }, [days, locale])

  useEffect(() => {
    scroller.current?.scrollTo({ left: scroller.current.scrollWidth })
  }, [days])

  const level = (n: number) => (n === 0 ? 0 : Math.max(1, Math.ceil((n / max) * 4)))
  const bg = (l: number) => (l === 0 ? 'rgb(128 128 128 / 0.14)' : `rgb(var(--neon-rgb) / ${[0, 0.28, 0.5, 0.75, 1][l]})`)
  const when = (d: GhDay) => formatDate(new Date(d.date + 'T00:00:00'), i18n.language, 'long')
  const caption = sel
    ? sel.count
      ? tt('os.monitor.github.heat.day', { count: sel.count, date: when(sel) })
      : tt('os.monitor.github.heat.none', { date: when(sel) })
    : tt('os.monitor.github.heat.hint')
  const totalText = tt('os.monitor.github.heat.total', { count: total })

  return (
    <div className="p-3.5">
      <div ref={scroller} className="overflow-x-auto pb-2">
        <div role="img" aria-label={tt('os.monitor.github.heat.aria', { total: totalText })} className="inline-block min-w-max">
          <div className="relative mb-1 h-4 text-[10.5px] text-faint" style={{ width: `${Math.ceil(cells.length / 7) * step}px` }}>
            {months.map((m) => (
              <span key={m.col} className="absolute top-0" style={{ left: m.col * step }}>
                {m.label}
              </span>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateRows: `repeat(7, ${size}px)`, gridAutoFlow: 'column', gridAutoColumns: `${size}px` }}
            onPointerLeave={() => setSel(null)}
          >
            {cells.map((d, i) =>
              d ? (
                <div
                  key={d.date}
                  data-heat-cell={d.date}
                  data-level={level(d.count)}
                  title={d.count ? tt('os.monitor.github.heat.day', { count: d.count, date: when(d) }) : tt('os.monitor.github.heat.none', { date: when(d) })}
                  onPointerEnter={() => setSel(d)}
                  onClick={() => setSel(d)}
                  className={`rounded-[3px] transition-transform duration-100 hover:scale-125 ${sel?.date === d.date ? 'ring-1 ring-fg' : ''}`}
                  style={{ background: bg(level(d.count)) }}
                />
              ) : (
                <div key={`p${i}`} />
              ),
            )}
          </div>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[11.5px] text-faint">
        <p role="status" aria-live="polite" className="min-h-4 text-muted">
          {caption}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {tt('os.monitor.github.heat.less')}
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: bg(l) }} />
          ))}
          {tt('os.monitor.github.heat.more')}
        </div>
      </div>
      <p className="mt-2 text-[11.5px] leading-5 text-faint">
        <span className="font-medium text-muted">{totalText}.</span>{' '}
        {source === 'calendar' ? tt('os.monitor.github.heat.calendar') : tt('os.monitor.github.heat.events')}
      </p>
    </div>
  )
}

const eventIcon = { push: GitCommitHorizontal, pr: GitPullRequest, create: Plus, release: Package, fork: GitFork } as const

function eventText(e: GhEvent, tt: Tt) {
  const k = 'os.monitor.github.activity.'
  switch (e.type) {
    case 'push':
      return tt(k + 'push', { count: Number(e.detail) || 1, repo: e.repo })
    case 'pr':
      return tt(k + 'pr', { action: e.detail, repo: e.repo })
    case 'create':
      return tt(k + 'create', { repo: e.repo })
    case 'release':
      return tt(k + 'release', { tag: e.detail, repo: e.repo })
    default:
      return tt(k + 'fork', { repo: e.repo })
  }
}

function Loading({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid gap-3 @3xl:grid-cols-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  )
}

function Board({
  data,
  stale,
  error,
  refreshing,
  onRefresh,
}: {
  data: GhData
  stale: boolean
  error: GhResult['error']
  refreshing: boolean
  onRefresh: () => void
}) {
  const { t, i18n } = useTranslation()
  const tt = t as unknown as Tt
  const lng = i18n.language
  const { profile } = data

  const shown = useMemo(() => data.repos.filter((r) => !r.fork).slice(0, 6), [data.repos])
  const langs = useMemo(() => {
    const own = data.repos.filter((r) => !r.fork && r.language)
    const map = new Map<string, number>()
    own.forEach((r) => map.set(r.language!, (map.get(r.language!) ?? 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n, pct: (n / own.length) * 100 }))
  }, [data.repos])
  const recent = data.events.slice(0, 8)

  const banner = error === 'rate' ? (stale ? 'rate' : 'rateNone') : error === 'network' && stale ? 'stale' : null

  return (
    <div className="space-y-3">
      {banner && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-card-border bg-bg-subtle/70 px-3 py-2 text-[12.5px] text-muted">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-primary" />
          {tt(`os.monitor.github.${banner}`, { when: ago(data.fetchedAt, lng) })}
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-card-border bg-bg-subtle/50 p-4 @xl:flex-row @xl:items-center">
        <div className="flex min-w-0 items-center gap-3.5">
          <SmartImage
            src={profile.avatar}
            alt={profile.login}
            className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/50"
            imgClassName="object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold">{profile.name ?? profile.login}</p>
            <a
              href={profile.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-primary hover:underline"
            >
              <GithubIcon size={13} />@{profile.login}
              <ArrowUpRight size={12} />
            </a>
            <p className="mt-0.5 text-[11.5px] text-faint">{tt('os.monitor.github.updated', { when: ago(data.fetchedAt, lng) })}</p>
          </div>
        </div>
        <dl className="grid flex-1 grid-cols-3 gap-2 @xl:max-w-sm @xl:ml-auto">
          {[
            ['repos', profile.repos],
            ['followers', profile.followers],
            ['following', profile.following],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-lg border border-card-border bg-sheet px-3 py-2 text-center">
              <dd className="text-xl font-semibold tabular-nums">{num(v as number, lng)}</dd>
              <dt className="truncate text-[11px] text-faint">{tt(`os.monitor.github.${k}`)}</dt>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="btn-glow inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-card-border px-3 py-2 text-[12px] font-medium transition-all hover:border-primary hover:text-primary disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? tt('os.monitor.github.refreshing') : tt('os.monitor.github.refresh')}
        </button>
      </div>

      <Card title={tt('os.monitor.github.heat.title')}>
        <Heatmap days={data.days} source={data.daysSource} />
      </Card>

      <div className="grid gap-3 @3xl:grid-cols-[1fr_1.1fr]">
        <Card title={tt('os.monitor.github.langs.title')}>
          <div className="p-3.5">
            {langs.length ? (
              <>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-fg/10" aria-hidden="true">
                  {langs.map((l, i) => (
                    <span key={l.name} style={{ width: `${l.pct}%`, background: 'var(--accent)', opacity: Math.max(0.25, 1 - i * 0.17) }} />
                  ))}
                </div>
                <ul className="mt-3 space-y-2">
                  {langs.map((l, i) => (
                    <li key={l.name} className="flex items-center gap-2.5 text-[12.5px]">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: 'var(--accent)', opacity: Math.max(0.25, 1 - i * 0.17) }} />
                      <span className="min-w-0 flex-1 truncate font-medium">{l.name}</span>
                      <span className="text-faint">{tt('os.monitor.github.langs.repos', { count: l.n })}</span>
                      <span className="w-10 text-right font-mono tabular-nums text-muted">{Math.round(l.pct)}%</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-[12.5px] text-muted">{tt('os.monitor.github.langs.none')}</p>
            )}
            <p className="mt-3 text-[11.5px] leading-5 text-faint">{tt('os.monitor.github.langs.note')}</p>
          </div>
        </Card>

        <Card title={tt('os.monitor.github.activity.title')}>
          {recent.length ? (
            <ul className="divide-y divide-card-border">
              {recent.map((e) => {
                const Icon = eventIcon[e.type]
                return (
                  <li key={e.id} className="flex items-center gap-2.5 px-3.5 py-2 text-[12.5px]">
                    <Icon size={14} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{eventText(e, tt)}</span>
                    <time dateTime={e.at} className="shrink-0 text-[11px] text-faint">
                      {ago(e.at, lng)}
                    </time>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="p-3.5 text-[12.5px] text-muted">{tt('os.monitor.github.activity.empty')}</p>
          )}
        </Card>
      </div>

      <div>
        <Eyebrow className="mb-2">{tt('os.monitor.github.reposTitle')}</Eyebrow>
        {shown.length ? (
          <ul className="grid gap-2.5 @2xl:grid-cols-2 @4xl:grid-cols-3">
            {shown.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={tt('os.monitor.github.open', { name: r.name })}
                  className="group flex h-full flex-col rounded-xl border border-card-border bg-sheet p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_12px_30px_-16px_rgb(var(--neon-rgb)/0.45)]"
                >
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate font-mono text-[13px] font-semibold text-primary">{r.name}</p>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </div>
                  <p className="mt-1.5 line-clamp-2 min-h-10 text-[12.5px] leading-5 text-muted">{r.description ?? tt('os.monitor.github.noDescription')}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11.5px] text-faint">
                    {r.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        {r.language}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1" title={tt('os.monitor.github.stars')}>
                      <Star size={12} />
                      {num(r.stars, lng)}
                    </span>
                    <span className="inline-flex items-center gap-1" title={tt('os.monitor.github.forks')}>
                      <GitFork size={12} />
                      {num(r.forks, lng)}
                    </span>
                    <span className="ml-auto">{tt('os.monitor.github.pushed', { when: formatDate(new Date(r.pushedAt), lng, 'short') })}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-muted">{tt('os.monitor.github.reposEmpty')}</p>
        )}
      </div>
    </div>
  )
}

/** System Monitor → GitHub: profile, contribution heatmap, languages, repositories and recent activity. */
export default function GithubActivity() {
  const { t } = useTranslation()
  const tt = t as unknown as Tt
  const username = githubUsername()
  const [res, setRes] = useState<GhResult | null>(() => {
    const c = username ? peekGithub(username) : null
    return c ? { data: c, stale: false, error: null } : null
  })
  const [refreshing, setRefreshing] = useState(false)

  const run = useCallback(
    (force: boolean) => {
      if (!username) return
      setRefreshing(true)
      void loadGithub(username, force).then((r) => {
        setRes(r)
        setRefreshing(false)
      })
    },
    [username],
  )
  useEffect(() => run(false), [run])

  if (!username) {
    return (
      <div className="rounded-xl border border-dashed border-card-border bg-bg-subtle/50 p-5">
        <MockBadge kind="placeholder" />
        <h3 className="mt-3 flex items-center gap-2 text-[15px] font-semibold">
          <GithubIcon size={16} />
          {tt('os.monitor.github.notConfigured')}
        </h3>
        <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted">{tt('os.monitor.github.notConfiguredHint')}</p>
      </div>
    )
  }
  if (!res) return <Loading label={tt('os.monitor.github.loading')} />
  if (!res.data) {
    const profileUrl = `https://github.com/${username}`
    return (
      <div className="rounded-xl border border-card-border bg-bg-subtle/50 p-5" role="status">
        <p className="flex items-start gap-2 text-[13px] text-muted">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-primary" />
          {tt(`os.monitor.github.${res.error === 'rate' ? 'rateNone' : res.error === 'notfound' ? 'notfound' : 'network'}`)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-glow inline-flex items-center gap-2 rounded-lg border border-card-border px-3.5 py-2 text-[12.5px] font-medium hover:border-primary hover:text-primary"
          >
            <GithubIcon size={14} />
            {tt('os.monitor.github.openProfile')}
          </a>
          {res.error !== 'notfound' && (
            <button
              type="button"
              onClick={() => run(true)}
              disabled={refreshing}
              className="btn-glow inline-flex items-center gap-2 rounded-lg border border-card-border px-3.5 py-2 text-[12.5px] font-medium hover:border-primary hover:text-primary disabled:opacity-60"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              {tt('os.monitor.github.refresh')}
            </button>
          )}
        </div>
      </div>
    )
  }
  return <Board data={res.data} stale={res.stale} error={res.error} refreshing={refreshing} onRefresh={() => run(true)} />
}
