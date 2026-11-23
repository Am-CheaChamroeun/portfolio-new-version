import { AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { AppWindow } from './AppWindow'
import { useOSState } from './hooks'
import { TASKBAR_H, type LayoutMode } from './layout'
import { appById } from './registry'

/** Renders every open window. Stacking order comes from each window's `z` in the store. */
export function WindowManager({ mode }: { mode: Exclude<LayoutMode, 'mobile'> }) {
  const { t } = useTranslation()
  const { windows, focusedId } = useOSState()
  return (
    <div role="region" aria-label={t('os.desktop.windows')} className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" style={{ bottom: TASKBAR_H }}>
      <AnimatePresence>
        {windows.map((win) => (
          <AppWindow key={win.id} win={win} def={appById[win.id]} focused={focusedId === win.id} mode={mode} />
        ))}
      </AnimatePresence>
    </div>
  )
}
