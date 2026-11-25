import { about, education, profile, skillGroups, socials } from '../data/portfolio'
import { formatDate, languages } from '../i18n'
import { formatDuration, formatMonth, monthsBetween } from '../lib/experience'
import { visibleExperience } from '../data/visible'
import { isReal, downloadCv, openExternal } from '../lib/links'
import { techIcons } from '../lib/tech'
import { apps, type AppId } from './registry'
import { formatTime } from './useNow'

/**
 * The terminal's whole vocabulary. Input is only ever matched against this list — nothing the
 * visitor types is evaluated, run as code or sent anywhere, so the terminal stays safe.
 */
export const COMMANDS = [
  'help',
  'whoami',
  'about',
  'projects',
  'skills',
  'education',
  'experience',
  'contact',
  'github',
  'linkedin',
  'cv',
  'date',
  'clear',
  'history',
  'neofetch',
  'exit',
] as const
export type Command = (typeof COMMANDS)[number]

export type Line =
  | {
      kind: 'text' | 'accent' | 'success' | 'error' | 'muted' | 'heading'
      text: string
    }
  | { kind: 'kv'; key: string; value: string; href?: string }
  | { kind: 'help'; cmd: string; desc: string }
  | { kind: 'suggest'; cmds: string[] }
  | { kind: 'neofetch'; rows: [string, string][] }

export type Result = {
  lines: Line[]
  clear?: boolean
  /** a side effect run after the output is shown (navigate, open a link) */
  effect?: () => void
  /** a follow-up that may add more output, e.g. once the CV check finishes */
  after?: () => Promise<Line[]>
}

type Translate = (key: string, options?: Record<string, unknown>) => string
export type Context = {
  t: Translate
  /** raw access for list values (returnObjects) */
  list: (key: string) => string[]
  lang: string
  openApp: (id: AppId) => void
  history: string[]
}

const started = Date.now()
const isPlaceholder = (s: string) => /^\[.*\]$/.test(s.trim())

/** Closest command for a typo (prefix match first, then edit distance ≤ 2). */
function closest(input: string): Command | undefined {
  const prefix = COMMANDS.find((c) => c.startsWith(input) || input.startsWith(c))
  if (prefix) return prefix
  const dist = (a: string, b: string) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
    for (let j = 1; j <= b.length; j++) d[0][j] = j
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    return d[a.length][b.length]
  }
  const best = COMMANDS.map((c) => ({ c, d: dist(input, c) })).sort((a, b) => a.d - b.d)[0]
  return best.d <= 2 ? best.c : undefined
}

