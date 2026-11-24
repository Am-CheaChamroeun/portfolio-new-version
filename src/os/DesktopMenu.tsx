import { Check, LayoutGrid, Moon, Sun } from 'lucide-react'
import { useEffect, useRef, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { languages } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { useOSActions } from './hooks'

type Props = { x: number; y: number; onClose: () => void }

const item =
  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-warm/90 transition-colors hover:bg-warm/10 focus:bg-warm/10 focus:text-neon focus:outline-none disabled:pointer-events-none disabled:opacity-40'

const Sep = () => <div role="separator" className="my-1 h-px bg-edge" />
const Row = ({
  icon,
  children,
  ...rest
}: {
  icon: ReactNode
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" role="menuitem" className={item} {...rest}>
    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-steel">{icon}</span>
    <span className="flex-1">{children}</span>
  </button>
)

/** Right-click menu for the desktop — every entry does something real. */
export function DesktopMenu({ x, y, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const actions = useOSActions()
  const { theme, toggle } = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const dark = theme === 'dark'

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role^=menuitem]:not(:disabled)')?.focus()
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && onClose()
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [onClose])

  const onKey = (e: KeyboardEvent) => {
    const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role^=menuitem]:not(:disabled)') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    const move = (to: HTMLElement | undefined) => {
      e.preventDefault()
      to?.focus()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    } else if (e.key === 'ArrowDown') move(items[(i + 1) % items.length])
    else if (e.key === 'ArrowUp') move(items[(i - 1 + items.length) % items.length])
    else if (e.key === 'Home') move(items[0])
    else if (e.key === 'End') move(items[items.length - 1])
    else if (e.key === 'Tab') onClose()
  }

  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={t('os.menu.aria')}
      onKeyDown={onKey}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        left: Math.min(x, window.innerWidth - 248),
        top: Math.min(y, window.innerHeight - 330),
      }}
      className="os-chrome glass-dark absolute z-[9200] w-60 rounded-xl border border-edge p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)]"
    >
      <Row icon={<LayoutGrid size={15} />} onClick={run(() => actions.setLauncher(true))}>
        {t('os.menu.launcher')}
      </Row>
      <Sep />
      <Row
        icon={dark ? <Sun size={15} /> : <Moon size={15} />}
        onClick={(e) => {
          toggle(e)
          onClose()
        }}
      >
        {dark ? t('os.menu.toLight') : t('os.menu.toDark')}
      </Row>
      <Sep />
      <p className="px-2.5 pb-1 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{t('os.menu.language')}</p>
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          role="menuitemradio"
          aria-checked={i18n.language === l.code}
          lang={l.code}
          className={item}
          onClick={run(() => void i18n.changeLanguage(l.code))}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-neon">{i18n.language === l.code && <Check size={14} />}</span>
          <span className="flex-1">{l.name}</span>
        </button>
      ))}
    </div>
  )
}
