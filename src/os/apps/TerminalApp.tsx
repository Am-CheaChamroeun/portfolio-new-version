import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { profile } from '../../data/portfolio'
import { useOSActions } from '../hooks'
import { COMMANDS, runCommand, type Line } from '../terminal'

const LOGO = String.raw` ____  _______     __   ___  ____
|  _ \| ____\ \   / /  / _ \/ ___|
| | | |  _|  \ \ / /  | | | \___ \
| |_| | |___  \ V /   | |_| |___) |
|____/|_____|  \_/     \___/|____/`

const FETCH_ART = String.raw`  ┌────────────┐
  │ >_         │
  │            │
  │  ▓▓▓▓▓▓    │
  └─────┬┬─────┘
     ───┴┴───`

type Entry = { id: number; input: string; lines: Line[] }

/** The session survives switching apps (the workspace unmounts apps), but not a page reload. */
const session: {
  entries: Entry[]
  history: string[]
  nextId: number
  banner: boolean
} = { entries: [], history: [], nextId: 1, banner: true }

const quick = ['help', 'whoami', 'projects', 'skills', 'contact', 'neofetch']
const coarse = () => window.matchMedia('(pointer: coarse)').matches

const tone: Record<string, string> = {
  text: 'text-warm',
  accent: 'font-semibold text-neon',
  success: 'text-[#6ee7a0]',
  error: 'text-[#ff7b72]',
  muted: 'text-steel',
  heading: 'mt-1 font-semibold uppercase tracking-[0.14em] text-neon',
}

