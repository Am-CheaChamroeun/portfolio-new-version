import { memo, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useOSActions } from './hooks'
import type { AppDef } from './registry'

type Props = { def: AppDef; selected: boolean; running: boolean; onSelect: (id: AppDef['id']) => void }

const coarse = () => window.matchMedia('(pointer: coarse)').matches

/**
 * A desktop shortcut. Single click selects; double-click, Enter or a tap on a touch
 * screen opens the app.
 */
export const DesktopIcon = memo(function DesktopIcon({ def, selected, running, onSelect }: Props) {
  const { t } = useTranslation()
  const { openApp } = useOSActions()
  const Icon = def.icon
  const name = t(`os.apps.${def.id}`)

  const onClick = (e: MouseEvent) => {
    e.stopPropagation()
    onSelect(def.id)
    // detail 0 = keyboard activation, ≥ 2 = double click, coarse pointer = a tap
    if (e.detail === 0 || e.detail >= 2 || coarse()) openApp(def.id)
  }

  return (
    <button
      type="button"
      data-app={def.id}
      onClick={onClick}
      aria-label={name}
      aria-pressed={selected}
      className={`group relative flex w-[104px] flex-col items-center gap-1.5 rounded-xl px-1.5 pb-1.5 pt-2 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neon ${
        selected ? 'bg-warm/12 ring-1 ring-warm/20' : 'hover:bg-warm/8'
      }`}
    >
      <span
        className={`relative flex h-14 w-14 items-center justify-center rounded-[18px] border bg-gradient-to-b from-[#252a30] to-[#14171a] text-neon shadow-[0_8px_20px_-8px_rgba(0,0,0,0.9)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-neon/50 group-hover:shadow-[0_10px_28px_-8px_rgba(239,255,0,0.35)] ${
          selected ? 'border-neon/60' : 'border-edge'
        }`}
      >
        <Icon size={26} strokeWidth={1.6} />
        {running && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-neon shadow-[0_0_6px_#efff00]" />}
      </span>
      <span
        className={`line-clamp-2 w-full break-words text-[12px] font-medium leading-tight [text-shadow:0_1px_6px_rgba(0,0,0,0.9)] ${
          selected ? 'text-neon' : 'text-warm'
        }`}
      >
        {name}
      </span>
    </button>
  )
})
