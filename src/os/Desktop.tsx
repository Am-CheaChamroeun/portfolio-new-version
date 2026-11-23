import { AnimatePresence } from 'motion/react'
import { useCallback, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLauncher } from './AppLauncher'
import { DesktopIcon } from './DesktopIcon'
import { DesktopMenu } from './DesktopMenu'
import { useOSState } from './hooks'
import { TASKBAR_H, type LayoutMode } from './layout'
import { apps, type AppId } from './registry'
import { Taskbar } from './Taskbar'
import { Wallpaper } from './Wallpaper'
import { WelcomeWidget } from './WelcomeWidget'
import { WindowManager } from './WindowManager'

/** The full desktop (tablet + desktop): wallpaper, icons, welcome card, windows, taskbar. */
export function Desktop({ mode }: { mode: Exclude<LayoutMode, 'mobile'> }) {
  const { t } = useTranslation()
  const { windows, launcher } = useOSState()
  const [selected, setSelected] = useState<AppId | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const closeMenu = useCallback(() => setMenu(null), [])

  const onContextMenu = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role=dialog], nav, [role=menu], input, textarea')) return
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <main
      aria-label={t('os.desktop.aria')}
      className="os-chrome fixed inset-0 overflow-hidden"
      onClick={() => setSelected(null)}
      onContextMenu={onContextMenu}
    >
      <Wallpaper />

      <div className="absolute left-3 top-3 flex flex-col flex-wrap content-start gap-1" style={{ bottom: TASKBAR_H + 12 }} role="group" aria-label={t('os.desktop.icons')}>
        {apps.map((def) => (
          <DesktopIcon key={def.id} def={def} selected={selected === def.id} running={windows.some((w) => w.id === def.id)} onSelect={setSelected} />
        ))}
      </div>

      <WelcomeWidget />
      <WindowManager mode={mode} />
      <Taskbar />

      <AnimatePresence>{launcher && <AppLauncher key="launcher" />}</AnimatePresence>
      {menu && <DesktopMenu x={menu.x} y={menu.y} onClose={closeMenu} />}
    </main>
  )
}
