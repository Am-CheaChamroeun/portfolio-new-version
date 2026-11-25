import { ArrowRight, Download, Mail, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { narrationText } from '../../lib/narration'
import { MockBadge } from '../../components/ui/MockBadge'
import { mockImages, pickImage } from '../../data/images'
import { about, profile, socials } from '../../data/portfolio'
import { GithubIcon, LinkedinIcon, TechIcon, TelegramIcon } from '../../lib/icons'
import { cvAvailable, downloadCv } from '../../lib/links'
import { SHOW_PLACEHOLDERS, shown } from '../../lib/placeholder'
import { techIcons, type TechKey } from '../../lib/tech'
import { shortcutLabel } from '../CommandPalette'
import { useOSActions } from '../hooks'
import { useLayoutMode } from '../layout'
import { NarrationPlayer } from './NarrationPlayer'
import { Eyebrow } from './shared'

const tools: TechKey[] = [...about.orbitInner, ...about.orbitOuter]

/** About Me → a profile app: portrait, bio, personal info, socials and CV. */
export default function AboutApp() {
  const { t, i18n } = useTranslation()
  const { openApp } = useOSActions()
  const photo = pickImage(profile.photo, mockImages.profile)
  const paragraphs = (t('content.about.paragraphs', { returnObjects: true }) as string[]).filter(shown)
  const mobile = useLayoutMode() === 'mobile'
  // the CV button only appears once a real file is deployed — never a dead download
  const [hasCv, setHasCv] = useState(false)
  useEffect(() => {
    let on = true
    cvAvailable().then((ok) => on && setHasCv(ok))
    return () => {
      on = false
    }
  }, [])
  const chips = t('content.about.chips', { returnObjects: true })
  const features = t('content.about.features', { returnObjects: true })

  const info: [string, string][] = [
    [t('os.about.role'), t('content.profile.role')],
    [t('os.about.location'), t('content.profile.location')],
    [t('os.about.handle'), `${profile.handle}${profile.handleSuffix}`],
  ]

  const social = [
    {
      href: `mailto:${socials.email}`,
      label: t('contact.email'),
      icon: <Mail size={16} />,
    },
    {
      href: socials.github.url,
      label: t('contact.github'),
      icon: <GithubIcon size={16} />,
    },
    {
      href: socials.linkedin.url,
      label: t('contact.linkedin'),
      icon: <LinkedinIcon size={16} />,
    },
    {
      href: socials.telegram.url,
      label: t('contact.telegram'),
      icon: <TelegramIcon size={16} />,
    },
  ]

  return (
    <div className="@container h-full">
      <div className="h-full overflow-y-auto @2xl:grid @2xl:grid-cols-[260px_1fr] @2xl:overflow-hidden">
        <aside className="border-b border-card-border bg-bg-subtle/60 p-5 @2xl:overflow-y-auto @2xl:border-b-0 @2xl:border-r">
          <div className="mx-auto w-24 @2xl:w-full">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-card-border bg-graphite">
              {photo && (!photo.isMock || SHOW_PLACEHOLDERS) ? (
                <img src={photo.src} alt={photo.isMock ? t('images.alt.profile') : profile.name} decoding="async" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-6xl font-semibold text-neon" aria-hidden="true">
                  {profile.initials}
                </div>
              )}
              {photo?.isMock && SHOW_PLACEHOLDERS && <MockBadge kind="placeholder" className="absolute left-2 top-2" />}
            </div>
          </div>
          <p className="mt-4 hidden text-lg font-semibold tracking-tight @2xl:block">{profile.name}</p>
          <p className="hidden text-[13px] text-muted @2xl:block">{t('content.profile.role')}</p>

          <ul className="mt-4 flex flex-wrap justify-center gap-1.5 @2xl:justify-start">
            {social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  {...(s.href.startsWith('http') && {
                    target: '_blank',
                    rel: 'noreferrer',
                  })}
                  aria-label={s.label}
                  title={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-card-border bg-sheet text-muted @2xl:h-9 @2xl:w-9 transition-colors hover:border-primary hover:text-primary"
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>

        </aside>

        <div className="space-y-7 p-5 @2xl:overflow-y-auto @2xl:p-7">
          <section aria-labelledby="about-name" className="rounded-2xl border border-card-border bg-bg-subtle/50 p-5">
            <p className="font-mono text-[11.5px] text-primary">{t('content.profile.role')} · {t('content.profile.location')}</p>
            <h1 id="about-name" className="mt-1.5 text-[1.7rem] font-semibold leading-tight tracking-tight @2xl:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-7 text-muted">{t('content.profile.tagline')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openApp('projects')}
                className="inline-flex items-center gap-2 rounded-lg bg-cta px-4 py-2 text-[13px] font-semibold text-on-cta transition-colors hover:bg-cta-hover"
              >
                {t('os.about.projectsCta')}
                <ArrowRight size={15} />
              </button>
              {hasCv && (
                <button
                  type="button"
                  onClick={() => void downloadCv()}
                  className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-sheet px-4 py-2 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  <Download size={15} />
                  {t('os.about.cv')}
                </button>
              )}
              <button
                type="button"
                onClick={() => openApp('contact')}
                className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-sheet px-4 py-2 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary"
              >
                <Send size={14} />
                {t('os.about.hello')}
              </button>
            </div>
            <p className="mt-3 text-[12px] text-faint">{mobile ? t('os.about.hintMobile') : t('os.about.hint', { key: shortcutLabel() })}</p>
          </section>

0          <section>
            <Eyebrow>{t('os.about.bio')}</Eyebrow>
            <div className="mt-3">
              <NarrationPlayer key={i18n.language} lang={i18n.language} text={narrationText(paragraphs)} />
            </div>
            <div className="mt-2 space-y-3 text-[14.5px] leading-7 text-muted">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c} className="rounded-md border border-primary/30 bg-glow px-2.5 py-1 font-mono text-[11.5px] text-primary">
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <Eyebrow>{t('os.about.info')}</Eyebrow>
            <dl className="mt-2 grid gap-px overflow-hidden rounded-xl border border-card-border bg-card-border @lg:grid-cols-2">
              {info.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 bg-sheet px-4 py-2.5 last:odd:@lg:col-span-2">
                  <dt className="text-[12px] text-faint">{k}</dt>
                  <dd className="truncate text-right font-mono text-[12.5px] text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <Eyebrow>{t('os.about.highlights')}</Eyebrow>
            <ul className="mt-2 grid gap-2.5 @md:grid-cols-2">
              {features.map((label, i) => {
                const Icon = about.featureIcons[i] ?? about.featureIcons[0]
                return (
                  <li key={i} className="flex items-center gap-3 rounded-xl border border-card-border bg-bg-subtle/60 px-3.5 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-graphite text-neon ring-1 ring-neon/30">
                      <Icon size={16} strokeWidth={1.7} />
                    </span>
                    <span className="text-[13.5px] font-medium">{label}</span>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <Eyebrow>{t('os.about.toolbox')}</Eyebrow>
            <ul className="mt-2 flex flex-wrap gap-2">
              {tools.map((k) => (
                <li key={k} title={techIcons[k].title} className="flex items-center gap-2 rounded-lg border border-card-border bg-sheet py-1.5 pl-1.5 pr-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-warm">
                    <TechIcon name={k} size={17} />
                  </span>
                  <span className="text-[12.5px] font-medium">{techIcons[k].title}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