export function runCommand(raw: string, ctx: Context): Result {
  const { t } = ctx
  const word = raw.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  const nav = (id: AppId, message?: string): Result => ({
    lines: [
      {
        kind: 'success',
        text: message ?? t('os.terminal.navigating', { app: t(`os.apps.${id}`) }),
      },
    ],
    effect: () => ctx.openApp(id),
  })
  const link = (name: string, url: string): Result =>
    isReal(url)
      ? {
          lines: [{ kind: 'success', text: t('os.terminal.opening', { name }) }],
          effect: () => openExternal(url),
        }
      : {
          lines: [{ kind: 'error', text: t('os.terminal.linkMissing', { name }) }],
        }

  switch (word as Command) {
    case 'help':
      return {
        lines: [
          { kind: 'heading', text: t('os.terminal.helpTitle') },
          ...COMMANDS.map((c): Line => ({
            kind: 'help',
            cmd: c,
            desc: t(`os.terminal.desc.${c}`),
          })),
        ],
      }
    case 'whoami': {
      const bio = ctx
        .list('content.about.paragraphs')
        .map((p) => p.replace(/\[[^\]]*\]/g, '').trim())
        .filter(Boolean)
      return {
        lines: [
          { kind: 'accent', text: profile.name },
          { kind: 'muted', text: t('content.profile.role') },
          ...bio.map((p): Line => ({ kind: 'text', text: p })),
          { kind: 'suggest', cmds: ['skills', 'projects', 'contact'] },
        ],
      }
    }
    case 'about':
      return nav('about')
    case 'projects':
      return nav('projects')
    case 'exit':
      return nav('about', t('os.terminal.exit'))
    case 'skills':
      return {
        lines: [
          { kind: 'heading', text: t('os.terminal.sections.skills') },
          ...skillGroups.map((g): Line => ({
            kind: 'kv',
            key: t(`content.skills.${g.key}`),
            value: g.skills.map((s) => s.name).join(' · '),
          })),
        ],
      }
    case 'education': {
      const lines: Line[] = [{ kind: 'heading', text: t('os.terminal.sections.education') }]
      education.forEach((e) => {
        lines.push({ kind: 'accent', text: e.school })
        lines.push({
          kind: 'muted',
          text: `${(t as unknown as (k: string, o?: object) => string)(`content.education.${e.id}.degree`)} · ${
            e.graduation ? (t as unknown as (k: string, o?: object) => string)('education.graduated', { year: e.period }) : e.period
          }${e.current ? ` · ${t('os.terminal.current')}` : ''}`,
        })
        ctx.list(`content.education.${e.id}.details`).forEach((d) => lines.push({ kind: isPlaceholder(d) ? 'muted' : 'text', text: d }))
      })
      return { lines }
    }
    case 'experience': {
      const lines: Line[] = [{ kind: 'heading', text: t('os.terminal.sections.experience') }]
      // only real entries — nothing is invented while the list is empty
      if (!visibleExperience.length) return { lines: [{ kind: 'muted', text: t('os.terminal.noExperience') }] }
      visibleExperience.forEach((e) => {
        const months = monthsBetween(e.start, e.end)
        lines.push({ kind: 'accent', text: `${t(`content.experience.${e.id}.title`)} — ${e.company}` })
        lines.push({
          kind: 'muted',
          text: [
            `${formatMonth(e.start, ctx.lang)} – ${e.end ? formatMonth(e.end, ctx.lang) : t('experience.present')}`,
            months !== null ? formatDuration(months, ctx.lang) : '',
            e.employmentType ? t(`experience.types.${e.employmentType}`) : '',
          ]
            .filter(Boolean)
            .join(' · '),
        })
        const description = t(`content.experience.${e.id}.description`)
        if (description && !isPlaceholder(description)) lines.push({ kind: 'text', text: description })
        // a missing list comes back as the key text, not an array — only print real lists
        const achievements = ctx.list(`content.experience.${e.id}.achievements`)
        if (Array.isArray(achievements)) achievements.forEach((a) => lines.push({ kind: isPlaceholder(a) ? 'muted' : 'text', text: `• ${a}` }))
      })
      return { lines }
    }
    case 'contact':
      return {
        lines: [
          { kind: 'heading', text: t('os.terminal.sections.contact') },
          {
            kind: 'kv',
            key: t('contact.email'),
            value: socials.email,
            href: isReal(socials.email) ? `mailto:${socials.email}` : undefined,
          },
          {
            kind: 'kv',
            key: t('contact.github'),
            value: socials.github.label,
            href: isReal(socials.github.url) ? socials.github.url : undefined,
          },
          {
            kind: 'kv',
            key: t('contact.linkedin'),
            value: socials.linkedin.label,
            href: isReal(socials.linkedin.url) ? socials.linkedin.url : undefined,
          },
          {
            kind: 'kv',
            key: t('contact.telegram'),
            value: socials.telegram.label,
            href: isReal(socials.telegram.url) ? socials.telegram.url : undefined,
          },
          { kind: 'suggest', cmds: ['github', 'linkedin'] },
        ],
      }
    case 'github':
      return link('GitHub', socials.github.url)
    case 'linkedin':
      return link('LinkedIn', socials.linkedin.url)
    case 'cv':
      return {
        lines: [{ kind: 'success', text: t('os.terminal.cvDownloading') }],
        after: async () => ((await downloadCv()) ? [] : [{ kind: 'error', text: t('os.terminal.cvMissing') }]),
      }
    case 'date': {
      const now = new Date()
      return {
        lines: [
          {
            kind: 'text',
            text: `${formatDate(now, ctx.lang, 'long')} · ${formatTime(now)}`,
          },
        ],
      }
    }
    case 'clear':
      return { lines: [], clear: true }
    case 'history':
      return {
        lines: ctx.history.length
          ? ctx.history.map((h, i): Line => ({
              kind: 'kv',
              key: String(i + 1).padStart(2, ' '),
              value: h,
            }))
          : [{ kind: 'muted', text: t('os.terminal.historyEmpty') }],
      }
    case 'neofetch': {
      const secs = Math.floor((Date.now() - started) / 1000)
      const lang = languages.find((l) => l.code === ctx.lang)?.name ?? ctx.lang
      return {
        lines: [
          {
            kind: 'neofetch',
            rows: [
              [t('os.terminal.neofetch.os'), 'DeveloperOS'],
              [t('os.terminal.neofetch.host'), `${profile.handle}${profile.handleSuffix}`],
              [t('os.terminal.neofetch.shell'), t('os.terminal.neofetch.shellValue')],
              [t('os.terminal.neofetch.theme'), t('os.terminal.neofetch.themeValue')],
              [t('os.terminal.neofetch.language'), lang],
              [t('os.terminal.neofetch.apps'), String(apps.length)],
              [t('os.terminal.neofetch.stack'), [...about.orbitInner, ...about.orbitOuter].map((k) => techIcons[k].title).join(', ')],
              [
                t('os.terminal.neofetch.uptime'),
                t('os.terminal.neofetch.uptimeValue', {
                  m: Math.floor(secs / 60),
                  s: secs % 60,
                }),
              ],
            ],
          },
        ],
      }
    }
  }

  if (!word) return { lines: [] }
  const guess = closest(word)
  const lines: Line[] = [
    {
      kind: 'error',
      text: t('os.terminal.unknown', { cmd: word.slice(0, 40) }),
    },
  ]
  if (guess)
    lines.push({
      kind: 'muted',
      text: t('os.terminal.didYouMean', { cmd: guess }),
    })
  lines.push({ kind: 'muted', text: t('os.terminal.typeHelp') })
  lines.push({
    kind: 'suggest',
    cmds: guess && guess !== 'help' ? [guess as string, 'help'] : ['help'],
  })
  return { lines }
}
