import { isReducedMotion } from '../../lib/settings'
import { animate } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { GithubIcon } from '../../lib/icons'
import { Globe } from '../../components/effects/Globe'
import { heroTelemetry, profile, skillGroups, stats, terminalCommands, terminalInfoLines } from '../../data/portfolio'
import { useInterval } from '../../hooks/useInterval'
import { Eyebrow } from './shared'
import GithubActivity from './GithubActivity'

const STARTED = Date.now()
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const pad = (n: number) => String(n).padStart(2, '0')

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [value])
  return (
    <span className="tabular-nums">
      {n}
      <span className="text-primary">{suffix}</span>
    </span>
  )
}

/** Session uptime — real time since the page loaded. */
function SessionClock() {
  const [s, setS] = useState(() => Math.floor((Date.now() - STARTED) / 1000))
  useInterval(() => setS(Math.floor((Date.now() - STARTED) / 1000)), 1000)
  return (
    <span className="tabular-nums">
      {pad(Math.floor(s / 3600))}:{pad(Math.floor(s / 60) % 60)}:{pad(s % 60)}
    </span>
  )
}

/** Overall gauge as an SVG ring */
function Gauge({ percent }: { percent: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const [p, setP] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setP(percent))
    return () => cancelAnimationFrame(id)
  }, [percent])
  return (
    <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90" aria-hidden="true">
      <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="7" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p / 100)}
        style={{
          transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
          filter: 'drop-shadow(0 0 4px var(--accent))',
        }}
      />
    </svg>
  )
}

type Shown = { cmd: string; out?: string; info?: boolean; typing: boolean }

