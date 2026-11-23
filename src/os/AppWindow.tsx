import { Copy, Minus, Square, X } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, Suspense, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { easeOut } from '../lib/motion'
import { useOSActions } from './hooks'
import { desktopArea, type LayoutMode } from './layout'
import type { AppDef } from './registry'
import type { WinState } from './store'

type Props = { win: WinState; def: AppDef; focused: boolean; mode: Exclude<LayoutMode, 'mobile'> }

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max))

function Loading() {
  const { t } = useTranslation()
  return (
    <div role="status" className="flex h-full items-center justify-center gap-2 font-mono text-xs text-faint">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      {t('os.window.loading')}
    </div>
  )
}

/**
 * A reusable OS window. Geometry (x / y / w / h / z) lives in the central store; while the
 * pointer drags, the DOM is updated directly and the final position is committed once on
 * release, so dragging never re-renders the app inside.
 */
export const AppWindow = memo(function AppWindow({ win, def, focused, mode }: Props) {
  const { t } = useTranslation()
  const actions = useOSActions()
  const ref = useRef<HTMLElement>(null)
  const titleId = useId()
  const desktop = mode === 'desktop'
  const max = win.maximized || !desktop
  const Icon = def.icon
  const title = t(`os.titles.${win.id}`)

  // a minimized window stays mounted (keeps its state) but leaves the tab order and the screen
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    if (!win.minimized) return
    const id = setTimeout(() => setHidden(true), 220)
    return () => {
      clearTimeout(id)
      setHidden(false)
    }
  }, [win.minimized])

  // move keyboard focus into a window when it becomes the active one
  useEffect(() => {
    const el = ref.current
    if (focused && !win.minimized && el && !el.contains(document.activeElement)) el.focus({ preventScroll: true })
  }, [focused, win.minimized])

  /* ── dragging (title bar) ── */
  const drag = useRef<{ px: number; py: number; x: number; y: number; lx: number; ly: number } | null>(null)

  const onDragStart = (e: PointerEvent<HTMLDivElement>) => {
    if (!desktop || max || e.button !== 0 || (e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, lx: win.x, ly: win.y }
    ref.current!.dataset.dragging = 'true'
  }
  const onDragMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const area = desktopArea()
    d.lx = clamp(d.x + e.clientX - d.px, -(win.w - 140), area.w - 140)
    d.ly = clamp(d.y + e.clientY - d.py, 0, area.h - 44)
    ref.current!.style.left = `${d.lx}px`
    ref.current!.style.top = `${d.ly}px`
  }
  const onDragEnd = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    delete ref.current!.dataset.dragging
    if (d.lx !== win.x || d.ly !== win.y) actions.setRect(win.id, { x: d.lx, y: d.ly })
  }

  /* ── resizing (bottom-right corner) ── */
  const size = useRef<{ px: number; py: number; w: number; h: number; lw: number; lh: number } | null>(null)
  const onSizeStart = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    size.current = { px: e.clientX, py: e.clientY, w: win.w, h: win.h, lw: win.w, lh: win.h }
    ref.current!.dataset.dragging = 'true'
  }
  const onSizeMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = size.current
    if (!s) return
    const area = desktopArea()
    s.lw = clamp(s.w + e.clientX - s.px, def.minW, area.w - win.x)
    s.lh = clamp(s.h + e.clientY - s.py, def.minH, area.h - win.y)
    ref.current!.style.width = `${s.lw}px`
    ref.current!.style.height = `${s.lh}px`
  }
  const onSizeEnd = () => {
    const s = size.current
    if (!s) return
    size.current = null
    delete ref.current!.dataset.dragging
    actions.setRect(win.id, { w: s.lw, h: s.lh })
  }

  /* ── keyboard: arrow keys on the title bar move the window ── */
  const onTitleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!desktop || max || (e.target as HTMLElement).closest('button')) return
    const step = e.shiftKey ? 64 : 16
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
    const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
    if (!dx && !dy) return
    e.preventDefault()
    const area = desktopArea()
    actions.setRect(win.id, { x: clamp(win.x + dx, -(win.w - 140), area.w - 140), y: clamp(win.y + dy, 0, area.h - 44) })
  }

  const style = max
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  const ctl =
    'flex h-8 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-fg/10 hover:text-fg focus-visible:outline-offset-0 [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-11'

  return (
    <section
      ref={ref}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      inert={win.minimized}
      onPointerDownCapture={() => !focused && actions.focus(win.id)}
      style={{ ...style, visibility: win.minimized && hidden ? 'hidden' : 'visible', pointerEvents: win.minimized ? 'none' : 'auto' }}
      className="win-geom absolute outline-none data-[dragging=true]:transition-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={win.minimized ? { opacity: 0, scale: 0.88, y: 56 } : { opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ duration: 0.2, ease: easeOut }}
        style={{ transformOrigin: '50% 100%' }}
        className={`flex h-full w-full flex-col overflow-hidden border bg-sheet text-fg ${
          max ? 'rounded-none border-transparent' : 'rounded-xl'
        } ${focused ? 'border-primary/30 shadow-window-active' : 'border-card-border shadow-window'}`}
      >
        {/* title bar */}
        <div
          role="group"
          tabIndex={desktop && !max ? 0 : -1}
          aria-roledescription="draggable window handle"
          aria-label={t('os.window.move', { title })}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          onKeyDown={onTitleKey}
          onDoubleClick={(e) => desktop && !(e.target as HTMLElement).closest('button') && actions.toggleMaximize(win.id)}
          className={`flex h-10 shrink-0 select-none items-center gap-2.5 border-b border-card-border bg-titlebar pl-3 pr-1.5 touch-none [@media(pointer:coarse)]:h-12 ${
            desktop && !max ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
              focused ? 'bg-graphite text-neon ring-1 ring-neon/40' : 'bg-graphite-2 text-steel ring-1 ring-edge'
            }`}
          >
            <Icon size={14} strokeWidth={1.9} />
          </span>
          <h2 id={titleId} className={`truncate text-[13px] font-medium ${focused ? 'text-fg' : 'text-muted'}`}>
            {title}
          </h2>
          <div className="ml-auto flex items-center gap-0.5">
            <button type="button" onClick={() => actions.minimize(win.id)} aria-label={t('os.window.minimize')} title={t('os.window.minimize')} className={ctl}>
              <Minus size={15} />
            </button>
            {desktop && (
              <button
                type="button"
                onClick={() => actions.toggleMaximize(win.id)}
                aria-label={win.maximized ? t('os.window.restore') : t('os.window.maximize')}
                title={win.maximized ? t('os.window.restore') : t('os.window.maximize')}
                className={ctl}
              >
                {win.maximized ? <Copy size={13} className="-scale-x-100" /> : <Square size={12} />}
              </button>
            )}
            <button
              type="button"
              onClick={() => actions.close(win.id)}
              aria-label={t('os.window.close')}
              title={t('os.window.close')}
              className={`${ctl} hover:!bg-[#e5484d] hover:!text-white`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* content */}
        <div className="relative min-h-0 flex-1">
          <Suspense fallback={<Loading />}>
            <def.Component />
          </Suspense>
        </div>

        {desktop && !max && (
          <div
            aria-hidden="true"
            title={t('os.window.resize')}
            onPointerDown={onSizeStart}
            onPointerMove={onSizeMove}
            onPointerUp={onSizeEnd}
            onPointerCancel={onSizeEnd}
            className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize touch-none"
          >
            <svg viewBox="0 0 16 16" className="h-full w-full text-faint" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
              <path d="M13 5 5 13M13 9l-4 4" />
            </svg>
          </div>
        )}
      </motion.div>
    </section>
  )
})
