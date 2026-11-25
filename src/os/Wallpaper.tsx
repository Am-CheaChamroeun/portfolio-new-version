import { useMemo } from 'react'
import { useSettings, type Wallpaper as WallpaperId } from '../lib/settings'

/**
 * Desktop wallpapers — pure CSS + inline SVG (a few KB, no image download, no animation).
 * They are painted in the accent colour (--neon-rgb) at low opacity so content stays readable,
 * and they stay dark in both themes, like a real OS wallpaper.
 */
const A = (o: number) => `rgb(var(--neon-rgb) / ${o})`

/** A wavy contour line, generated deterministically so it never changes between renders. */
function contour(cx: number, cy: number, rx: number, ry: number, seed: number) {
  const pts: string[] = []
  const n = 72
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const wob = 1 + 0.07 * Math.sin(a * 3 + seed) + 0.045 * Math.sin(a * 5 - seed * 1.7) + 0.025 * Math.sin(a * 9 + seed * 2.3)
    pts.push(`${i ? 'L' : 'M'}${(cx + Math.cos(a) * rx * wob).toFixed(1)} ${(cy + Math.sin(a) * ry * wob).toFixed(1)}`)
  }
  return pts.join(' ') + 'Z'
}

function Grid() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 55% at 85% 8%, ${A(0.14)}, transparent 62%), radial-gradient(55% 60% at 8% 100%, ${A(0.1)}, transparent 60%)`,
        }}
      />
      <div className="grid-bg absolute inset-0 opacity-80 [--grid-line:rgba(245,245,233,0.035)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g style={{ stroke: 'var(--neon)' }} strokeWidth="1.2">
          <rect x="1010" y="-120" width="520" height="520" rx="64" transform="rotate(18 1270 140)" opacity="0.1" />
          <rect x="1090" y="-60" width="380" height="380" rx="48" transform="rotate(18 1280 130)" opacity="0.07" />
          <circle cx="1440" cy="780" r="260" opacity="0.07" />
          <circle cx="1440" cy="780" r="170" opacity="0.06" />
        </g>
        <g stroke="#F5F5E9" strokeWidth="1" opacity="0.07">
          <path d="M-40 640 L360 300 L760 640" />
          <path d="M-40 700 L360 360 L760 700" />
        </g>
        <path d="M0 820 C 300 740, 520 880, 900 790 S 1400 720, 1600 780" style={{ stroke: 'var(--neon)' }} strokeWidth="1" opacity="0.12" />
      </svg>
    </>
  )
}

function Wave() {
  const layers = [0, 1, 2, 3, 4, 5, 6]
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 60% at 50% 100%, ${A(0.16)}, transparent 65%), radial-gradient(45% 45% at 90% 0%, ${A(0.08)}, transparent 60%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="wv" x1="0" x2="1">
            <stop offset="0" stopColor="rgb(var(--neon-rgb))" stopOpacity="0" />
            <stop offset="0.5" stopColor="rgb(var(--neon-rgb))" stopOpacity="1" />
            <stop offset="1" stopColor="rgb(var(--neon-rgb))" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {layers.map((i) => {
          const y = 470 + i * 46
          const amp = 70 - i * 6
          return (
            <path
              key={i}
              d={`M-40 ${y} C 260 ${y - amp}, 520 ${y + amp}, 800 ${y} S 1340 ${y - amp}, 1640 ${y + amp * 0.4}`}
              stroke="url(#wv)"
              strokeWidth={i === 2 ? 2.2 : 1.1}
              opacity={0.42 - i * 0.035}
            />
          )
        })}
        <path d="M-40 560 C 260 490, 520 630, 800 560 S 1340 490, 1640 580 L1640 900 L-40 900Z" fill="rgb(var(--neon-rgb))" opacity="0.035" />
      </svg>
    </>
  )
}

function Geometric() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(50% 55% at 78% 30%, ${A(0.1)}, transparent 65%)` }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="#F5F5E9" strokeWidth="1" opacity="0.09">
          <path d="M1600 0 L1180 520 L1600 900" />
          <path d="M1180 520 L760 0" />
          <path d="M1180 520 L900 900" />
          <path d="M0 360 L420 900" />
          <path d="M0 120 L520 0" />
        </g>
        <g fill="rgb(var(--neon-rgb))">
          <path d="M1600 0 L1180 520 L1600 900Z" opacity="0.045" />
          <path d="M1180 520 L760 0 L1600 0Z" opacity="0.03" />
          <path d="M0 360 L420 900 L0 900Z" opacity="0.04" />
        </g>
        <g style={{ stroke: 'var(--neon)' }} strokeWidth="1.2" opacity="0.2">
          <path d="M1180 520 L1310 360 L1440 520 L1310 680Z" />
          <path d="M1310 440 L1370 520 L1310 600 L1250 520Z" opacity="0.7" />
          <path d="M120 760 L200 680 L280 760Z" />
        </g>
        <g fill="rgb(var(--neon-rgb))" opacity="0.4">
          <circle cx="1180" cy="520" r="3" />
          <circle cx="1440" cy="520" r="3" />
          <circle cx="420" cy="900" r="3" />
        </g>
      </svg>
    </>
  )
}

function Topo() {
  const rings = useMemo(
    () => [
      ...[60, 120, 190, 270, 360, 460, 570].map((r, i) => ({ d: contour(1180, 330, r * 1.25, r * 0.8, 1 + i * 0.35), o: 0.3 - i * 0.025 })),
      ...[50, 110, 180, 260, 350].map((r, i) => ({ d: contour(260, 760, r * 1.2, r * 0.75, 3 + i * 0.5), o: 0.26 - i * 0.03 })),
    ],
    [],
  )
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(55% 55% at 74% 34%, ${A(0.06)}, transparent 70%)` }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g style={{ stroke: 'var(--neon)' }} strokeWidth="1">
          {rings.map((r, i) => (
            <path key={i} d={r.d} opacity={r.o} />
          ))}
        </g>
      </svg>
    </>
  )
}

const scenes: Record<WallpaperId, () => React.JSX.Element> = { grid: Grid, wave: Wave, geometric: Geometric, topo: Topo }

/** The artwork on its own — also used for the preview thumbnails in Settings. */
export function WallpaperArt({ id, boost = false }: { id: WallpaperId; boost?: boolean }) {
  const Scene = scenes[id]
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-graphite">
      {/* thumbnails are brightened so the previews read clearly at small size */}
      <div className="absolute inset-0" style={boost ? { filter: 'brightness(2.6) saturate(1.2)' } : undefined}>
        <Scene />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  )
}

/** The desktop background, following the visitor's choice in Settings. */
export function Wallpaper() {
  const { wallpaper } = useSettings()
  return <WallpaperArt id={wallpaper} />
}
