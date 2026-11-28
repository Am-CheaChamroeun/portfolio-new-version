import { ArrowLeft, ArrowRight, ArrowUpRight, FolderOpen, LayoutGrid, List } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MockBadge } from '../../components/ui/MockBadge'
import { mockImages, pickImage } from '../../data/images'
import { socials, type Project } from '../../data/portfolio'
import { coverFor } from '../../data/projectMedia'
import { visibleProjects } from '../../data/visible'
import { useIsDark } from '../../hooks/useIsDark'
import { GithubIcon } from '../../lib/icons'
import { publicLiveUrl } from '../../lib/url'
import { ProjectActions } from './ProjectActions'
import { useOSActions, useOSState } from '../hooks'
import { CaseStudy, projectCategory, type ProjectText } from './CaseStudy'
import { BrowserFrame, EmptyState, Eyebrow, Pill, StatusBar, TechBadge, Toolbar } from './shared'

const all: Project[] = visibleProjects

/** A project's translated text (content.projects.<slug> in the locale files). */
function useProjectText(slug: string): ProjectText {
  const { t } = useTranslation()
  const text = t(`content.projects.${slug}` as 'content.projects.cashcompass', { returnObjects: true }) as unknown
  return typeof text === 'object' && text ? (text as ProjectText) : { description: '', highlights: [] }
}

const coarse = () => window.matchMedia('(pointer: coarse)').matches

