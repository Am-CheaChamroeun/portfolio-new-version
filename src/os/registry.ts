import {
  Activity,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Layers,
  MessagesSquare,
  Settings,
  SquareTerminal,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type AppId = 'about' | 'projects' | 'skills' | 'education' | 'experience' | 'services' | 'monitor' | 'terminal' | 'contact' | 'settings'

export type AppDef = {
  id: AppId
  icon: LucideIcon
  Component: LazyExoticComponent<ComponentType>
}

/**
 * The app registry — the single list that drives desktop icons, the launcher,
 * the taskbar, the workspace and the mobile home screen.
 *
 * To add an app: create src/os/apps/MyApp.tsx (default export), add it here,
 * and add `os.apps.<id>` + `os.titles.<id>` to the three locale files.
 * Apps are lazy-loaded, so they cost nothing until first opened.
 */
export const apps: AppDef[] = [
  {
    id: 'about',
    icon: UserRound,
    Component: lazy(() => import('./apps/AboutApp')),
  },
  {
    id: 'projects',
    icon: FolderKanban,
    Component: lazy(() => import('./apps/ProjectsApp')),
  },
  {
    id: 'skills',
    icon: Layers,
    Component: lazy(() => import('./apps/SkillsApp')),
  },
  {
    id: 'education',
    icon: GraduationCap,
    Component: lazy(() => import('./apps/EducationApp')),
  },
  {
    id: 'experience',
    icon: Briefcase,
    Component: lazy(() => import('./apps/ExperienceApp')),
  },
  {
    id: 'services',
    icon: Wrench,
    Component: lazy(() => import('./apps/ServicesApp')),
  },
  {
    id: 'monitor',
    icon: Activity,
    Component: lazy(() => import('./apps/MonitorApp')),
  },
  {
    id: 'terminal',
    icon: SquareTerminal,
    Component: lazy(() => import('./apps/TerminalApp')),
  },
  {
    id: 'contact',
    icon: MessagesSquare,
    Component: lazy(() => import('./apps/ContactApp')),
  },
  {
    id: 'settings',
    icon: Settings,
    Component: lazy(() => import('./apps/SettingsApp')),
  },
]

export const appById = Object.fromEntries(apps.map((a) => [a.id, a])) as Record<AppId, AppDef>

/** Apps pinned to the mobile dock */
export const dockApps: AppId[] = ['about', 'projects', 'skills', 'contact']
