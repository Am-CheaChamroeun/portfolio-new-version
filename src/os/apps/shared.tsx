import { Search, X } from 'lucide-react'
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TechIcon } from '../../lib/icons'
import { techIcons, type TechKey } from '../../lib/tech'

/** Project tech names ("Next.js") → icon keys, so badges can show a logo when we have one. */
const techByName: Record<string, TechKey> = {
  react: 'react',
  'next.js': 'nextjs',
  typescript: 'typescript',
  javascript: 'javascript',
  vite: 'vite',
  nestjs: 'nestjs',
  'node.js': 'nodejs',
  graphql: 'graphql',
  wordpress: 'wordpress',
  postgresql: 'postgresql',
  docker: 'docker',
  tailwind: 'tailwind',
  git: 'git',
}

/** Small pill for a technology, with its logo when available. */
export function TechBadge({ name }: { name: string }) {
  const key = techByName[name.toLowerCase()]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-bg-subtle px-2 py-1 font-mono text-[11px] text-muted">
      {key && techIcons[key] && (
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-warm">
          <TechIcon name={key} size={11} />
        </span>
      )}
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
  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-card-border bg-titlebar px-3 py-1.5 font-mono text-[11px] text-faint">{children}</div>
  )
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
        className="h-8 w-full rounded-md border border-card-border bg-sheet pl-8 pr-8 text-[13px] text-fg outline-none transition-colors [appearance:none] placeholder:text-faint focus:border-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {props.value && (
        <button
          type="button"
          onClick={() => props.onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)}
          aria-label={t('os.search.clear')} title={t('os.search.clear')}
          className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-faint hover:text-fg"
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