/** Screenshot (real one first, labelled concept art until then), or a lettered tile. */
function Thumb({ project, className = '' }: { project: Project; className?: string }) {
  const { t } = useTranslation()
  const cover = coverFor(project.slug, useIsDark()) // the theme-matched local cover wins over `project.image`
  const image = cover ? { src: cover, isMock: false } : pickImage(project.image, mockImages.projects[project.slug])
  return (
    <div className={`relative overflow-hidden bg-graphite ${className}`} style={{ boxShadow: `inset 0 0 0 1px ${project.accent}22` }}>
      {image ? (
        <>
          <img
            src={image.src}
            alt={image.isMock ? t('images.alt.project', { name: project.name }) : t('projects.previewAlt', { name: project.name })}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full ${!image.isMock && !cover && project.imageFit === 'contain' ? 'object-contain p-4' : 'object-cover object-top'}`}
          />
          {image.isMock && <MockBadge kind="concept" className="absolute right-2 top-2" />}
        </>
      ) : (
        <div className="grid-bg flex h-full items-center justify-center text-5xl font-semibold" style={{ color: project.accent }}>
          {project.name.replace(/[^A-Za-z]/g, '').charAt(0) || 'P'}
        </div>
      )}
    </div>
  )
}

function Status({ project }: { project: Project }) {
  const { t } = useTranslation()
  return publicLiveUrl(project.liveUrl) ? <Pill>{t('projects.live')}</Pill> : <Pill tone="muted">{t('projects.repoOnly')}</Pill>
}

/** Premium project card: browser-frame preview, category, tech badges and a neon-lit hover. */
function ProjectCard({
  project: p,
  selected,
  onSelect,
  onPreview,
}: {
  project: Project
  selected: boolean
  onSelect: (e: MouseEvent) => void
  onPreview: () => void
}) {
  const { t } = useTranslation()
  const text = useProjectText(p.slug)
  const category = projectCategory(p)
  const shown = p.tech.slice(0, 4)
  return (
    <div
      className={`group relative flex h-full flex-col rounded-2xl border p-2.5 transition-all duration-200 hover:-translate-y-1 ${
        selected
          ? 'border-neon/70 bg-glow shadow-[0_0_28px_-10px_rgb(var(--neon-rgb)/0.55)]'
          : 'border-card-border bg-sheet hover:border-neon/50 hover:shadow-[0_14px_36px_-16px_rgb(var(--neon-rgb)/0.4)]'
      }`}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={p.name} className="rounded-xl text-left">
        <BrowserFrame label={`${p.slug}.app`}>
          <Thumb project={p} className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]" />
        </BrowserFrame>
      </button>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{t(`os.projects.category.${category}`)}</span>
          <Status project={p} />
        </div>
        <p className="mt-1.5 truncate text-[15px] font-semibold">{p.name}</p>
        {text.tagline && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-5 text-muted">{text.tagline}</p>}
        <ul className="mt-2.5 flex flex-wrap gap-1">
          {shown.map((n) => (
            <li key={n}>
              <TechBadge name={n} compact />
            </li>
          ))}
          {p.tech.length > shown.length && <li className="px-1 py-0.5 font-mono text-[10.5px] text-faint">+{p.tech.length - shown.length}</li>}
        </ul>
        <ProjectActions project={p} size="sm" className="mt-3.5 [&>a]:flex-1" />
        <button
          type="button"
          onClick={onPreview}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-primary"
        >
          {t('os.projects.preview')}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

/** Projects → a file explorer: project "folders" with thumbnails; opening one shows its details. */
export default function ProjectsApp() {
  const { t } = useTranslation()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<string | null>(null)
  const { projectSlug: openSlug } = useOSState()
  const { openProject } = useOSActions()
  const current = all.find((p) => p.slug === openSlug)
  const currentText = useProjectText(current?.slug ?? '')
  const setOpenSlug = openProject

  const open = (slug: string) => {
    setSelected(slug)
    openProject(slug)
  }
  const onItem = (slug: string) => (e: MouseEvent) => {
    setSelected(slug)
    if (e.detail === 0 || e.detail >= 2 || coarse()) open(slug)
  }

  if (all.length === 0) return <EmptyState icon={FolderOpen} title={t('os.empty.projects.title')} text={t('os.empty.projects.text')} />

  const crumb = 'rounded px-1.5 py-0.5 hover:bg-fg/10'
  return (
    <div className="@container flex h-full min-h-0 flex-col">
      <Toolbar>
        <button
          type="button"
          onClick={() => setOpenSlug(null)}
          disabled={!current}
          aria-label={t('os.projects.back')}
          title={t('os.projects.back')}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-fg/10 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowLeft size={16} />
        </button>
        <nav
          aria-label={t('os.projects.path')}
          className="flex min-w-0 flex-1 items-center gap-0.5 rounded-md border border-card-border bg-sheet px-2 py-1 font-mono text-[12px] text-muted"
        >
          <FolderOpen size={13} className="mr-1 shrink-0 text-primary" />
          <button type="button" onClick={() => setOpenSlug(null)} className={crumb} aria-current={current ? undefined : 'page'}>
            ~/{t('os.projects.path').toLowerCase()}
          </button>
          {current && (
            <>
              <span className="text-faint">/</span>
              <span aria-current="page" className="truncate px-1.5 py-0.5 text-fg">
                {current.slug}
              </span>
            </>
          )}
        </nav>
        {!current && (
          <div role="group" aria-label={t('os.projects.view')} className="flex rounded-md border border-card-border bg-sheet p-0.5">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                aria-label={t(`os.projects.${v}`)}
                title={t(`os.projects.${v}`)}
                onClick={() => setView(v)}
                className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${view === v ? 'bg-graphite text-neon' : 'text-muted hover:text-fg'}`}
              >
                {v === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>
        )}
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <nav aria-label={t('os.projects.quick')} className="hidden w-48 shrink-0 overflow-y-auto border-r border-card-border bg-bg-subtle/50 p-2 @3xl:block">
          <Eyebrow className="px-2 pb-1.5 pt-1">{t('os.projects.quick')}</Eyebrow>
          <button
            type="button"
            onClick={() => setOpenSlug(null)}
            aria-current={!current ? 'page' : undefined}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${!current ? 'bg-graphite text-neon' : 'text-muted hover:bg-fg/10 hover:text-fg'}`}
          >
            <LayoutGrid size={14} />
            {t('os.projects.all')}
          </button>
          {all.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => open(p.slug)}
              aria-current={openSlug === p.slug ? 'page' : undefined}
              className={`mt-1.5 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] transition-colors ${
                openSlug === p.slug ? 'bg-graphite text-neon' : 'text-muted hover:bg-fg/10 hover:text-fg'
              }`}
            >
              <FolderOpen size={14} className="shrink-0" />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {current ? (
            <CaseStudy key={current.slug} project={current} text={currentText} all={all} onBack={() => openProject(null)} onOpen={open} />
          ) : view === 'grid' ? (
            <ul className="grid h-full content-start gap-4 overflow-y-auto p-4 @md:grid-cols-2 @3xl:grid-cols-3">
              {all.map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={p} selected={selected === p.slug} onSelect={onItem(p.slug)} onPreview={() => open(p.slug)} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full overflow-y-auto p-2">
              <ul>
                {all.map((p) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={onItem(p.slug)}
                      aria-pressed={selected === p.slug}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${selected === p.slug ? 'bg-glow ring-1 ring-primary/50' : 'hover:bg-fg/5'}`}
                    >
                      <Thumb project={p} className="h-10 w-16 shrink-0 rounded-md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                        <span className="block truncate font-mono text-[11px] text-faint">{p.tech.join(' · ')}</span>
                      </span>
                      <span className="hidden @md:block">
                        <Status project={p} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <StatusBar>
        <span>{t('os.projects.items', { n: all.length })}</span>
        {selected && !current && (
          <span className="truncate">
            {t('os.projects.selected', {
              name: all.find((p) => p.slug === selected)?.name,
            })}
          </span>
        )}
        <a
          href={socials.github.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-muted transition-colors hover:text-primary"
        >
          <GithubIcon size={12} />
          {t('projects.more')}
          <ArrowUpRight size={11} />
        </a>
      </StatusBar>
    </div>
  )
}
