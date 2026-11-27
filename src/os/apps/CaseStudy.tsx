import { isReducedMotion } from '../../lib/settings'
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MockBadge } from '../../components/ui/MockBadge'
import { mockImages, pickImage } from '../../data/images'
import { featuredProject, socials, type Project } from '../../data/portfolio'
import { coverFor, getProjectMedia, type MediaShot } from '../../data/projectMedia'
import { useIsDark } from '../../hooks/useIsDark'
import { SHOW_PLACEHOLDERS } from '../../lib/placeholder'
import { GithubIcon } from '../../lib/icons'
import { easeOut } from '../../lib/motion'
import { MediaGallery, ProjectVideo, type GalleryItem, type GallerySet } from './MediaGallery'
import { BrowserFrame, Eyebrow, Pill, SmartImage, TechBadge } from './shared'

export type ProjectText = {
  tagline?: string
  description: string
  highlights: string[]
}
type Study = {
  objectives?: string[]
  problem?: string
  solution?: string
  role?: string[]
  architecture?: string
  challenges?: string[]
}

/** Category worked out from the technology list (or set explicitly with `category` in portfolio.ts). */
export function projectCategory(p: Project): 'frontend' | 'fullstack' | 'backend' | 'cms' {
  if (p.category) return p.category
  const tech = p.tech.map((x) => x.toLowerCase())
  if (tech.includes('wordpress')) return 'cms'
  const back = tech.some((x) =>
    ['nestjs', 'node.js', 'express.js', 'spring boot', 'postgresql', 'docker', 'mongodb', 'mysql', 'supabase', 'firebase'].includes(x),
  )
  const front = tech.some((x) => ['react', 'next.js', 'vite', 'tailwind', 'vue', 'angular', 'nuxt.js'].includes(x))
  return back && front ? 'fullstack' : back ? 'backend' : 'frontend'
}

const layerOf = (name: string): 'client' | 'server' | 'data' | 'infra' => {
  const n = name.toLowerCase()
  if (['react', 'next.js', 'vite', 'typescript', 'javascript', 'tailwind', 'redux', 'vue', 'angular', 'nuxt.js', 'tanstack query'].includes(n)) return 'client'
  if (['nestjs', 'node.js', 'express.js', 'spring boot', 'graphql', 'postman'].includes(n)) return 'server'
  if (['postgresql', 'mongodb', 'mysql', 'supabase', 'firebase', 'wordpress'].includes(n)) return 'data'
  return 'infra'
}