/** Deploy log: the real deploy commands, typed out on a loop. */
function DeployLog() {
  const { t, i18n } = useTranslation()
  const lines = useMemo(() => {
    const outputs = t('content.terminal', { returnObjects: true })
    return terminalCommands.map((cmd, i) => ({
      cmd,
      out: outputs[i] || undefined,
      info: terminalInfoLines.includes(i),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])
  const [shown, setShown] = useState<Shown[]>(() => lines.map((l) => ({ ...l, typing: false })))
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShown(lines.map((l) => ({ ...l, typing: false })))
    if (isReducedMotion()) return
    let cancelled = false
    ;(async () => {
      await sleep(500)
      while (!cancelled) {
        const acc: Shown[] = []
        for (const line of lines) {
          acc.push({ cmd: '', typing: true })
          for (let i = 1; i <= line.cmd.length && !cancelled; i++) {
            acc[acc.length - 1] = { cmd: line.cmd.slice(0, i), typing: true }
            setShown([...acc])
            await sleep(34)
          }
          await sleep(380)
          acc[acc.length - 1] = { ...line, typing: false }
          setShown([...acc])
          await sleep(line.out ? 800 : 280)
          if (cancelled) return
        }
        await sleep(3000)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [lines])

  return (
    <div
      ref={box}
      className="min-h-[9.5rem] space-y-1 rounded-b-xl bg-graphite p-3.5 font-mono text-[12px] leading-relaxed text-warm"
      aria-label={t('os.monitor.log')}
      role="log"
    >
      {shown.map((l, i) => (
        <div key={i}>
          <div className="flex gap-2">
            <span className="text-neon/70">{pad(i + 1)}</span>
            <span className="break-all">
              {l.cmd}
              {l.typing && <span className="cursor-blink text-neon">▍</span>}
            </span>
          </div>
          {l.out && <div className={`pl-7 text-[11.5px] ${l.info ? 'text-neon' : 'text-steel'}`}>{l.out}</div>}
        </div>
      ))}
    </div>
  )
}

const Panel = ({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) => (
  <section aria-label={title} className={`overflow-hidden rounded-xl border border-card-border bg-sheet ${className}`}>
    <header className="flex items-center gap-2 border-b border-card-border bg-titlebar px-3.5 py-2">
      <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
      <h3 className="text-[12.5px] font-semibold">{title}</h3>
    </header>
    {children}
  </section>
)

/** Statistics → System Monitor: counters, skill load, session telemetry, globe and the deploy log. */
export default function MonitorApp() {
  const { t } = useTranslation()
  // derived from the skill levels in portfolio.ts — nothing is invented
  const load = skillGroups.map((g) => ({
    key: g.key,
    percent: Math.round((g.skills.reduce((n, s) => n + s.level, 0) / (g.skills.length * 12)) * 100),
  }))
  const all = skillGroups.flatMap((g) => g.skills)
  const overall = Math.round((all.reduce((n, s) => n + s.level, 0) / (all.length * 12)) * 100)
  const [grow, setGrow] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrow(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const [tab, setTab] = useState<'overview' | 'github'>('overview')

  return (
    <div className="@container h-full overflow-y-auto p-4">
      <div role="tablist" aria-label={t('os.monitor.tabs.label')} className="mb-4 inline-flex rounded-lg border border-card-border bg-bg-subtle p-0.5">
        {(['overview', 'github'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`mon-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`mon-panel-${id}`}
            data-monitor-tab={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${tab === id ? 'bg-graphite text-neon' : 'text-muted hover:text-fg'}`}
          >
            {id === 'github' && <GithubIcon size={13} />}
            {t(`os.monitor.tabs.${id}`)}
          </button>
        ))}
      </div>
      {tab === 'github' ? (
        <div role="tabpanel" id="mon-panel-github" aria-labelledby="mon-tab-github">
          <GithubActivity />
        </div>
      ) : (
        <div role="tabpanel" id="mon-panel-overview" aria-labelledby="mon-tab-overview">
          <Eyebrow className="mb-2">{t('os.monitor.metrics')}</Eyebrow>
          <ul className="grid grid-cols-2 gap-2.5 @2xl:grid-cols-4">
            {stats.map((s) => (
              <li key={s.id} className="rounded-xl border border-card-border bg-bg-subtle/60 px-4 py-3.5">
                <p className="text-3xl font-semibold tracking-tight @2xl:text-4xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-[12px] text-muted">{t(`content.stats.${s.id}` as 'content.stats.projects')}</p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-fg/10" aria-hidden="true">
                  <div
                    className="h-full origin-left rounded-full bg-accent transition-transform duration-[1400ms] ease-out"
                    style={{ transform: `scaleX(${grow ? 1 : 0})` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-3 @3xl:grid-cols-[1.3fr_1fr]">
            <Panel title={t('os.monitor.skillLoad')}>
              <div className="flex items-center gap-5 p-4">
                <div className="relative shrink-0 text-fg">
                  <Gauge percent={overall} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-semibold tabular-nums">{overall}%</span>
                    <span className="text-[9.5px] uppercase tracking-wider text-faint">{t('os.monitor.overall')}</span>
                  </div>
                </div>
                <ul className="min-w-0 flex-1 space-y-2.5">
                  {load.map((g) => (
                    <li key={g.key}>
                      <div className="mb-1 flex justify-between text-[12px]">
                        <span className="truncate font-medium">{t(`content.skills.${g.key}` as 'content.skills.frontend')}</span>
                        <span className="font-mono text-faint">{g.percent}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
                        <div
                          className="h-full origin-left rounded-full bg-accent shadow-[0_0_8px_-1px_var(--accent)] transition-transform duration-[1200ms] ease-out"
                          style={{
                            width: `${g.percent}%`,
                            transform: `scaleX(${grow ? 1 : 0})`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            <Panel title={t('os.monitor.system')}>
              <dl className="grid grid-cols-2 gap-px bg-card-border">
                {[
                  [t('os.monitor.session'), <SessionClock key="s" />],
                  [t('os.monitor.region'), heroTelemetry.region],
                  [t('os.monitor.deploys'), String(heroTelemetry.deploys)],
                  [t('os.monitor.uptime'), heroTelemetry.uptime],
                ].map(([k, v], i) => (
                  <div key={i} className="bg-sheet px-3.5 py-3">
                    <dt className="truncate text-[11px] text-faint">{k}</dt>
                    <dd className="mt-0.5 font-mono text-[15px] font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <div className="mt-3 grid gap-3 @3xl:grid-cols-[1.3fr_1fr]">
            <Panel title={t('os.monitor.log')}>
              <DeployLog />
            </Panel>
            <Panel title={t('os.monitor.globe')}>
              <div className="relative mx-auto aspect-square w-full max-w-[220px] p-3">
                <Globe marker={profile.globeMarker} />
              </div>
              <p className="pb-3 text-center text-[12.5px] font-medium">
                {profile.locationFlag} {t('content.profile.location')}
              </p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}
