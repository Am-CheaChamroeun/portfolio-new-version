import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOSActions } from './hooks'
import type { AppDef } from './registry'

type Props = { def: AppDef; active: boolean }

/** A desktop shortcut: one click (or tap, or Enter) shows the app in the workspace. */
export const DesktopIcon = memo(function DesktopIcon({ def, active }: Props) {
  const { t } = useTranslation()
  const { openApp } = useOSActions()
  const Icon = def.icon
  const name = t(`os.apps.${def.id}`)

  return (
    <button
      type="button"
      data-app={def.id}
      data-tip={name}
      onClick={() => openApp(def.id)}
      aria-label={name}
      aria-current={active ? 'page' : undefined}
      className={`tip tip-r group relative flex w-[104px] flex-col items-center gap-1 rounded-xl px-1.5 pb-1 pt-1.5 [@media(max-height:1000px)]:gap-0.5 [@media(max-height:1000px)]:pb-0.5 [@media(max-height:1000px)]:pt-1 text-center outline-none transition-[background-color,scale] duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-neon ${
        active ? 'bg-warm/12 ring-1 ring-warm/20' : 'hover:bg-warm/8'
      }`}
    >
      <span
        className={`relative flex h-14 w-14 items-center justify-center rounded-[18px] [@media(max-height:1000px)]:h-12 [@media(max-height:1000px)]:w-12 [@media(max-height:1000px)]:rounded-2xl [@media(max-height:820px)]:h-9 [@media(max-height:820px)]:w-9 [@media(max-height:820px)]:rounded-xl border bg-gradient-to-b from-[#252a30] to-[#14171a] text-neon shadow-[0_8px_20px_-8px_rgba(0,0,0,0.9)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-100 group-hover:border-neon/50 group-hover:shadow-[0_10px_28px_-8px_rgb(var(--neon-rgb)/0.35)] ${
          active ? 'border-neon/60' : 'border-edge'
        }`}
      >
        <Icon
          strokeWidth={1.6}
          className="h-[26px] w-[26px] [@media(max-height:1000px)]:h-6 [@media(max-height:1000px)]:w-6 [@media(max-height:820px)]:h-5 [@media(max-height:820px)]:w-5"
        />
        {active && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-neon shadow-[0_0_6px_var(--neon)]" />}
      </span>
      <span
        className={`line-clamp-2 w-full break-words text-[12px] [@media(max-height:820px)]:line-clamp-1 [@media(max-height:820px)]:text-[10.5px] font-medium leading-tight [text-shadow:0_1px_6px_rgba(0,0,0,0.9)] ${
          active ? 'text-neon' : 'text-warm'
        }`}
      >
        {name}
      </span>
    </button>
  )
})
