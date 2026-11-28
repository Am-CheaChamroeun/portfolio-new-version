import { ArrowUpRight, Briefcase, Calendar, ChevronDown, Clock, FolderGit2, MapPin, Target, Trophy } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type ExperienceProject, type WorkExperience } from '../../data/portfolio'
import { visibleExperience as experience } from '../../data/visible'
import { formatDuration, formatMonth, monthsBetween } from '../../lib/experience'
import { shown } from '../../lib/placeholder'
import { CvActions } from './CvActions'
import { EmptyState, Eyebrow, StatusBar, TechBadge, Toolbar } from './shared'

const isLink = (url?: string): url is string => !!url && /^https?:\/\//.test(url)

function Logo({ item }: { item: WorkExperience }) {
  const { t } = useTranslation()
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-card-border bg-white @2xl:h-16 @2xl:w-16">
      {item.logo ? (
        <img
          src={item.logo}
          alt={t('experience.logoAlt', { company: item.company })}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <Briefcase size={22} strokeWidth={1.6} className="text-graphite" aria-hidden="true" />
      )}
    </span>
  )
}

function BulletList({ title, icon: Icon, items }: { title: string; icon: typeof Target; items: string[] }) {
  if (!items.length) return null
  return (
    <section>
      <Eyebrow className="flex items-center gap-1.5">
        <Icon size={12} aria-hidden="true" />
        {title}
      </Eyebrow>
      <ul className="mt-2 space-y-2">
        {items.map((text, i) => (
          <li key={i} className="flex gap-3 text-[14px] leading-6 text-muted">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <span className="min-w-0">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Understated "Current" marker: a small accent dot and a quiet outline, no animation. */
function CurrentBadge() {
  const { t } = useTranslation()
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-card-border bg-bg-subtle px-2.5 py-0.5 text-[11px] font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      {t('experience.current')}
    </span>
  )
}

/** Expandable project list — collapsed by default so a long role stays easy to scan. */
function Projects({ itemId, projects }: { itemId: string; projects: ExperienceProject[] }) {
  const { t } = useTranslation()
  const uid = useId()
  const [open, setOpen] = useState<string | null>(null)
  const tx = (id: string, k: string) => t(`content.experience.${itemId}.projects.${id}.${k}` as 'content.education.kit.degree', { defaultValue: '' })
  return (
    <section className="mt-5" aria-label={t('experience.projects')}>
      <Eyebrow className="flex items-center gap-1.5">
        <FolderGit2 size={12} aria-hidden="true" />
        {t('experience.projects')}
      </Eyebrow>
      <ul className="mt-2 divide-y divide-card-border overflow-hidden rounded-xl border border-card-border">
        {projects.map((p) => {
          const isOpen = open === p.id
          const bullets = (t(`content.experience.${itemId}.projects.${p.id}.bullets` as 'content.education.kit.details', { returnObjects: true, defaultValue: [] }) as string[]).filter(shown)
          const panel = `${uid}-${p.id}`
          return (
            <li key={p.id} className="bg-bg-subtle/40">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : p.id)}
                aria-expanded={isOpen}
                aria-controls={panel}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fg/5 max-md:min-h-12"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{tx(p.id, 'name')}</span>
                  <span className="block text-[12.5px] text-muted">{tx(p.id, 'role')}</span>
                </span>
                <ChevronDown size={16} aria-hidden="true" className={`shrink-0 text-faint transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div id={panel} className="space-y-3 border-t border-card-border bg-sheet px-4 py-3.5">
                  <ul className="space-y-2">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex gap-3 text-[14px] leading-6 text-muted">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        <span className="min-w-0">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-wrap gap-1.5" aria-label={t('experience.technologies')}>
                    {p.technologies.map((name) => (
                      <li key={name}>
                        <TechBadge name={name} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Entry({ item, latest }: { item: WorkExperience; latest: boolean }) {
  const { t, i18n } = useTranslation()
  const lng = i18n.language
  const tx = (k: string) => t(`content.experience.${item.id}.${k}` as 'content.education.kit.degree', { defaultValue: '' })
  const list = (k: string) =>
    (t(`content.experience.${item.id}.${k}` as 'content.education.kit.details', { returnObjects: true, defaultValue: [] }) as string[]).filter(shown)

  const current = !item.end
  const meta = [item.employmentType && t(`experience.types.${item.employmentType}`), item.workplaceType && t(`experience.workplace.${item.workplaceType}`)].filter(Boolean) as string[]
  const months = monthsBetween(item.start, item.end)
  const location = tx('location')
  const description = tx('description')
  const responsibilities = list('responsibilities')
  const achievements = list('achievements')
  const technologies = item.technologies.filter(shown)

  return (
    <li className="relative">
      {/* timeline node */}
      <span
        aria-hidden="true"
        className={`absolute top-7 -left-[30.5px] h-3 w-3 rounded-full border-2 @2xl:-left-[38.5px] ${
          current || latest ? 'border-accent bg-accent shadow-[0_0_10px_var(--accent)]' : 'border-faint bg-bg'
        }`}
      />
      <article
        aria-label={`${tx('title')} — ${item.company}`}
        className={`rounded-2xl border bg-sheet p-4 @2xl:p-6 ${current ? 'border-primary/40' : 'border-card-border'}`}
      >
        <header className="flex items-start gap-3.5">
          <Logo item={item} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-semibold leading-snug tracking-tight @2xl:text-lg">{tx('title')}</h3>
            <p className="mt-0.5 text-[14px] text-muted">
              {isLink(item.url) ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t('experience.visitAria', { company: item.company })}
                  className="font-medium text-fg transition-colors hover:text-primary"
                >
                  {item.company}
                  <ArrowUpRight size={13} aria-hidden="true" className="ml-1 inline align-[-2px]" />
                </a>
              ) : (
                <span className="font-medium text-fg">{item.company}</span>
              )}
              {meta.map((m) => (
                <span key={m}>
                  <span className="text-faint"> · </span>
                  {m}
                </span>
              ))}
            </p>
            {current && (
              <span className="mt-2 inline-flex @2xl:hidden">
                <CurrentBadge />
              </span>
            )}
          </div>
          {current && (
            <span className="hidden @2xl:block">
              <CurrentBadge />
            </span>
          )}
        </header>

        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] tabular-nums text-muted">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{t('experience.period')}</dt>
            <Calendar size={13} className="text-faint" aria-hidden="true" />
            <dd>
              {formatMonth(item.start, lng)} – {item.end ? formatMonth(item.end, lng) : t('experience.present')}
            </dd>
          </div>
          {months !== null && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">{t('experience.duration')}</dt>
              <Clock size={13} className="text-faint" aria-hidden="true" />
              <dd>{formatDuration(months, lng)}</dd>
            </div>
          )}
          {shown(location) && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">{t('experience.location')}</dt>
              <MapPin size={13} className="text-faint" aria-hidden="true" />
              <dd>{location}</dd>
            </div>
          )}
        </dl>

        {shown(description) && <p className="mt-4 text-[14.5px] leading-7 text-fg/90">{description}</p>}

        {(responsibilities.length > 0 || achievements.length > 0) && (
          <div className="mt-5 grid gap-5 @2xl:grid-cols-2 @2xl:gap-8">
            <BulletList title={t('experience.responsibilities')} icon={Target} items={responsibilities} />
            <BulletList title={t('experience.achievements')} icon={Trophy} items={achievements} />
          </div>
        )}

        {item.projects && item.projects.length > 0 && <Projects itemId={item.id} projects={item.projects} />}

        {technologies.length > 0 && (
          <section className="mt-5" aria-label={t('experience.technologies')}>
            <Eyebrow>{t('experience.technologies')}</Eyebrow>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {technologies.map((name) => (
                <li key={name}>
                  <TechBadge name={name} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {isLink(item.url) && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            aria-label={t('experience.visitAria', { company: item.company })}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-card-border bg-bg-subtle px-4 py-2 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary max-md:min-h-11"
          >
            {t('experience.visit')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </article>
    </li>
  )
}

/** Work Experience → a vertical career timeline, newest position first. */
export default function ExperienceApp() {
  const { t } = useTranslation()
  if (!experience.length) return <EmptyState icon={Briefcase} title={t('os.empty.experience.title')} text={t('os.empty.experience.text')} />

  return (
    <div className="@container flex h-full min-h-0 flex-col">
      <Toolbar>
        <p className="font-mono text-[12px] text-muted">~/{t('experience.title').toLowerCase()}</p>
        <CvActions variant="compact" />
      </Toolbar>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 @2xl:p-7">
        <div className="mx-auto max-w-4xl">
          <Eyebrow>{t('experience.eyebrow')}</Eyebrow>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{t('experience.title')}</h2>
          <ol aria-label={t('experience.title')} className="relative ml-1.5 mt-6 space-y-5 border-l border-card-border pl-6 @2xl:ml-2 @2xl:pl-8">
            {experience.map((item, i) => (
              <Entry key={item.id} item={item} latest={i === 0} />
            ))}
          </ol>
        </div>
      </div>

      <StatusBar>
        <span>{t('os.experience.count', { n: experience.length })}</span>
      </StatusBar>
    </div>
  )
}
