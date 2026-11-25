/** The DeveloperOS mark: a prompt chevron + cursor in a neon-outlined tile. Original artwork. */
export function OSLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true" className={className}>
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="#0B0D0F" stroke="var(--neon)" strokeWidth="1.6" />
      <path d="M9.5 11 15.5 16 9.5 21" stroke="var(--neon)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 21.5h5.5" stroke="#FFD600" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}
