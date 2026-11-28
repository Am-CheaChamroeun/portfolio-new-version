import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Project } from '../../data/portfolio'
import { GithubIcon } from '../../lib/icons'
import { publicLiveUrl, repoLink } from '../../lib/url'

/**
 * The two actions every project can have: Live Demo (primary, only when a valid public `liveUrl` exists)
 * and Source Code (secondary, from `repoUrl`). Both open in a new tab with rel="noopener noreferrer".
 * Reused by the project cards and the case-study header; a future project only needs `liveUrl` / `repoUrl`.
 */
export function ProjectActions({
  project,
  size = 'md',
  fallbackRepo,
  className = '',
}: {
  project: Pick<Project, 'name' | 'liveUrl' | 'repoUrl'>
  size?: 'sm' | 'md'
  /** used for Source Code when the project has no `repoUrl` of its own */
  fallbackRepo?: string
  className?: string
}) {
  const { t } = useTranslation()
  const live = publicLiveUrl(project.liveUrl)
  const repo = repoLink(project.repoUrl) ?? repoLink(fallbackRepo)
  if (!live && !repo) return null
  const pad = size === 'sm' ? 'px-3 py-2 text-[12.5px]' : 'px-4 py-2.5 text-[13px]'
  const base = `btn-glow inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${pad}`
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {live && (
        <a
          href={live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('projects.liveDemoAria', { name: project.name })}
          className={`${base} bg-neon text-graphite hover:bg-gold`}
        >
          {t('projects.liveDemo')}
          <ExternalLink size={size === 'sm' ? 13 : 14} aria-hidden="true" />
        </a>
      )}
      {repo && (
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('projects.sourceCodeAria', { name: project.name })}
          className={`${base} border border-card-border bg-sheet text-fg hover:border-primary/60 hover:text-primary`}
        >
          <GithubIcon size={size === 'sm' ? 13 : 15} aria-hidden="true" />
          {t('projects.sourceCode')}
        </a>
      )}
    </div>
  )
}
