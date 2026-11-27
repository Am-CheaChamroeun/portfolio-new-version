import { ImageOff, Search, X, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TechTile } from '../../lib/icons'

/** Small pill for a technology: its official logo (or a neutral fallback) beside the name. */
export function TechBadge({ name, compact = false }: { name: string; compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-card-border text-muted ${
        compact ? 'px-1.5 py-0.5 font-mono text-[10.5px]' : 'bg-bg-subtle px-2 py-1 font-mono text-[11px]'
      }`}
    >
      <TechTile tech={name} size="sm" />
      {name}
    </span>
  )
}

/** Window-style toolbar strip */
export function Toolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex shrink-0 flex-wrap items-center gap-2 border-b border-card-border bg-bg-subtle/60 px-3 py-2 ${className}`}>{children}</div>
}

/** Bottom status strip, like a file manager's */
export function StatusBar({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2 border-t border-card-border bg-titlebar px-3 py-1.5 font-mono text-[11px] text-faint">{children}</div>
}

export function SearchField({ label, className = '', ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useTranslation()
  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
      <input
        type="search"
        aria-label={label}
        {...props}
        className="h-8 w-full rounded-md border border-card-border bg-sheet pl-8 pr-8 text-[13px] max-md:h-10 max-md:text-[16px] text-fg outline-none transition-colors [appearance:none] placeholder:text-faint focus:border-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {props.value && (
        <button
          type="button"
          onClick={() =>
            props.onChange?.({
              target: { value: '' },
            } as ChangeEvent<HTMLInputElement>)
          }
          aria-label={t('os.search.clear')}
          title={t('os.search.clear')}
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-faint hover:text-fg"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

/** Small uppercase mono label */
export const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <p className={`font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint ${className}`}>{children}</p>
)

/** Neon-bordered pill used for "Current", "Live", … */
export function Pill({ children, tone = 'neon' }: { children: ReactNode; tone?: 'neon' | 'muted' }) {
  return tone === 'neon' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-glow px-2.5 py-0.5 text-[11px] font-semibold text-primary">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      {children}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-faint">
      <span className="h-1.5 w-1.5 rounded-full bg-faint" />
      {children}
    </span>
  )
}

/** Shimmering placeholder block shown while something is really loading. */
export const Skeleton = ({ className = '' }: { className?: string }) => <div aria-hidden="true" className={`skeleton ${className}`} />

/** An image that shows a skeleton until it has loaded, then fades in. */
export function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  srcSet,
  sizes,
  fallback,
  lazy = false,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  /** responsive sources for `src` (used while `src` is shown, not for the fallback) */
  srcSet?: string
  sizes?: string
  /** a second URL to try (the local copy) if `src` fails to load. Give the component a `key` that changes with `src`. */
  fallback?: string
  lazy?: boolean
}) {
  const { t } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const shown = useFallback && fallback ? fallback : src
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true) // already in the cache
  }, [shown])
  const onError = () => {
    if (fallback && !useFallback) {
      setUseFallback(true)
      setLoaded(false)
    } else setFailed(true)
  }
  return (
    <div className={`relative ${className}`}>
      {failed ? (
        <div role="img" aria-label={alt} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-graphite-2 p-3 text-center text-steel">
          <ImageOff size={22} aria-hidden="true" />
          <span className="text-[11.5px]">{t('os.projects.study.mediaError')}</span>
        </div>
      ) : (
        <>
          {!loaded && <Skeleton className="absolute inset-0" />}
          <img
            ref={ref}
            src={shown}
            srcSet={useFallback ? undefined : srcSet}
            sizes={useFallback ? undefined : sizes}
            alt={alt}
            decoding="async"
            loading={lazy ? 'lazy' : undefined}
            onLoad={() => setLoaded(true)}
            onError={onError}
            className={`h-full w-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          />
        </>
      )}
    </div>
  )
}

/** A slim browser window around a screenshot — a "device mockup" for previews. */
export function BrowserFrame({ children, label, className = '' }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-edge bg-graphite shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] ${className}`}>
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-edge bg-graphite-2 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-edge" />
        <span className="h-1.5 w-1.5 rounded-full bg-edge" />
        <span className="h-1.5 w-1.5 rounded-full bg-edge" />
        {label && <span className="ml-2 min-w-0 flex-1 truncate rounded bg-graphite px-2 py-0.5 font-mono text-[10px] text-steel">{label}</span>}
      </div>
      {children}
    </div>
  )
}

/** Loading placeholder for a lazy app — a faint outline of toolbar, list and content. */
export function AppSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex h-full flex-col gap-3 p-4">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="grid flex-1 gap-3 @md:grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="hidden h-32 rounded-xl sm:block" />
      </div>
      <Skeleton className="h-3 w-2/3 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  )
}

/** A calm, professional "nothing here yet" panel for sections without content. */
export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-card-border bg-bg-subtle text-muted">
        <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="max-w-sm text-[13.5px] leading-6 text-muted">{text}</p>
    </div>
  )
}
