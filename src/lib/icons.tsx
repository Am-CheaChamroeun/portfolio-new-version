import { Braces } from 'lucide-react'
import type { SVGProps } from 'react'
import { siGithub, siTelegram } from 'simple-icons'
import { resolveTech, techIcons } from './tech'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const TILE = {
  sm: { box: 'h-4 w-4 rounded-[4px]', icon: 11 },
  md: { box: 'h-7 w-7 rounded-md', icon: 17 },
  lg: { box: 'h-8 w-8 rounded-lg ring-1 ring-black/5', icon: 18 },
} as const

/**
 * The one way a technology logo is drawn everywhere: the official full-colour logo (brand colours, never the
 * theme accent) on a light tile so dark logos such as Next.js or Express stay visible on the dark background.
 * Technologies without an official icon get a neutral { } fallback. The name is always shown beside it,
 * so the tile itself is decorative (aria-hidden).
 */
export function TechTile({ tech, size = 'md' }: { tech: string; size?: keyof typeof TILE }) {
  const key = resolveTech(tech)
  const { box, icon } = TILE[size]
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center bg-warm ${box}`}>
      {key ? (
        <svg viewBox="0 0 24 24" width={icon} height={icon}>
          <path d={techIcons[key].path} fill={`#${techIcons[key].hex}`} />
        </svg>
      ) : (
        <Braces size={icon - 1} strokeWidth={2} className="text-graphite" />
      )}
    </span>
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
