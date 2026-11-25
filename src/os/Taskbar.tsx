import { Moon, Search, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher'
import { formatDate } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { useOSActions, useOSState } from './hooks'
import { TASKBAR_H } from './layout'
import { shortcutLabel } from './CommandPalette'
import { OSLogo } from './OSLogo'
import { apps } from './registry'
import { formatTime, useNow } from './useNow'

function Clock() {
  const { t, i18n } = useTranslation()
  const now = useNow()
  return (
    <div role="group" aria-label={t('os.taskbar.clock')} className="hidden flex-col items-end px-2 leading-tight sm:flex">
      <time dateTime={now.toISOString()} className="font-mono text-[13px] font-medium tabular-nums text-warm">
        {formatTime(now)}
      </time>
      <span className="text-[11px] text-steel">{formatDate(now, i18n.language, 'short')}</span>
    </div>
  )
}

/**
 * Bottom taskbar: launcher, every app (neon = the active one), then the tray with
 * language, theme and clock. Always dark, like the desktop.
 */
export const Taskbar = memo(function Taskbar() {
  const { t } = useTranslation()
  const { activeApp, launcher, palette } = useOSState()
  const actions = useOSActions()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const btn = 'btn-glow flex h-10 items-center justify-center rounded-lg text-warm/90 transition-colors hover:bg-warm/10 hover:text-neon'

  return (
    <nav
      aria-label={t('os.taskbar.aria')}
      style={{ height: TASKBAR_H }}
      className="os-chrome glass-dark absolute inset-x-0 bottom-0 z-[9000] flex items-center gap-1.5 border-t border-edge px-2 text-warm"
    >
      <button
        type="button"
        onClick={() => actions.setLauncher(!launcher)}
        aria-label={t('os.taskbar.launcher')}
        data-tip={t('os.taskbar.launcher')}
        aria-haspopup="dialog"
        aria-expanded={launcher}
        className={`${btn} tip w-11 ${launcher ? 'bg-warm/10' : ''}`}
      >
        <OSLogo size={26} />
      </button>
      <span className="mx-0.5 h-6 w-px bg-edge" aria-hidden="true" />

      <ul aria-label={t('os.taskbar.running')} className="dock-list flex min-w-0 flex-1 items-center justify-center gap-1">
        {apps.map((def) => {
          const Icon = def.icon
          const active = activeApp === def.id
          const name = t(`os.apps.${def.id}`)
          return (
            <li key={def.id} className="shrink-0">
              <button
                type="button"
                data-task={def.id}
                onClick={() => actions.openApp(def.id)}
                aria-label={name}
                data-tip={name}
                aria-current={active ? 'page' : undefined}
                className={`tip relative flex h-10 items-center gap-2 rounded-lg px-2.5 transition-colors hover:bg-warm/10 ${active ? 'bg-neon/10 text-neon' : 'text-warm/80'}`}
              >
                <span className="dock-ico flex">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                {active && <span className="hidden max-w-[7.5rem] truncate text-[12.5px] font-medium xl:inline">{name}</span>}
                {active && (
                  <motion.span
                    layoutId="dock-indicator"
                    aria-hidden="true"
                    transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                    className="absolute bottom-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]"
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => actions.setPalette(!palette)}
          aria-label={t('os.palette.label')}
          aria-haspopup="dialog"
          aria-expanded={palette}
          data-tip={t('os.taskbar.search')}
          className="tip btn-glow mr-1 flex h-9 items-center gap-2 rounded-lg border border-edge bg-warm/5 px-2.5 text-steel transition-all hover:border-neon/60 hover:text-neon"
        >
          <Search size={15} />
          <kbd className="hidden font-mono text-[10.5px] text-steel lg:inline">{shortcutLabel()}</kbd>
        </button>
        <LanguageSwitcher placement="up" align="right" />
        <button
          type="button"
          onClick={(e) => toggle(e)}
          aria-label={dark ? t('os.taskbar.toLight') : t('os.taskbar.toDark')}
          data-tip={dark ? t('os.taskbar.toLight') : t('os.taskbar.toDark')}
          className={`${btn} tip w-10`}
        >
          {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>
        <Clock />
      </div>
    </nav>
  )
})
