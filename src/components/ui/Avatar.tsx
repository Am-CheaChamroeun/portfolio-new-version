import { profile } from '../../data/portfolio'

/** Small round avatar used in the header, footer and preloader. */
export function Avatar({ className = '' }: { className?: string }) {
  const src = profile.logo || profile.photo
  return (
    <span className={`relative flex items-center justify-center overflow-hidden rounded-full [container-type:size] ${className}`}>
      {src ? (
        <img src={src} alt={profile.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-display text-[48cqh] font-semibold leading-none text-neon"
          style={{ background: 'linear-gradient(135deg, var(--graphite-2), var(--graphite))' }}
          aria-label={profile.name}
        >
          {profile.initials}
        </span>
      )}
    </span>
  )
}
