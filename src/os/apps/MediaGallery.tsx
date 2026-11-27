import { ArrowLeft, ArrowRight, Maximize2, Play, VideoOff, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { MockBadge } from '../../components/ui/MockBadge'
import type { ResponsiveSrc } from '../../lib/cloudinary'
import { easeOut } from '../../lib/motion'
import { SmartImage, Skeleton } from './shared'

/** True once the element is within `margin` of the viewport (and stays true). Keeps below-the-fold media from loading early. */
function useNear<T extends HTMLElement>(margin = '300px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (near || !el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near, margin])
  return [ref, near] as const
}

/** One picture in a gallery. `remote` (Cloudinary) is tried first, then `local` (the bundled copy). */
export type GalleryItem = {
  id: string
  alt: string
  caption?: string
  isMock?: boolean
  local?: string
  remote?: { thumb: ResponsiveSrc; full: ResponsiveSrc }
}
export type GallerySet = { id: string; label: string; portrait?: boolean; items: GalleryItem[] }

const mainSrc = (i: GalleryItem) => i.remote?.full.src ?? i.local ?? ''
const mainFallback = (i: GalleryItem) => (i.remote ? i.local : undefined)

/** Small thumbnail: Cloudinary → local → plain tile (no error text at this size). */
function ThumbImg({ item, className }: { item: GalleryItem; className: string }) {
  const [step, setStep] = useState(0)
  const sources = [item.remote?.thumb.src, item.local].filter(Boolean) as string[]
  const src = sources[step]
  if (!src) return <span aria-hidden="true" className={`block bg-graphite-2 ${className}`} />
  return <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={() => setStep((s) => s + 1)} className={className} />
}

/** Full-size preview. Esc closes, ←/→ move, Tab stays inside. */
function Viewer({ items, index, onIndex, onClose }: { items: GalleryItem[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { t } = useTranslation()
  const box = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const item = items[index]
  const step = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex])

  useEffect(() => closeBtn.current?.focus(), [])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    } else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'Tab') {
      const f = box.current?.querySelectorAll<HTMLElement>('button:not([disabled])')
      if (!f?.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const nav = 'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-graphite/80 text-warm ring-1 ring-edge transition-colors hover:text-neon focus-visible:outline-2'
  return createPortal(
    <div
      ref={box}
      role="dialog"
      aria-modal="true"
      aria-label={item.caption ?? item.alt}
      onKeyDown={onKey}
      className="os-chrome fixed inset-0 z-[1000] flex flex-col bg-black/90 text-warm backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 truncate text-[13px]">{item.caption ?? item.alt}</p>
        <span className="font-mono text-[11px] text-steel">{t('os.projects.study.shot', { n: index + 1, total: items.length })}</span>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label={t('os.projects.study.closeViewer')}
          className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-edge transition-colors hover:text-neon"
        >
          <X size={18} />
        </button>
      </div>
      {/* a click on the dark area closes the preview */}
      <div className="relative min-h-0 flex-1 px-4 pb-4 sm:px-16" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <SmartImage
          key={item.id}
          src={mainSrc(item)}
          srcSet={item.remote?.full.srcSet}
          sizes="100vw"
          fallback={mainFallback(item)}
          alt={item.alt}
          className="h-full w-full"
          imgClassName="object-contain"
        />
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label={t('os.projects.study.prevShot')} className={`${nav} left-2 sm:left-4`}>
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label={t('os.projects.study.nextShot')} className={`${nav} right-2 sm:right-4`}>
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

/**
 * The case-study gallery: one set (e.g. desktop) or several (desktop + mobile tabs), a main picture, a scrollable
 * thumbnail strip and a full-size preview. Pictures load only when they are shown (thumbnails are lazy).
 */
export function MediaGallery({ title, sets }: { title: string; sets: GallerySet[] }) {
  const { t } = useTranslation()
  const [setIdx, setSetIdx] = useState(0)
  const [shot, setShot] = useState(0)
  const [open, setOpen] = useState(false)
  const openBtn = useRef<HTMLButtonElement>(null)
  const [root, near] = useNear<HTMLDivElement>()
  const set = sets[Math.min(setIdx, sets.length - 1)]
  const items = set.items
  const i = Math.min(shot, items.length - 1)
  const cur = items[i]
  const step = (d: number) => setShot((i + d + items.length) % items.length)

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (open || items.length < 2) return
    if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
  }
  const nav =
    'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-graphite/80 text-warm ring-1 ring-edge transition-colors hover:text-neon'

  if (!near)
    return (
      <div ref={root} aria-busy="true" className="relative aspect-[16/10] overflow-hidden rounded-xl border border-card-border bg-graphite">
        <Skeleton className="absolute inset-0" />
      </div>
    )

  return (
    <div onKeyDown={onKey}>
      {sets.length > 1 && (
        <div role="group" aria-label={title} className="mb-3 inline-flex rounded-lg border border-card-border p-0.5">
          {sets.map((s, n) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={n === setIdx}
              onClick={() => {
                setSetIdx(n)
                setShot(0)
              }}
              className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${n === setIdx ? 'bg-graphite text-neon' : 'text-muted hover:text-primary'}`}
            >
              {s.label} <span className="font-mono text-[10.5px] opacity-70">{s.items.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-card-border bg-graphite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${set.id}-${cur.id}`}
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: easeOut }}
          >
            <button
              ref={openBtn}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`${t('os.projects.study.openFull')}: ${cur.caption ?? cur.alt}`}
              className={`group relative block w-full cursor-zoom-in ${set.portrait ? 'mx-auto max-w-[260px] py-4' : ''}`}
            >
              <SmartImage
                src={mainSrc(cur)}
                srcSet={cur.remote?.full.srcSet}
                sizes={cur.remote?.full.sizes}
                fallback={mainFallback(cur)}
                alt={cur.alt}
                lazy
                className={set.portrait ? 'aspect-[780/1688] overflow-hidden rounded-lg' : 'aspect-[16/10]'}
                imgClassName={set.portrait ? 'object-contain' : 'object-cover'}
              />
              <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-graphite/80 text-warm opacity-0 ring-1 ring-edge transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 size={14} aria-hidden="true" />
              </span>
            </button>
          </motion.div>
        </AnimatePresence>
        {cur.isMock && <MockBadge kind="sample" className="absolute right-3 top-3" />}
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label={t('os.projects.study.prevShot')} className={`${nav} left-2`}>
              <ArrowLeft size={16} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label={t('os.projects.study.nextShot')} className={`${nav} right-2`}>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[12.5px] text-muted">{cur.caption}</p>
        <span className="shrink-0 font-mono text-[11px] text-faint">{t('os.projects.study.shot', { n: i + 1, total: items.length })}</span>
      </div>

      <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label={set.label}>
        {items.map((g, n) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setShot(n)}
            aria-pressed={n === i}
            aria-label={t('os.projects.study.viewShot', { n: n + 1 })}
            title={g.caption ?? t('os.projects.study.viewShot', { n: n + 1 })}
            className={`shrink-0 overflow-hidden rounded-lg border bg-graphite transition-all ${set.portrait ? 'h-24 w-11' : 'h-14 w-24 @md:h-16 @md:w-28'} ${
              n === i ? 'border-neon shadow-[0_0_16px_-4px_rgb(var(--neon-rgb)/0.6)]' : 'border-card-border opacity-70 hover:opacity-100'
            }`}
          >
            <ThumbImg item={g} className={`h-full w-full object-cover object-top`} />
          </button>
        ))}
      </div>

      {open && (
        <Viewer
          items={items}
          index={i}
          onIndex={setShot}
          onClose={() => {
            setOpen(false)
            requestAnimationFrame(() => openBtn.current?.focus()) // back to the picture button (the picture may have changed meanwhile)
          }}
        />
      )}
    </div>
  )
}

