import { Check, ChevronDown, Globe } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { languages, type LanguageCode } from '../../i18n'

type Props = {
  /** which way the menu opens: up from the taskbar, down from a top status bar */
  placement?: 'up' | 'down'
  align?: 'left' | 'right'
}

/**
 * Globe button + menu for EN / ខ្មែរ / 中文 (sits in the always-dark taskbar and status bar).
 * Keyboard: Enter/Space/↓ opens, ↑/↓/Home/End move, Enter/Space selects,
 * Escape closes and returns focus, Tab closes. Outside clicks close it too.
 */
export function LanguageSwitcher({ placement = 'up', align = 'right' }: Props) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()

  const currentIndex = Math.max(
    0,
    languages.findIndex((l) => l.code === i18n.language),
  )
  const current = languages[currentIndex]
  const up = placement === 'up'

  // close on outside click
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  // move focus to the highlighted option while open
  useEffect(() => {
    if (open) itemRefs.current[focusIndex]?.focus()
  }, [open, focusIndex])

  const openMenu = (index = currentIndex) => {
    setFocusIndex(index)
    setOpen(true)
  }

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  const select = (code: LanguageCode) => {
    if (code !== i18n.language) i18n.changeLanguage(code)
    close()
  }

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu(e.key === 'ArrowUp' ? languages.length - 1 : currentIndex)
    }
  }

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = languages.length - 1
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusIndex((i) => (i >= last ? 0 : i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusIndex((i) => (i <= 0 ? last : i - 1))
        break
      case 'Home':
        e.preventDefault()
        setFocusIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusIndex(last)
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        close()
        break
      case 'Tab':
        close(false)
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onButtonKey}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t('language.choose', { language: current.name })}
        title={t('language.label')}
        className={`group flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-warm/90 transition-colors hover:bg-warm/10 hover:text-neon ${
          open ? 'bg-warm/10 text-neon' : ''
        }`}
      >
        <Globe size={16} strokeWidth={1.8} className="shrink-0" />
        <span lang={current.code} className="min-w-[1.6rem] text-center text-[12.5px] font-medium leading-none">
          {current.short}
        </span>
        <ChevronDown size={13} className={`shrink-0 opacity-60 transition-transform duration-200 ${open !== up ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={t('language.menu')}
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: up ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${up ? 'bottom' : 'top'} ${align}` }}
            className={`glass-dark absolute z-[9100] w-52 overflow-hidden rounded-xl border border-edge p-1.5 text-warm shadow-[0_24px_60px_-12px_rgba(0,0,0,0.9)] ${
              up ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
            } ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            <p className="px-2.5 pb-1 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{t('language.label')}</p>
            {languages.map((lang, i) => {
              const active = lang.code === current.code
              return (
                <button
                  key={lang.code}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={lang.code}
                  tabIndex={i === focusIndex ? 0 : -1}
                  onClick={() => select(lang.code)}
                  onMouseEnter={() => setFocusIndex(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus:outline-none ${
                    active ? 'bg-neon text-graphite' : 'text-warm/85 hover:bg-warm/10 focus-visible:bg-warm/10 focus-visible:text-neon'
                  }`}
                >
                  <span
                    className={`flex h-6 min-w-9 items-center justify-center rounded-md border px-1 text-[11px] font-medium ${
                      active ? 'border-graphite/40' : 'border-edge'
                    }`}
                  >
                    {lang.short}
                  </span>
                  <span className="flex-1">{lang.name}</span>
                  {active && <Check size={15} className="shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