/** One numbered section: label on the left, content on the right. */
function Section({ id, n, title, children, tag }: { id: string; n: number; title: string; children: ReactNode; tag?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="grid scroll-mt-14 gap-3 border-t border-card-border py-7 @3xl:grid-cols-[190px_1fr] @3xl:gap-10">
      <div>
        <p className="font-mono text-[11px] text-primary">{String(n).padStart(2, '0')}</p>
        <h2 id={`${id}-h`} className="mt-0.5 text-[17px] font-semibold tracking-tight">
          {title}
        </h2>
        {tag && <div className="mt-2">{tag}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

const bullets = (items: string[]) => (
  <ul className="space-y-2">
    {items.map((x, i) => (
      <li key={i} className="flex gap-3 text-[14px] leading-7 text-muted">
        <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        {x}
      </li>
    ))}
  </ul>
)

/** A detailed, product-style case study that fills the Projects workspace (no popup). */
export function CaseStudy({
  project,
  text,
  all,
  onBack,
  onOpen,
}: {
  project: Project
  text: ProjectText
  all: Project[]
  onBack: () => void
  onOpen: (slug: string) => void
}) {
  const { t, i18n } = useTranslation()
  const featured = project.slug === featuredProject.slug
  const category = projectCategory(project)
  const next = all[(all.findIndex((p) => p.slug === project.slug) + 1) % all.length]

  /* the case-study text: real when content.projects.<slug>.study exists, labelled placeholders until then */
  const studyKey = `content.projects.${project.slug}.study`
  const real =
    (i18n.exists(studyKey)
      ? (t(studyKey as 'content.projects.featured-project', {
          returnObjects: true,
        }) as unknown as Study)
      : {}) ?? {}
  const ph = (key: string) => t(`os.projects.study.placeholder.${key}` as 'os.projects.study.placeholder.problem', { returnObjects: true }) as unknown
  const study = {
    objectives: real.objectives ?? (ph('objectives') as string[]),
    problem: real.problem ?? (ph('problem') as string),
    solution: real.solution ?? (ph('solution') as string),
    role: real.role ?? (ph('role') as string[]),
    architecture: real.architecture ?? (ph('architecture') as string),
    challenges: real.challenges ?? (ph('challenges') as string[]),
  }
  const tag = (isReal: boolean) =>
    isReal ? null : (
      <div className="space-y-1">
        <MockBadge kind="placeholder" />
        <p className="font-mono text-[10px] leading-snug text-faint">{t('os.projects.study.placeholderNote', { slug: project.slug })}</p>
      </div>
    )

  /* media: theme-matched local cover, Cloudinary/local screenshots (desktop + mobile), demo video. Config: data/projectMedia.ts */
  const dark = useIsDark()
  const media = getProjectMedia(project.slug)
  const cover = coverFor(project.slug, dark)
  const alt = (n: number) => t('os.projects.study.shotAlt', { n, name: project.name })
  const shotItem = (s: MediaShot): GalleryItem => {
    const key = `content.projects.${project.slug}.media.${s.id}`
    const caption = i18n.exists(key) ? (t(key as 'content.projects.featured-project.tagline')) : s.caption
    return { id: s.id, caption, alt: t('os.projects.study.shotAltReal', { caption, name: project.name }), local: s.local, remote: s.remote }
  }
  const sets: GallerySet[] = []
  if (media?.desktop.length) sets.push({ id: 'desktop', label: t('os.projects.study.sets.desktop'), items: media.desktop.map(shotItem) })
  if (media?.mobile.length) sets.push({ id: 'mobile', label: t('os.projects.study.sets.mobile'), portrait: true, items: media.mobile.map(shotItem) })
  /* nothing configured: the project's own `gallery` paths, or its preview + labelled mock frames */
  const legacy = useMemo(() => {
    if (project.gallery?.length) return project.gallery.map((src) => ({ src, isMock: false }))
    const main = pickImage(project.image, mockImages.projects[project.slug])
    return [...(main ? [main] : []), ...mockImages.projectGallery.map((src) => ({ src, isMock: true }))]
  }, [project])
  if (!sets.length)
    sets.push({
      id: 'desktop',
      label: t('os.projects.study.gallery'),
      items: legacy.map((g, n) => ({ id: g.src, local: g.src, isMock: g.isMock, alt: g.isMock ? alt(n + 1) : t('projects.previewAlt', { name: project.name }) })),
    })
  const hero = cover ? { src: cover, isMock: false } : legacy[0]
  const hasDemo = !!(media?.video || media?.gif)

  const layers = (['client', 'server', 'data', 'infra'] as const)
    .map((l) => ({
      key: l,
      items: project.tech.filter((x) => layerOf(x) === l),
    }))
    .filter((l) => l.items.length)

  // sections whose real text has not been written yet stay hidden in production (visible in dev, with a placeholder tag)
  const vis: Record<string, boolean> = {
    overview: true,
    objectives: !!real.objectives || SHOW_PLACEHOLDERS,
    problem: (!!real.problem && !!real.solution) || SHOW_PLACEHOLDERS,
    role: !!real.role || SHOW_PLACEHOLDERS,
    stack: true,
    features: true,
    architecture: !!real.architecture || SHOW_PLACEHOLDERS,
    challenges: !!real.challenges || SHOW_PLACEHOLDERS,
    demo: hasDemo,
    gallery: sets.some((x) => x.items.some((g) => !g.isMock)) || SHOW_PLACEHOLDERS,
  }
  const order = Object.keys(vis).filter((k) => vis[k])
  const num = (id: string) => order.indexOf(id) + 1
  const sections = [
    ['overview', t('os.projects.study.overview')],
    ['objectives', t('os.projects.study.objectives')],
    ['problem', t('os.projects.study.problemSolution')],
    ['role', t('os.projects.study.role')],
    ['stack', t('os.projects.study.stack')],
    ['features', t('os.projects.study.features')],
    ['architecture', t('os.projects.study.architecture')],
    ['challenges', t('os.projects.study.challenges')],
    ['demo', t('os.projects.study.demo')],
    ['gallery', t('os.projects.study.gallery')],
  ] as const
  const shownSections = sections.filter(([id]) => vis[id])
  const go = (id: string) => {
    const reduce = isReducedMotion()
    document.getElementById(`cs-${id}`)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const btn = 'btn-glow inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all'
  const links = (
    <div className="flex flex-wrap gap-2">
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer" className={`${btn} bg-neon text-graphite hover:bg-gold`}>
          <Globe size={15} />
          {t('projects.visitLive')}
          <ArrowUpRight size={14} />
        </a>
      )}
      <a
        href={project.repoUrl || socials.github.url}
        target="_blank"
        rel="noreferrer"
        className={`${btn} border border-edge bg-graphite-2 text-warm hover:border-neon/60 hover:text-neon`}
      >
        <GithubIcon size={15} />
        {t('projects.viewRepo')}
      </a>
    </div>
  )

  return (
    <div className="@container h-full overflow-y-auto scroll-smooth motion-reduce:scroll-auto">
      {/* ── hero ── */}
      <header className="os-chrome relative isolate overflow-hidden bg-graphite text-warm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[80%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${project.accent}22` }}
        />
        <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10 opacity-40" />
        <div className="px-5 pb-0 pt-5 @2xl:px-8 @2xl:pt-7">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-steel transition-colors hover:text-neon"
          >
            <ArrowLeft size={14} />
            {t('os.projects.back')}
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-graphite-2 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-neon ring-1 ring-neon/40">
                <Sparkles size={11} />
                {t('projects.featured')}
              </span>
            )}
            <span className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-steel">
              {t(`os.projects.category.${category}`)}
            </span>
            {project.liveUrl ? <Pill>{t('projects.live')}</Pill> : <Pill tone="muted">{t('projects.repoOnly')}</Pill>}
          </div>
          <h1 className="mt-3 text-[clamp(1.75rem,4.2cqw,2.9rem)] font-semibold leading-[1.05] tracking-tight">{project.name}</h1>
          {text.tagline && <p className="mt-2 max-w-2xl text-[15px] text-neon">{text.tagline}</p>}
          <div className="mt-5">{links}</div>
        </div>

        {hero && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="relative mt-7 px-5 @2xl:px-10"
          >
            <BrowserFrame label={`${project.slug}.app`} className="relative mx-auto max-w-4xl rounded-b-none border-b-0">
              <SmartImage
                key={hero.src}
                src={hero.src}
                alt={hero.isMock ? alt(1) : t('projects.previewAlt', { name: project.name })}
                className="aspect-[16/9] bg-graphite"
                imgClassName="object-cover object-top"
              />
              {hero.isMock && <MockBadge kind="concept" className="absolute right-3 top-11" />}
            </BrowserFrame>
          </motion.div>
        )}
      </header>

      {/* ── in-page navigation ── */}
      <nav
        aria-label={t('os.projects.study.sections')}
        className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-card-border bg-sheet/90 px-4 py-2 backdrop-blur [scrollbar-width:none] @2xl:px-8"
      >
        {shownSections.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            className="shrink-0 rounded-md px-2.5 py-1 text-[12px] font-medium text-muted transition-colors hover:bg-glow hover:text-primary"
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="px-5 pb-8 @2xl:px-8">
        <Section id="cs-overview" n={num('overview')} title={t('os.projects.study.overview')}>
          <p className="max-w-3xl text-[15px] leading-8 text-muted">{text.description}</p>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-card-border bg-card-border @2xl:grid-cols-4">
            {[
              [t('os.projects.study.facts.category'), t(`os.projects.category.${category}`)],
              [t('os.projects.study.facts.status'), project.liveUrl ? t('projects.live') : t('projects.repoOnly')],
              [t('os.projects.study.facts.stack'), String(project.tech.length)],
              [t('os.projects.study.facts.repo'), project.repoUrl ? 'GitHub' : socials.github.label],
            ].map(([k, v]) => (
              <div key={k} className="bg-sheet px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-faint">{k}</dt>
                <dd className="mt-0.5 truncate text-[14px] font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {vis.objectives && (
        <Section id="cs-objectives" n={num('objectives')} title={t('os.projects.study.objectives')} tag={tag(!!real.objectives)}>
          {bullets(study.objectives)}
        </Section>
        )}

        {vis.problem && (
        <Section id="cs-problem" n={num('problem')} title={t('os.projects.study.problemSolution')} tag={tag(!!real.problem && !!real.solution)}>
          <div className="grid gap-3 @2xl:grid-cols-2">
            {[
              [t('os.projects.study.problem'), study.problem],
              [t('os.projects.study.solution'), study.solution],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-card-border bg-bg-subtle/60 p-4">
                <Eyebrow>{k}</Eyebrow>
                <p className="mt-2 text-[14px] leading-7 text-muted">{v}</p>
              </div>
            ))}
          </div>
        </Section>
        )}

        {vis.role && (
        <Section id="cs-role" n={num('role')} title={t('os.projects.study.role')} tag={tag(!!real.role)}>
          {bullets(study.role)}
        </Section>
        )}

        <Section id="cs-stack" n={num('stack')} title={t('os.projects.study.stack')}>
          <ul className="flex flex-wrap gap-2">
            {project.tech.map((n) => (
              <li key={n}>
                <TechBadge name={n} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="cs-features" n={num('features')} title={t('os.projects.study.features')}>
          <ol className="grid gap-3 @2xl:grid-cols-2">
            {text.highlights.map((h, i) => (
              <li
                key={i}
                className="group flex gap-3 rounded-xl border border-card-border bg-bg-subtle/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-graphite font-mono text-[11px] text-neon ring-1 ring-neon/30">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-7">{h}</span>
              </li>
            ))}
          </ol>
        </Section>

        {vis.architecture && (
        <Section id="cs-architecture" n={num('architecture')} title={t('os.projects.study.architecture')} tag={tag(!!real.architecture)}>
          <p className="max-w-3xl text-[14px] leading-7 text-muted">{study.architecture}</p>
          <figure className="mt-5">
            <div className="os-chrome rounded-xl border border-edge bg-graphite p-4 text-warm">
              {layers.map((l, i) => (
                <div key={l.key}>
                  {i > 0 && <div aria-hidden="true" className="mx-auto h-4 w-px border-l border-dashed border-neon/50" />}
                  <div className="flex flex-col gap-2 rounded-lg border border-edge bg-graphite-2 px-3 py-2.5 @md:flex-row @md:items-center @md:gap-4">
                    <span className="w-44 shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-neon">
                      {t(`os.projects.study.layers.${l.key}`)}
                    </span>
                    <ul className="flex flex-wrap gap-1.5">
                      {l.items.map((x) => (
                        <li key={x} className="rounded-md border border-edge px-2 py-0.5 font-mono text-[11.5px]">
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <figcaption className="mt-2 font-mono text-[10.5px] text-faint">{t('os.projects.study.stackNote')}</figcaption>
          </figure>
        </Section>
        )}

        {vis.challenges && (
        <Section id="cs-challenges" n={num('challenges')} title={t('os.projects.study.challenges')} tag={tag(!!real.challenges)}>
          {bullets(study.challenges)}
        </Section>
        )}

        {vis.demo && (
          <Section id="cs-demo" n={num('demo')} title={t('os.projects.study.demo')}>
            <ProjectVideo src={media?.video} gif={media?.gif} poster={media?.poster} title={t('os.projects.study.demoLabel', { name: project.name })} />
          </Section>
        )}

        {vis.gallery && (
          <Section id="cs-gallery" n={num('gallery')} title={t('os.projects.study.gallery')}>
            <MediaGallery title={t('os.projects.study.gallery')} sets={sets} />
          </Section>
        )}

        {/* ── footer: links + next project ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-card-border pt-7">
          {links}
          {next && next.slug !== project.slug && (
            <button
              type="button"
              onClick={() => onOpen(next.slug)}
              className="group inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2.5 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <span className="text-faint">{t('os.projects.study.next')}</span>
              <span className="max-w-[12rem] truncate">{next.name}</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
