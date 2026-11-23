import createGlobe from 'cobe'
import { useEffect, useRef, useState } from 'react'
import { useIsDark } from '../../hooks/useIsDark'

type Props = { marker: [number, number] | null; className?: string }

/** Slowly rotating dot-globe (cobe), coloured like an ink sketch on paper. */
export function Globe({ marker, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const dark = useIsDark()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const size = canvas.offsetWidth || 200
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let phi = marker ? ((-marker[1] - 90) * Math.PI) / 180 : 0
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(2, window.devicePixelRatio || 1),
      width: size,
      height: size,
      phi,
      theta: 0.25,
      dark: dark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: dark ? 4 : 1.6,
      baseColor: dark ? [0.32, 0.34, 0.36] : [0.93, 0.93, 0.88],
      markerColor: dark ? [0.94, 1, 0] : [0.72, 0.64, 0],
      glowColor: dark ? [0.36, 0.38, 0.2] : [0.93, 0.93, 0.85],
      markers: marker ? [{ location: marker, size: 0.08 }] : [],
    })
    let frame = 0
    const loop = () => {
      if (!reduce) phi += 0.004
      globe.update({ phi })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    const t = setTimeout(() => setReady(true), 50)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(t)
      globe.destroy()
    }
  }, [dark, marker])

  return (
    <div className={`absolute inset-0 mx-auto aspect-square w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="size-full transition-opacity duration-500 [contain:layout_paint_size]"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  )
}
