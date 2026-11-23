import { ArrowLeft, ArrowUpRight, FolderOpen, Globe, LayoutGrid, List, Sparkles } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MockBadge } from '../../components/ui/MockBadge'
import { mockImages, pickImage } from '../../data/images'
import { featuredProject, projects, socials, type Project } from '../../data/portfolio'
import { GithubIcon } from '../../lib/icons'
import { Eyebrow, Pill, StatusBar, TechBadge, Toolbar } from './shared'

const all: Project[] = [featuredProject, ...projects]

type ProjectText = { tagline?: string; description: string; highlights: string[] }

/** A project's translated text (content.projects.<slug> in the locale files). */
function useProjectText(slug: string): ProjectText {
  const { t } = useTranslation()
  const text = t(`content.projects.${slug}` as 'content.projects.featured-project', { returnObjects: true }) as unknown
  return typeof text === 'object' && text ? (text as ProjectText) : { description: '', highlights: [] }
}

const coarse = () => window.matchMedia('(pointer: coarse)').matches

/** Screenshot (real one first, labelled concept art until then), or a lettered tile. */
function Thumb({ project, className = '' }: { project: Project; className?: string }) {
  const { t } = useTranslation()
  const image = pickImage(project.image, mockImages.projects[project.slug])
  return (
    <div className={`relative overflow-hidden bg-graphite ${className}`} style={{ boxShadow: `inset 0 0 0 1px ${project.accent}22` }}>
      {image ? (
        <>
          <img
            src={image.src}
            alt={image.isMock ? t('images.alt.project', { name: project.name }) : t('projects.previewAlt', { name: project.name })}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full ${!image.isMock && project.imageFit === 'contain' ? 'object-contain p-4' : 'object-cover object-top'}`}
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
  return project.liveUrl ? <Pill>{t('projects.live')}</Pill> : <Pill tone="muted">{t('projects.repoOnly')}</Pill>
}

function Details({ project }: { project: Project }) {
  const { t } = useTranslation()
  const text = useProjectText(project.slug)
  const featured = project.slug === featuredProject.slug
  return (
    <div className="@container h-full overflow-y-auto">
      <div className="grid gap-6 p-4 @2xl:p-6 @3xl:grid-cols-[1.1fr_1fr]">
        <Thumb project={project} className="aspect-video rounded-xl border border-card-border @3xl:self-start" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-graphite px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-neon ring-1 ring-neon/40">
                <Sparkles size={11} />
                {t('projects.featured')}
              </span>
            )}
            <Status project={project} />
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">{project.name}</h3>
          {text.tagline && <p className="mt-0.5 text-[14px] font-medium text-primary">{text.tagline}</p>}
          <p className="mt-3 text-[14px] leading-7 text-muted">{text.description}</p>

          <Eyebrow className="mt-5">{t('os.projects.techStack')}</Eyebrow>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {project.tech.map((n) => (
              <li key={n}>
                <TechBadge name={n} />
              </li>
            ))}
          </ul>

          <Eyebrow className="mt-5">{t('os.projects.highlights')}</Eyebrow>
          <ul className="mt-2 space-y-1.5">
            {text.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-6 text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>

          <Eyebrow className="mt-5">{t('os.projects.links')}</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-cta px-4 py-2 text-[13px] font-semibold text-on-cta transition-colors hover:bg-cta-hover"
              >
                <Globe size={15} />
                {t('projects.visitLive')}
                <ArrowUpRight size={14} />
              </a>
            )}
            <a
              href={project.repoUrl || socials.github.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-sheet px-4 py-2 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <GithubIcon size={15} />
              {t('projects.viewRepo')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Projects → a file explorer: project "folders" with thumbnails; opening one shows its details. */
export default function ProjectsApp() {
  const { t } = useTranslation()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<string | null>(null)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const current = all.find((p) => p.slug === openSlug)

  const open = (slug: string) => {
    setSelected(slug)
    setOpenSlug(slug)
  }
  const onItem = (slug: string) => (e: MouseEvent) => {
    setSelected(slug)
    if (e.detail === 0 || e.detail >= 2 || coarse()) open(slug)
  }

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
        <nav aria-label={t('os.projects.path')} className="flex min-w-0 flex-1 items-center gap-0.5 rounded-md border border-card-border bg-sheet px-2 py-1 font-mono text-[12px] text-muted">
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
              className={`mt-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
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
            <Details project={current} />
          ) : view === 'grid' ? (
            <ul className="grid h-full content-start gap-3 overflow-y-auto p-4 @md:grid-cols-2 @3xl:grid-cols-3">
              {all.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={onItem(p.slug)}
                    aria-pressed={selected === p.slug}
                    className={`group block w-full rounded-xl border p-2 text-left transition-all hover:-translate-y-0.5 ${
                      selected === p.slug ? 'border-primary bg-glow' : 'border-card-border bg-sheet hover:border-line-strong'
                    }`}
                  >
                    <Thumb project={p} className="aspect-video rounded-lg" />
                    <div className="px-1 pb-1 pt-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13.5px] font-semibold">{p.name}</p>
                        <Status project={p} />
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-faint">{p.tech.join(' · ')}</p>
                    </div>
                  </button>
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
        {selected && !current && <span className="truncate">{t('os.projects.selected', { name: all.find((p) => p.slug === selected)?.name })}</span>}
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