/** Terminal → a safe, portfolio-only command line inside the workspace. */
export default function TerminalApp() {
  const { t, i18n } = useTranslation()
  const { openApp } = useOSActions()
  const [entries, setEntries] = useState<Entry[]>(session.entries)
  const [banner, setBanner] = useState(session.banner)
  const [input, setInput] = useState('')
  const [cursor, setCursor] = useState<number | null>(null) // position while browsing history
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const freshFrom = useRef(session.nextId) // only output added during this visit animates in
  const draft = useRef('')

  const tr = t as unknown as (key: string, options?: Record<string, unknown>) => string
  const list = useCallback(
    (key: string) =>
      (t(key as 'content.about.paragraphs', {
        returnObjects: true,
      }) as unknown as string[]) ?? [],
    [t],
  )

  useEffect(() => {
    if (!coarse()) inputRef.current?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    session.entries = entries
    session.banner = banner
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries, banner])

  const append = useCallback((id: number, lines: Line[]) => setEntries((es) => es.map((e) => (e.id === id ? { ...e, lines: [...e.lines, ...lines] } : e))), [])

  const run = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text) {
        setEntries((es) => [...es, { id: session.nextId++, input: '', lines: [] }])
        return
      }
      session.history = [...session.history, text]
      const result = runCommand(text, {
        t: tr,
        list,
        lang: i18n.language,
        openApp,
        history: session.history,
      })
      if (result.clear) {
        setEntries([])
        setBanner(false)
      } else {
        const id = session.nextId++
        setEntries((es) => [...es, { id, input: text, lines: result.lines }])
        result.after?.().then((more) => more.length && append(id, more))
      }
      result.effect?.()
    },
    [tr, list, i18n.language, openApp, append],
  )

  const submit = () => {
    run(input)
    setInput('')
    setCursor(null)
  }

  const matches = useMemo(() => (input && !input.includes(' ') ? COMMANDS.filter((c) => c.startsWith(input.toLowerCase())) : []), [input])
  const ghost = matches.length && matches[0] !== input.toLowerCase() ? matches[0].slice(input.length) : ''

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = session.history
      if (!h.length) return
      if (cursor === null) draft.current = input
      const next = cursor === null ? h.length - 1 : Math.max(0, cursor - 1)
      setCursor(next)
      setInput(h[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (cursor === null) return
      const h = session.history
      if (cursor >= h.length - 1) {
        setCursor(null)
        setInput(draft.current)
      } else {
        setCursor(cursor + 1)
        setInput(h[cursor + 1])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (!matches.length) return
      const at = matches.indexOf(input.toLowerCase() as (typeof COMMANDS)[number])
      setInput(matches[(at + 1) % matches.length])
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault()
      run('clear')
    }
  }

  const prompt = `${profile.handle}@dev`

  const renderLine = (l: Line, i: number, fresh: boolean) => {
    const style = fresh ? { animationDelay: `${Math.min(i * 30, 420)}ms` } : undefined
    const cls = `${fresh ? 'term-line' : ''} `
    switch (l.kind) {
      case 'kv': {
        const value = l.href ? (
          <a
            href={l.href}
            {...(l.href.startsWith('http') && {
              target: '_blank',
              rel: 'noreferrer',
            })}
            className="text-warm underline decoration-neon/40 underline-offset-2 hover:text-neon"
          >
            {l.value}
          </a>
        ) : (
          <span className="text-warm">{l.value}</span>
        )
        return (
          <div key={i} style={style} className={`${cls}flex gap-3`}>
            <span className="w-24 shrink-0 text-neon/80 @md:w-32">{l.key}</span>
            {value}
          </div>
        )
      }
      case 'help':
        return (
          <div key={i} style={style} className={`${cls}flex gap-3`}>
            <button type="button" onClick={() => run(l.cmd)} className="w-28 shrink-0 text-left text-neon hover:underline">
              {l.cmd}
            </button>
            <span className="text-steel">{l.desc}</span>
          </div>
        )
      case 'suggest':
        return (
          <div key={i} style={style} className={`${cls}mt-1 flex flex-wrap items-center gap-1.5`}>
            <span className="text-steel">{t('os.terminal.try')}</span>
            {l.cmds.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => run(c)}
                className="rounded-md border border-neon/30 px-2 py-0.5 text-neon transition-colors hover:border-neon hover:bg-neon/10"
              >
                {c}
              </button>
            ))}
          </div>
        )
      case 'neofetch':
        return (
          <div key={i} style={style} className={`${cls}mt-1 flex flex-col gap-3 @md:flex-row @md:gap-6`}>
            <pre aria-hidden="true" className="text-[11px] leading-[1.15] text-neon">
              {FETCH_ART}
            </pre>
            <dl>
              <dt className="sr-only">{profile.name}</dt>
              <p className="font-semibold text-neon">
                {prompt}
                <span className="text-steel">@developeros</span>
              </p>
              <p className="mb-1 text-steel">────────────────────</p>
              {l.rows.map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-24 shrink-0 text-neon/80">{k}</dt>
                  <dd className="min-w-0 break-words text-warm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )
      default:
        return (
          <p key={i} style={style} className={`${cls}${tone[l.kind]} whitespace-pre-wrap break-words`}>
            {l.text}
          </p>
        )
    }
  }

  return (
    <div className="os-chrome @container flex h-full min-h-0 flex-col bg-graphite font-mono text-[13px] leading-[1.7] text-warm">
      {/* minimal header — no window controls */}
      <div className="flex shrink-0 items-center gap-2 border-b border-edge bg-graphite-2/70 px-4 py-2 text-[12px] text-steel">
        <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_#efff00]" />
        <span className="truncate">
          {prompt}
          <span className="text-steel/60">@developeros</span>: ~
        </span>
        <span className="ml-auto text-[11px] uppercase tracking-[0.16em] text-steel/70">{t('os.terminal.header')}</span>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-label={t('os.terminal.outputLabel')}
        onClick={() => !window.getSelection()?.toString() && inputRef.current?.focus({ preventScroll: true })}
        className="term-grid relative min-h-0 flex-1 overflow-y-auto px-4 py-4"
      >
        {banner && (
          <div className="mb-3 space-y-2">
            <pre aria-label="DeveloperOS" className="term-line overflow-x-auto text-[9px] leading-[1.15] text-neon @sm:text-[12px]">
              {LOGO}
            </pre>
            <p className="term-line text-warm" style={{ animationDelay: '60ms' }}>
              {t('os.terminal.welcome')}
            </p>
            <p className="term-line text-steel" style={{ animationDelay: '120ms' }}>
              {t('os.terminal.hint')}
            </p>
            <div className="term-line flex flex-wrap items-center gap-1.5" style={{ animationDelay: '180ms' }}>
              <span className="text-steel">{t('os.terminal.try')}</span>
              {['help', 'whoami', 'neofetch'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => run(c)}
                  className="rounded-md border border-neon/30 px-2 py-0.5 text-neon transition-colors hover:border-neon hover:bg-neon/10"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {entries.map((e) => {
          const fresh = e.id >= freshFrom.current
          return (
            <div key={e.id} className="mb-2.5">
              <p className="break-all">
                <span className="text-neon">{prompt}</span>
                <span className="text-steel"> ~ $ </span>
                <span className="text-warm">{e.input}</span>
              </p>
              {e.lines.map((l, i) => renderLine(l, i, fresh))}
            </div>
          )
        })}
      </div>

      {/* quick commands (handy on touch screens) */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-t border-edge px-3 pt-2 [scrollbar-width:none]">
        {quick.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              run(c)
              if (!coarse()) inputRef.current?.focus({ preventScroll: true })
            }}
            className="shrink-0 rounded-md border border-edge px-2.5 py-1 text-[12px] text-steel transition-colors hover:border-neon/60 hover:text-neon"
          >
            {c}
          </button>
        ))}
      </div>

      <label className="flex shrink-0 cursor-text items-center gap-2 px-4 pb-3 pt-2">
        <span className="shrink-0 text-neon">
          <span className="hidden @sm:inline">{prompt}</span>
          <span className="text-steel"> ~ $</span>
        </span>
        <span className="relative min-w-0 flex-1">
          {/* faint completion hint behind the real input */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre text-[16px] @md:text-[13.5px]"
          >
            <span className="invisible">{input}</span>
            <span className="text-steel/60">{ghost}</span>
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setCursor(null)
            }}
            onKeyDown={onKey}
            aria-label={t('os.terminal.inputLabel')}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="send"
            className="relative w-full bg-transparent text-[16px] text-warm caret-neon outline-none @md:text-[13.5px]"
          />
        </span>
      </label>
    </div>
  )
}
