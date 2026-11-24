import { AnimatePresence } from 'motion/react'
import { useCallback, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLauncher } from './AppLauncher'
import { DesktopIcon } from './DesktopIcon'
import { DesktopMenu } from './DesktopMenu'
import { useOSState } from './hooks'
import { TASKBAR_H } from './layout'
import { apps } from './registry'
import { Taskbar } from './Taskbar'
import { Wallpaper } from './Wallpaper'
import { Workspace } from './Workspace'

/** The full desktop (tablet + desktop): wallpaper, icons, the active app's workspace, taskbar. */
export function Desktop() {
  const { t } = useTranslation()
  const { activeApp, launcher } = useOSState()
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const closeMenu = useCallback(() => setMenu(null), [])

  const onContextMenu = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role=dialog], nav, [role=menu], input, textarea')) return
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <main aria-label={t('os.desktop.aria')} className="os-chrome fixed inset-0 overflow-hidden" onContextMenu={onContextMenu}>
      <Wallpaper />

      <div
        className="absolute left-3 top-3 flex flex-col flex-wrap content-start gap-1"
        style={{ bottom: TASKBAR_H + 12 }}
        role="group"
        aria-label={t('os.desktop.icons')}
      >
        {apps.map((def) => (
          <DesktopIcon key={def.id} def={def} active={activeApp === def.id} />
        ))}
      </div>

      <Workspace />
      <Taskbar />

      <AnimatePresence>{launcher && <AppLauncher key="launcher" />}</AnimatePresence>
      {menu && <DesktopMenu x={menu.x} y={menu.y} onClose={closeMenu} />}
    </main>
  )
}