/**
 * Demo: a native <video> (no autoplay, nothing downloaded until Play). If there is only a GIF, or the video fails,
 * the GIF is offered behind a button so it is never downloaded together with the MP4.
 */
export function ProjectVideo({ src, gif, poster, title }: { src?: string; gif?: string; poster?: string; title: string }) {
  const { t } = useTranslation()
  const [videoFailed, setVideoFailed] = useState(false)
  const [gifOn, setGifOn] = useState(false)
  const [gifFailed, setGifFailed] = useState(false)
  const [root, near] = useNear<HTMLDivElement>()
  const useVideo = !!src && !videoFailed
  const useGif = !useVideo && !!gif && !gifFailed

  return (
    <div ref={root} className="relative aspect-video overflow-hidden rounded-xl border border-card-border bg-graphite">
      {!near ? (
        <Skeleton className="absolute inset-0" />
      ) : useVideo ? (
        <video
          src={src}
          poster={poster}
          controls
          playsInline
          preload="none"
          aria-label={title}
          onError={() => setVideoFailed(true)}
          className="h-full w-full bg-graphite object-contain"
        />
      ) : useGif && gifOn ? (
        <img src={gif} alt={title} onError={() => setGifFailed(true)} className="h-full w-full object-contain" />
      ) : useGif ? (
        <button type="button" onClick={() => setGifOn(true)} className="group relative block h-full w-full" aria-label={`${t('os.projects.study.playPreview')}: ${title}`}>
          {poster && <img src={poster} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-neon px-4 py-2 text-[12.5px] font-semibold text-graphite transition-transform group-hover:scale-105">
              <Play size={14} aria-hidden="true" />
              {t('os.projects.study.playPreview')}
            </span>
          </span>
        </button>
      ) : (
        <div role="status" className="flex h-full flex-col items-center justify-center gap-2 text-steel">
          <VideoOff size={24} aria-hidden="true" />
          <span className="text-[12.5px]">{t('os.projects.study.videoError')}</span>
        </div>
      )}
    </div>
  )
}
