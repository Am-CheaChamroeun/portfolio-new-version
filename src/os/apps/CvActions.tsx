import { Download, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { profile } from '../../data/portfolio'
import { useCvAvailable } from '../../hooks/useCvAvailable'

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * CV actions. `full` = Download CV (primary) + View CV (secondary); `compact` = a single small Download CV.
 * Both are plain links: Download uses the `download` attribute with the configured file name, View opens the
 * browser's native PDF viewer in a new tab. No JavaScript, no modal, fully keyboard accessible.
 */
export function CvActions({ variant = 'full', className = '' }: { variant?: 'full' | 'compact'; className?: string }) {
  const { t } = useTranslation()
  const ok = useCvAvailable()
  if (!ok) return null
  if (variant === 'compact') {
    return (
      <a
        href={profile.cvUrl}
        download={profile.cvFilename}
        aria-label={t('os.cv.downloadAria')}
        className={`ml-auto inline-flex items-center gap-1.5 rounded-md border border-card-border bg-sheet px-2.5 py-1 text-[12px] font-medium transition-colors hover:border-primary hover:text-primary ${focus} ${className}`}
      >
        <Download size={13} aria-hidden="true" />
        {t('os.cv.download')}
      </a>
    )
  }
  return (
    <>
      <a
        href={profile.cvUrl}
        download={profile.cvFilename}
        aria-label={t('os.cv.downloadAria')}
        className={`inline-flex items-center gap-2 rounded-lg bg-cta px-4 py-2 text-[13px] font-semibold text-on-cta transition-colors hover:bg-cta-hover ${focus} ${className}`}
      >
        <Download size={15} aria-hidden="true" />
        {t('os.cv.download')}
      </a>
      <a
        href={profile.cvUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('os.cv.viewAria')}
        className={`inline-flex items-center gap-2 rounded-lg border border-card-border bg-sheet px-4 py-2 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary ${focus} ${className}`}
      >
        <Eye size={15} aria-hidden="true" />
        {t('os.cv.view')}
      </a>
    </>
  )
}
