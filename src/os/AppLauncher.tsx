import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../components/ui/Avatar'
import { profile } from '../data/portfolio'
import { easeOut } from '../lib/motion'
import { useOSActions } from './hooks'
import { TASKBAR_H } from './layout'
import { apps } from './registry'

/** Start-menu style launcher: search, a grid of every app, Escape to close. */
export function AppLauncher() {
  const { t } = useTranslation()
  const { openApp, setLauncher } = useOSActions()
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // focus the search box, and hand focus back to whatever had it when the launcher closes
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    return () => previous?.focus?.()
  }, [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? apps.filter((a) => `${t(`os.apps.${a.id}`)} ${t(`os.titles.${a.id}`)}`.toLowerCase().includes(q)) : apps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, t])

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      setLauncher(false)
      return
    }
    if (e.key === 'Tab') {
      // keep Tab inside the launcher
      const nodes = panelRef.current!.querySelectorAll<HTMLElement>('input, button')
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  return (
    <div className="os-chrome absolute inset-0 z-[8900]" onPointerDown={(e) => e.target === e.currentTarget && setLauncher(false)}>
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-label={t('os.launcher.title')}
        onKeyDown={onKey}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.18, ease: easeOut }}
        style={{ bottom: TASKBAR_H + 10, transformOrigin: 'bottom left' }}
        className="glass-dark absolute left-2 flex max-h-[calc(100%-72px)] w-[min(580px,calc(100%-16px))] flex-col overflow-hidden rounded-2xl border border-edge text-warm shadow-[0_30px_80px_-16px_rgba(0,0,0,0.95)]"
      >
        <div className="relative border-b border-edge p-3">
          <Search size={16} className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-steel" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && list[0] && openApp(list[0].id)}
            placeholder={t('os.launcher.search')}
            aria-label={t('os.launcher.searchLabel')}
            className="h-10 w-full rounded-lg border border-edge bg-graphite/70 pl-9 pr-3 text-sm text-warm outline-none transition-colors placeholder:text-steel focus:border-neon/60"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{t('os.launcher.all')}</p>
          {list.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-steel">{t('os.launcher.empty', { query })}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {list.map((a) => {
                const Icon = a.icon
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => openApp(a.id)}
                      className="group flex w-full flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-warm/8 focus-visible:bg-warm/8"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-edge bg-gradient-to-b from-[#252a30] to-[#14171a] text-neon transition-all group-hover:border-neon/50">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <span className="line-clamp-2 text-[12.5px] font-medium leading-tight">{t(`os.apps.${a.id}`)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-edge bg-graphite/40 px-4 py-2.5">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-neon/40" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-medium">{profile.name}</p>
            <p className="truncate text-[11px] text-steel">{t('content.profile.role')}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
