import { Compass } from 'lucide-react'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { AppSkeleton } from './apps/shared'
import { useOSActions, useOSState } from './hooks'
import { appById, type AppId } from './registry'

/** DeveloperOS-styled 404 — shown inside the workspace, with one clear way back. */
export function NotFound({ path }: { path: string }) {
  const { t } = useTranslation()
  const { openApp } = useOSActions()
  return (
    <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-card-border bg-bg-subtle text-primary">
        <Compass size={26} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="font-mono text-[12px] text-faint">404</p>
      <h1 className="text-xl font-semibold tracking-tight">{t('os.notFound.title')}</h1>
      <p className="max-w-sm text-[14px] leading-6 text-muted">{t('os.notFound.text', { path })}</p>
      <button
        type="button"
        onClick={() => openApp('about')}
        className="btn-glow mt-2 rounded-lg border border-edge bg-graphite px-4 py-2 text-[13px] font-semibold text-neon transition-colors hover:border-neon hover:bg-neon hover:text-graphite"
      >
        {t('os.notFound.home')}
      </button>
    </div>
  )
}

/** The content of one app (or the 404) with its loading fallback. */
export function AppView({ id }: { id: AppId }) {
  const { t } = useTranslation()
  const { notFound } = useOSState()
  if (notFound) return <NotFound path={notFound} />
  const Component = appById[id].Component
  return (
    <>
      {/* every page gets one h1 for screen readers (About has its own visible one) */}
      {id !== 'about' && <h1 className="sr-only">{t(`meta.pages.${id}.title` as 'meta.pages.about.title')}</h1>}
      <Suspense fallback={<AppSkeleton label={t('os.window.loading')} />}>
        <Component />
      </Suspense>
    </>
  )
}
