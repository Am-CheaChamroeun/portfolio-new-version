import { ArrowLeft, House, Moon, Search, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher'
import { profile } from '../data/portfolio'
import { useTheme } from '../hooks/useTheme'
import { easeOut } from '../lib/motion'
import { CommandPalette } from './CommandPalette'
import { useOSActions, useOSState } from './hooks'
import { OSLogo } from './OSLogo'
import { AppView } from './AppView'
import { appById, apps, dockApps, type AppId } from './registry'
import { formatTime, useNow } from './useNow'
import { Wallpaper } from './Wallpaper'

function StatusBar() {
  const { t } = useTranslation()
  const { setPalette } = useOSActions()
  const now = useNow()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <header
      aria-label={t('os.mobile.status')}
      className={`os-chrome relative z-10 flex h-12 shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)] text-warm`}
    >
      <time dateTime={now.toISOString()} className="font-mono text-[13px] font-medium tabular-nums">
        {formatTime(now)}
      </time>
      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
        <OSLogo size={16} />
        {t('os.name')}
      </span>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setPalette(true)}
          aria-label={t('os.palette.label')}
          aria-haspopup="dialog"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-warm/90 transition-colors hover:bg-warm/10 hover:text-neon"
        >
          <Search size={17} />
        </button>
        <LanguageSwitcher placement="down" align="right" />
        <button
          type="button"
          onClick={(e) => toggle(e)}
          aria-label={dark ? t('os.taskbar.toLight') : t('os.taskbar.toDark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-warm/90 transition-colors hover:bg-warm/10 hover:text-neon"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  )
}

/** Bottom dock / navigation: Home + the four pinned apps */
function Dock({ active }: { active: AppId | null }) {
  const { t } = useTranslation()
  const { openApp, closeMobile } = useOSActions()
  const goHome = () => (history.state?.osApp ? history.back() : closeMobile())
  const cell = 'flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-medium transition-colors'
  return (
    <nav
      aria-label={t('os.mobile.dock')}
      className="os-chrome glass-dark relative z-10 flex shrink-0 items-stretch gap-1 border-t border-edge px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 text-warm"
    >
      <button
        type="button"
        onClick={goHome}
        aria-current={active === null ? 'page' : undefined}
        className={`${cell} ${active === null ? 'text-neon' : 'text-warm/80'}`}
      >
        <House size={20} strokeWidth={1.8} />
        <span>{t('os.mobile.home')}</span>
      </button>
      {dockApps.map((id) => {
        const Icon = appById[id].icon
        const on = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => openApp(id)}
            aria-current={on ? 'page' : undefined}
            className={`${cell} ${on ? 'bg-neon/10 text-neon' : 'text-warm/80'}`}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="max-w-full truncate px-1">{t(`os.apps.${id}`)}</span>
          </button>
        )
      })}
    </nav>
  )
}

/** Phone layout: home-screen icon grid, one full-screen app at a time, bottom dock, browser-back support. */
export function MobileShell() {
  const { t } = useTranslation()
  const { mobileApp } = useOSState()
  const { openApp, closeMobile, setPalette } = useOSActions()

  // Back returns through the address history (the URL mirrors the open app); closes to the home screen when there is none
  const back = () => (history.state?.os ? history.back() : closeMobile())
  const { palette } = useOSState()
  const def = mobileApp ? appById[mobileApp] : null

  return (
    <main className="os-chrome fixed inset-0 flex flex-col overflow-hidden bg-graphite">
      <Wallpaper />

      {/* home screen — inert (not focusable / not read out) while an app is open on top of it */}
      <div inert={mobileApp !== null} className="relative flex min-h-0 flex-1 flex-col">
        <StatusBar />
        <div className="relative z-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <section aria-labelledby="m-welcome" className="glass-dark mb-6 rounded-2xl border border-edge p-4 text-warm">
            <h1 id="m-welcome" className="text-lg font-semibold leading-snug tracking-tight">
              {t('os.welcome.title')}
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-steel">{t('os.welcome.subtitle')}</p>
            <p className="mt-3 border-t border-edge pt-2.5 text-[13px]">
              <span className="font-semibold text-neon">{profile.name}</span> · {t('content.profile.role')}
            </p>
          </section>

          <ul aria-label={t('os.desktop.icons')} className="grid grid-cols-4 gap-x-1 gap-y-5">
            {apps.map((a) => {
              const Icon = a.icon
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => openApp(a.id)}
                    className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-1 outline-none focus-visible:ring-2 focus-visible:ring-neon"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-edge bg-gradient-to-b from-[#252a30] to-[#14171a] text-neon shadow-[0_8px_20px_-8px_rgba(0,0,0,0.9)] transition-transform group-active:scale-90">
                      <Icon size={26} strokeWidth={1.6} />
                    </span>
                    <span className="line-clamp-2 w-full break-words px-0.5 text-center text-[11.5px] font-medium leading-tight text-warm">
                      {t(`os.apps.${a.id}`)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <Dock active={null} />
      </div>

      {/* the open app, full screen */}
      <AnimatePresence>
        {def && mobileApp && (
          <motion.div
            key={mobileApp}
            role="dialog"
            aria-label={t(`os.titles.${mobileApp}`)}
            initial={{ opacity: 0, scale: 0.94, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 30 }}
            transition={{ duration: 0.24, ease: easeOut }}
            className="absolute inset-0 z-20 flex flex-col bg-sheet text-fg"
          >
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-card-border bg-titlebar px-2 pt-[env(safe-area-inset-top)]">
              <button
                type="button"
                onClick={back}
                aria-label={t('os.mobile.back')}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-fg transition-colors hover:bg-fg/10"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-graphite text-neon ring-1 ring-neon/40">
                <def.icon size={15} strokeWidth={1.9} />
              </span>
              <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{t(`os.titles.${mobileApp}`)}</h2>
              <button
                type="button"
                onClick={() => setPalette(true)}
                aria-label={t('os.palette.label')}
                aria-haspopup="dialog"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-fg transition-colors hover:bg-fg/10 hover:text-primary"
              >
                <Search size={18} />
              </button>
            </header>
            <div className="relative min-h-0 flex-1">
              <AppView id={mobileApp} />
            </div>
            <Dock active={mobileApp} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{palette && <CommandPalette key="palette" />}</AnimatePresence>
    </main>
  )
}
