import { Activity, BadgeCheck, FolderKanban, GraduationCap, Layers, MessagesSquare, UserRound, Wrench, type LucideIcon } from 'lucide-react'
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type AppId = 'about' | 'projects' | 'skills' | 'education' | 'certificates' | 'services' | 'monitor' | 'contact'

export type AppDef = {
  id: AppId
  icon: LucideIcon
  /** default window size on desktop (clamped to the screen) */
  w: number
  h: number
  minW: number
  minH: number
  Component: LazyExoticComponent<ComponentType>
}

/**
 * The app registry — the single list that drives desktop icons, the launcher,
 * the taskbar, the window manager and the mobile home screen.
 *
 * To add an app: create src/os/apps/MyApp.tsx (default export), add it here,
 * and add `os.apps.<id>` + `os.titles.<id>` to the three locale files.
 * Apps are lazy-loaded, so they cost nothing until first opened.
 */
export const apps: AppDef[] = [
  { id: 'about', icon: UserRound, w: 880, h: 600, minW: 520, minH: 380, Component: lazy(() => import('./apps/AboutApp')) },
  { id: 'projects', icon: FolderKanban, w: 980, h: 620, minW: 560, minH: 400, Component: lazy(() => import('./apps/ProjectsApp')) },
  { id: 'skills', icon: Layers, w: 920, h: 600, minW: 520, minH: 400, Component: lazy(() => import('./apps/SkillsApp')) },
  { id: 'education', icon: GraduationCap, w: 860, h: 560, minW: 520, minH: 380, Component: lazy(() => import('./apps/EducationApp')) },
  { id: 'certificates', icon: BadgeCheck, w: 940, h: 620, minW: 520, minH: 400, Component: lazy(() => import('./apps/CertificatesApp')) },
  { id: 'services', icon: Wrench, w: 980, h: 620, minW: 560, minH: 400, Component: lazy(() => import('./apps/ServicesApp')) },
  { id: 'monitor', icon: Activity, w: 940, h: 620, minW: 560, minH: 420, Component: lazy(() => import('./apps/MonitorApp')) },
  { id: 'contact', icon: MessagesSquare, w: 900, h: 620, minW: 520, minH: 420, Component: lazy(() => import('./apps/ContactApp')) },
]

export const appById = Object.fromEntries(apps.map((a) => [a.id, a])) as Record<AppId, AppDef>

/** Apps pinned to the mobile dock */
export const dockApps: AppId[] = ['about', 'projects', 'skills', 'contact']
