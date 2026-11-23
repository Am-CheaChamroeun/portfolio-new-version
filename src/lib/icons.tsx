import type { SVGProps } from 'react'
import { siGithub, siTelegram } from 'simple-icons'
import { techIcons, type TechKey } from './tech'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

/** Full-colour tech logo, meant to sit on a white tile. */
export function TechIcon({ name, size = 24, ...props }: IconProps & { name: TechKey }) {
  const icon = techIcons[name]
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={icon.title} {...props}>
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  )
}

function Glyph({ path, size = 20, ...props }: IconProps & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d={path} />
    </svg>
  )
}

export const GithubIcon = (props: IconProps) => <Glyph path={siGithub.path} {...props} />
export const TelegramIcon = (props: IconProps) => <Glyph path={siTelegram.path} {...props} />
export const LinkedinIcon = (props: IconProps) => (
  <Glyph
    path="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.6h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.52 4.77 5.8v5.55h-4v-4.92c0-1.17-.02-2.68-1.7-2.68-1.7 0-1.96 1.28-1.96 2.6v5h-4v-11Z"
    {...props}
  />
)
