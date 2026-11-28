import { ArrowUpRight, CornerDownLeft, Download, Eye, Languages, Search, Sparkles, SunMoon, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { services, skillGroups, socials } from '../data/portfolio'
import { visibleProjects } from '../data/visible'
import { useTheme } from '../hooks/useTheme'
import { languages } from '../i18n'
import { easeOut } from '../lib/motion'
import { downloadCv, isReal, openExternal, viewCv } from '../lib/links'
import { GithubIcon, LinkedinIcon } from '../lib/icons'
import { useOSActions, useOSState } from './hooks'
import { appById, apps, type AppId } from './registry'

type Group = 'recent' | 'apps' | 'projects' | 'skills' | 'specializations' | 'actions' | 'language'
type Item = {
  id: string
  group: Group
  /** what the kind chip on the right says */
  kind: 'app' | 'project' | 'skill' | 'service' | 'action' | 'language'
  label: string
  /** extra words the search also matches (English app names, tech, etc.) */
  keywords: string
  icon: LucideIcon
  /** returns true to close the palette, false to stay open (e.g. to show a notice) */
  run: () => boolean | void | Promise<boolean | void>
  current?: boolean
}

const allProjects = visibleProjects
const groupOrder: Group[] = ['recent', 'apps', 'projects', 'skills', 'specializations', 'actions', 'language']

/** Better matches first: starts-with, then word-start, then anywhere. -1 = no match. */
function score(item: Item, q: string) {
  const label = item.label.toLowerCase()
  if (label.startsWith(q)) return 3
  if (label.split(/[\s./·-]+/).some((w) => w.startsWith(q))) return 2
  if (label.includes(q)) return 1.5
  return item.keywords.toLowerCase().includes(q) ? 1 : -1
}

const isMac = () => /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
export const shortcutLabel = () => (isMac() ? '⌘ K' : 'Ctrl K')

const kbd = 'rounded-md border border-edge bg-graphite px-1.5 py-0.5 font-mono text-[10.5px] text-steel'

/** Cmd/Ctrl + K quick search — apps, projects, skills, specializations, actions and language. */
export function CommandPalette() {
  const { t, i18n } = useTranslation()
  const { recent } = useOSState()
  const { openApp, openProject, setPalette } = useOSActions()
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const uid = useId()
  const close = () => setPalette(false)

  // focus the search box; hand focus back to whatever had it when the palette closes
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    return () => previous?.focus?.()
  }, [])

  const items = useMemo<Item[]>(() => {
    const out: Item[] = []
    const app = (id: AppId, group: Group): Item => ({
      id: `${group}-${id}`,
      group,
      kind: 'app',
      label: t(`os.apps.${id}`),
      keywords: `${id} ${t(`os.titles.${id}`)}`,
      icon: appById[id].icon,
      run: () => openApp(id),
    })
    recent.filter((id) => appById[id]).forEach((id) => out.push(app(id, 'recent')))
    apps.forEach((a) => out.push(app(a.id, 'apps')))

    allProjects.forEach((p) =>
      out.push({
        id: `project-${p.slug}`,
        group: 'projects',
        kind: 'project',
        label: p.name,
        keywords: `${p.slug} ${p.tech.join(' ')}`,
        icon: appById.projects.icon,
        run: () => openProject(p.slug),
      }),
    )

    skillGroups.forEach((g) =>
      g.skills.forEach((s) =>
        out.push({
          id: `skill-${s.name}`,
          group: 'skills',
          kind: 'skill',
          label: s.name,
          keywords: t(`content.skills.${g.key as 'frontend'}`),
          icon: g.icon,
          run: () => openApp('skills'),
        }),
      ),
    )

    services.forEach((s) =>
      out.push({
        id: `service-${s.id}`,
        group: 'specializations',
        kind: 'service',
        label: t(`content.services.${s.id as 'fullstack'}.title`),
        keywords: (s.technologies ?? []).join(' '),
        icon: s.icon,
        run: () => openApp('services'),
      }),
    )

    out.push({
      id: 'action-cv',
      group: 'actions',
      kind: 'action',
      label: t('os.palette.actions.cv'),
      keywords: 'cv resume curriculum vitae download save pdf',
      icon: Download,
      run: async () => {
        if (await downloadCv()) return true
        setNotice(t('os.palette.actions.cvMissing'))
        return false
      },
    })
    out.push({
      id: 'action-cv-view',
      group: 'actions',
      kind: 'action',
      label: t('os.palette.actions.cvView'),
      keywords: 'cv resume curriculum vitae view open read preview pdf',
      icon: Eye,
      run: () => {
        viewCv()
      },
    })
    ;(
      [
        ['github', socials.github.url, GithubIcon, 'os.palette.actions.github'],
        ['linkedin', socials.linkedin.url, LinkedinIcon, 'os.palette.actions.linkedin'],
      ] as const
    ).forEach(([id, url, Icon, key]) => {
      out.push({
        id: `action-${id}`,
        group: 'actions',
        kind: 'action',
        label: t(key),
        keywords: `${id} social profile`,
        icon: Icon as unknown as LucideIcon,
        run: () => {
          if (!isReal(url)) {
            setNotice(t('os.palette.actions.linkMissing'))
            return false
          }
          openExternal(url)
        },
      })
    })
    out.push({
      id: 'action-theme',
      group: 'actions',
      kind: 'action',
      label: theme === 'dark' ? t('os.menu.toLight') : t('os.menu.toDark'),
      keywords: 'theme dark light mode appearance',
      icon: SunMoon,
      run: () => {
        toggle()
      },
    })

    languages.forEach((l) =>
      out.push({
        id: `language-${l.code}`,
        group: 'language',
        kind: 'language',
        label: t('os.palette.actions.language', { name: l.name }),
        keywords: `language ${l.code} ${l.short} ${l.name}`,
        icon: Languages,
        current: i18n.language === l.code,
        run: () => void i18n.changeLanguage(l.code),
      }),
    )
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language, recent, theme])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // an app already listed under Recent is not repeated under Applications
      const shown = new Set(items.filter((i) => i.group === 'recent').map((i) => i.label))
      return items.filter(
        (i) =>
          i.group === 'recent' ||
          (i.group === 'apps' && !shown.has(i.label)) ||
          i.group === 'actions' ||
          i.group === 'language',
      )
    }
    const matched = items
      .filter((i) => i.group !== 'recent')
      .map((i) => ({ i, s: score(i, q) }))
      .filter((x) => x.s > 0)
    return matched.sort((a, b) => groupOrder.indexOf(a.i.group) - groupOrder.indexOf(b.i.group) || b.s - a.s).map((x) => x.i)
  }, [items, query])

  // keep the highlighted row in range and in view
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  const choose = async (item: Item | undefined) => {
    if (!item) return
    setNotice('')
    if ((await item.run()) !== false) close()
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (results.length ? (a + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Home' && !query) {
      setActive(0)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      void choose(results[active])
    } else if (e.key === 'Tab') {
      e.preventDefault() // the palette is a single control: keep focus in the search box
    }
  }

  const groupLabel = (g: Group) => (g === 'recent' ? t('os.palette.recent') : t(`os.palette.groups.${g}`))

  return (
    <div
      className="os-chrome fixed inset-0 z-[9500] flex items-start justify-center px-3 pt-[12vh]"
      onPointerDown={(e) => e.target === e.currentTarget && close()}
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="pointer-events-none absolute inset-0 bg-black/55 backdrop-blur-[3px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t('os.palette.label')}
        onKeyDown={onKey}
        initial={{ opacity: 0, y: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.18, ease: easeOut }}
        className="glass-dark relative flex max-h-[min(540px,72vh)] w-[min(640px,100%)] flex-col overflow-hidden rounded-2xl border border-neon/25 text-warm shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgb(var(--neon-rgb)/0.06),0_0_60px_-24px_rgb(var(--neon-rgb)/0.35)]"
      >
        <div className="flex items-center gap-3 border-b border-edge px-4">
          <Search size={18} className="shrink-0 text-neon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
              setNotice('')
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={results[active] ? `${uid}-${results[active].id}` : undefined}
            aria-autocomplete="list"
            aria-label={t('os.palette.placeholder')}
            placeholder={t('os.palette.placeholder')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-warm outline-none placeholder:text-steel"
          />
          <kbd className={kbd}>esc</kbd>
        </div>

        <ul id={`${uid}-list`} ref={listRef} role="listbox" aria-label={t('os.palette.label')} className="min-h-0 flex-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li role="presentation" className="px-3 py-10 text-center text-sm text-steel">
              {t('os.palette.empty', { query: query.trim() })}
            </li>
          ) : (
            results.map((item, i) => {
              const Icon = item.icon
              const on = i === active
              const header = i === 0 || results[i - 1].group !== item.group
              return (
                <li key={item.id} role="presentation">
                  {header && <p className="px-3 pb-1 pt-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{groupLabel(item.group)}</p>}
                  <div
                    id={`${uid}-${item.id}`}
                    role="option"
                    aria-selected={on}
                    onPointerMove={() => !on && setActive(i)}
                    onClick={() => void choose(item)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${on ? 'bg-neon/10 ring-1 ring-neon/30' : ''}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        on ? 'border-neon/50 bg-graphite text-neon' : 'border-edge bg-graphite-2 text-neon/80'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[14px] ${on ? 'font-medium text-neon' : ''}`}>{item.label}</span>
                    {item.current && <Sparkles size={13} className="shrink-0 text-neon" aria-label={t('os.palette.actions.current')} />}
                    <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-wider text-steel">{t(`os.palette.kinds.${item.kind}`)}</span>
                    {on ? <CornerDownLeft size={14} className="shrink-0 text-neon" /> : <ArrowUpRight size={14} className="shrink-0 text-transparent" />}
                  </div>
                </li>
              )
            })
          )}
        </ul>

        <div role="status" aria-live="polite" className={notice ? 'border-t border-edge bg-neon/5 px-4 py-2 text-[12.5px] text-neon' : 'sr-only'}>
          {notice || (query && t('os.palette.count', { n: results.length }))}
        </div>
        <div className="hidden items-center gap-4 border-t border-edge bg-graphite/50 px-4 py-2.5 text-[11.5px] text-steel sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className={kbd}>↑</kbd>
            <kbd className={kbd}>↓</kbd>
            {t('os.palette.hints.navigate')}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className={kbd}>↵</kbd>
            {t('os.palette.hints.open')}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className={kbd}>esc</kbd>
            {t('os.palette.hints.close')}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <kbd className={kbd}>{shortcutLabel()}</kbd>
          </span>
        </div>
      </motion.div>
    </div>
  )
}
