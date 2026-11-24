import { AnimatePresence, motion } from 'motion/react'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { easeOut } from '../lib/motion'
import { useOSState } from './hooks'
import { TASKBAR_H } from './layout'
import { appById } from './registry'

function Loading() {
  const { t } = useTranslation()
  return (
    <div role="status" className="flex h-full items-center justify-center gap-2 font-mono text-xs text-faint">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      {t('os.window.loading')}
    </div>
  )
}

/**
 * The main desktop area: renders the one active app in the empty space beside the icons.
 * No title bar, no window controls — switching apps just cross-fades the content.
 * The left edge clears the icon column (two columns on short screens).
 */
export function Workspace() {
  const { t } = useTranslation()
  const { activeApp } = useOSState()
  const def = appById[activeApp]

  return (
    <section
      aria-label={t(`os.titles.${activeApp}`)}
      data-workspace
      style={{ bottom: TASKBAR_H + 12 }}
      className="absolute right-3 top-3 left-[140px] [@media(max-height:845px)]:left-[240px] overflow-hidden rounded-2xl border border-card-border bg-sheet text-fg shadow-window"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeApp}
          data-app-view={activeApp}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: easeOut }}
          className="relative h-full w-full"
        >
          <Suspense fallback={<Loading />}>
            <def.Component />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
