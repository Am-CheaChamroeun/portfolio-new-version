import { Desktop } from './Desktop'
import { useLayoutMode } from './layout'
import { MobileShell } from './MobileShell'

/** Picks the shell for the screen size: phone home screen, or the windowed desktop. */
export function OS() {
  const mode = useLayoutMode()
  return mode === 'mobile' ? <MobileShell /> : <Desktop mode={mode} />
}
