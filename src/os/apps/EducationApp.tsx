import { ArrowLeft, ArrowUpRight, Calendar, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockImages, pickImage } from '../../data/images'
import { education, type EducationItem } from '../../data/portfolio'
import { Eyebrow, Pill, StatusBar, Toolbar } from './shared'

function Logo({ item, size }: { item: EducationItem; size: string }) {
  const { t } = useTranslation()
  const logo = pickImage(item.logo, mockImages.education[item.id])
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-card-border bg-warm ${size}`}>
      {logo ? (
        <img
          src={logo.src}
          // mock emblems are decorative; a real logo gets a proper alt text
          alt={logo.isMock ? '' : t('education.logoAlt', { school: item.school })}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <GraduationCap size={20} strokeWidth={1.6} className="text-graphite" />
      )}
    </span>
  )
}

/** Education → an explorer: a list of records on the left, the selected record on the right. */
export default function EducationApp() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number | null>(null)
  const item = education[selected ?? 0]
  const details = t(`content.education.${item.id}.details` as 'content.education.edu-1.details', { returnObjects: true, defaultValue: [] }) as string[]

  return (
    <div className="@container flex h-full min-h-0 flex-col">
      <Toolbar>
        <button
          type="button"
          onClick={() => setSelected(null)}
          aria-label={t('os.education.back')}
          title={t('os.education.back')}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-fg/10 hover:text-fg @2xl:hidden ${selected === null ? 'hidden' : ''}`}
        >
          <ArrowLeft size={16} />
        </button>
        <p className="font-mono text-[12px] text-muted">
          ~/{t('education.title').toLowerCase()}
          {selected !== null && <span className="text-faint"> / </span>}
          {selected !== null && <span className="text-fg">{String(selected + 1).padStart(2, '0')}</span>}
        </p>
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <nav aria-label={t('os.education.records')} className={`min-h-0 w-full shrink-0 overflow-y-auto border-card-border p-2 @2xl:block @2xl:w-72 @2xl:border-r ${selected !== null ? 'hidden' : 'block'}`}>
          <Eyebrow className="px-2 pb-1.5 pt-1">{t('os.education.records')}</Eyebrow>
          <ul className="space-y-1">
            {education.map((e, i) => {
              const on = (selected ?? 0) === i
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-current={on ? 'true' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl border px-2.5 py-2.5 text-left transition-colors ${
                      on ? 'border-primary/50 bg-glow' : 'border-transparent hover:bg-fg/5'
                    }`}
                  >
                    <Logo item={e} size="h-10 w-10" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">{e.school}</span>
                      <span className="block truncate font-mono text-[11px] text-faint">{e.period}</span>
                    </span>
                    {e.current && <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" aria-label={t('education.current')} />}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <article aria-label={item.school} className={`min-h-0 flex-1 overflow-y-auto p-5 @2xl:block @2xl:p-7 ${selected === null ? 'hidden' : 'block'}`}>
          <div className="flex items-start gap-4">
            <Logo item={item} size="h-16 w-16" />
            <div className="min-w-0">
              <h3 className="text-xl font-semibold leading-snug tracking-tight">{item.school}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-bg-subtle px-2.5 py-1 font-mono text-[11.5px] text-muted">
                  <Calendar size={12} />
                  {item.period}
                </span>
                {item.current && <Pill>{t('education.current')}</Pill>}
              </div>
            </div>
          </div>

          <Eyebrow className="mt-6">{t('os.education.details')}</Eyebrow>
          <ul className="mt-2 divide-y divide-card-border overflow-hidden rounded-xl border border-card-border">
            {details.map((d, i) => (
              <li key={i} className="flex gap-3 bg-sheet px-4 py-3 text-[14px] leading-6 text-muted">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {d}
              </li>
            ))}
          </ul>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              aria-label={t('education.visitAria', { school: item.school })}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-card-border bg-sheet px-4 py-2 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              {t('education.visit')}
              <ArrowUpRight size={14} />
            </a>
          )}
        </article>
      </div>

      <StatusBar>
        <span>{t('os.education.count', { n: education.length })}</span>
      </StatusBar>
    </div>
  )
}
