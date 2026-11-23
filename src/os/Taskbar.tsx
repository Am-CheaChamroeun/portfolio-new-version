import { Moon, Sun } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher'
import { formatDate } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { useOSActions, useOSState } from './hooks'
import { TASKBAR_H } from './layout'
import { OSLogo } from './OSLogo'
import { appById } from './registry'
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
 * Bottom taskbar: launcher, running apps (neon = active), then the tray with
 * language, theme, clock and "show desktop". Always dark, like the desktop.
 */
export const Taskbar = memo(function Taskbar() {
  const { t } = useTranslation()
  const { windows, focusedId, launcher } = useOSState()
  const actions = useOSActions()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const btn = 'flex h-10 items-center justify-center rounded-lg text-warm/90 transition-colors hover:bg-warm/10 hover:text-neon'

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
        title={t('os.taskbar.launcher')}
        aria-haspopup="dialog"
        aria-expanded={launcher}
        className={`${btn} w-11 ${launcher ? 'bg-warm/10' : ''}`}
      >
        <OSLogo size={26} />
      </button>
      <span className="mx-0.5 h-6 w-px bg-edge" aria-hidden="true" />

      <ul aria-label={t('os.taskbar.running')} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {windows.map((w) => {
          const def = appById[w.id]
          const Icon = def.icon
          const active = focusedId === w.id && !w.minimized
          const name = t(`os.apps.${w.id}`)
          const state = t(`os.taskbar.state.${active ? 'active' : w.minimized ? 'minimized' : 'open'}`)
          return (
            <li key={w.id} className="shrink-0">
              <button
                type="button"
                data-task={w.id}
                onClick={() => actions.taskbarToggle(w.id)}
                aria-label={t('os.taskbar.item', { app: name, state })}
                title={name}
                aria-current={active ? 'true' : undefined}
                className={`relative flex h-10 items-center gap-2 rounded-lg px-2.5 transition-colors hover:bg-warm/10 ${
                  active ? 'bg-neon/10 text-neon' : w.minimized ? 'text-steel' : 'text-warm'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="hidden max-w-[7.5rem] truncate text-[12.5px] font-medium xl:inline">{name}</span>
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all duration-200 ${
                    active ? 'w-5 bg-neon shadow-[0_0_8px_#efff00]' : w.minimized ? 'w-1.5 bg-steel/60' : 'w-1.5 bg-warm/70'
                  }`}
                />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-0.5">
        <LanguageSwitcher placement="up" align="right" />
        <button
          type="button"
          onClick={(e) => toggle(e)}
          aria-label={dark ? t('os.taskbar.toLight') : t('os.taskbar.toDark')}
          title={dark ? t('os.taskbar.toLight') : t('os.taskbar.toDark')}
          className={`${btn} w-10`}
        >
          {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>
        <Clock />
        <button
          type="button"
          onClick={actions.showDesktop}
          aria-label={t('os.taskbar.showDesktop')}
          title={t('os.taskbar.showDesktop')}
          className="ml-1 h-10 w-3.5 rounded-md border-l border-edge transition-colors hover:bg-neon/20 focus-visible:bg-neon/20"
        />
      </div>
    </nav>
  )
})
