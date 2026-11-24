import { useTranslation } from 'react-i18next'

type Props = {
  kind?: 'concept' | 'sample' | 'placeholder'
  className?: string
}

/** Small label that marks a temporary mock image, so it is never mistaken for the real thing. */
export function MockBadge({ kind = 'concept', className = '' }: Props) {
  const { t } = useTranslation()
  const label = kind === 'concept' ? t('images.conceptPreview') : kind === 'sample' ? t('images.samplePreview') : t('images.placeholder')
  return (
    <span
      className={`pointer-events-none inline-flex items-center gap-1 rounded-full border border-dashed border-neon/50 bg-graphite/85 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-neon shadow-sm backdrop-blur-sm ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-neon" />
      {label}
    </span>
  )
}
