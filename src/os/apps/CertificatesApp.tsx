import { Award, ChevronLeft, ChevronRight, ExternalLink, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MockBadge } from '../../components/ui/MockBadge'
import { SHOW_PLACEHOLDERS } from '../../lib/placeholder'
import { mockImages, pickImage } from '../../data/images'
import { certificates as allCertificates, profile, type Certificate } from '../../data/portfolio'
import { visibleCertificates as certificates } from '../../data/visible'
import { EmptyState, Eyebrow, StatusBar, Toolbar } from './shared'

/** Real certificate scan, or a sample layout until you add one. */
const certImage = (cert: Certificate) => pickImage(cert.image, mockImages.certificates[allCertificates.indexOf(cert)])

/** Stand-in document shown until you add a real certificate image. */
function Placeholder({ cert }: { cert: Certificate }) {
  const { t } = useTranslation()
  return (
    <div className="flex aspect-[7/5] w-full items-center justify-center bg-bg-subtle p-[6%]">
      <div className="relative flex h-full w-full flex-col items-center justify-center border-[3px] border-double border-accent/50 bg-sheet px-4 text-center text-fg">
        <Award className="mb-2 text-primary" size={40} strokeWidth={1.4} />
        <div className="text-base font-semibold uppercase tracking-[0.18em]">{t('certifications.placeholder.heading')}</div>
        <div className="mt-1 text-sm text-muted">{t('certifications.placeholder.awarded')}</div>
        <div className="mt-1 text-3xl font-semibold text-primary">{profile.name}</div>
        <div className="mt-1 text-sm text-muted">{cert.title}</div>
        {SHOW_PLACEHOLDERS && <div className="absolute bottom-3 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">{t('certifications.placeholder.add')}</div>}
      </div>
    </div>
  )
}

const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3]

/** Certifications → a document viewer: a file list on the left, the document with zoom on the right. */
export default function CertificatesApp() {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(2) // index into ZOOMS → 100 %
  const cert = certificates[index]
  if (!cert) return <EmptyState icon={Award} title={t('os.empty.certificates.title')} text={t('os.empty.certificates.text')} />
  const image = certImage(cert)
  const go = (i: number) => {
    setIndex((i + certificates.length) % certificates.length)
    setZoom(2)
  }
  const z = ZOOMS[zoom]

  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === '+' || e.key === '=') setZoom((v) => Math.min(ZOOMS.length - 1, v + 1))
    else if (e.key === '-') setZoom((v) => Math.max(0, v - 1))
    else if (e.key === '0') setZoom(2)
  }

  const tool =
    'flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-fg/10 hover:text-fg disabled:pointer-events-none disabled:opacity-30'

  return (
    <div className="@container flex h-full min-h-0 flex-col" onKeyDown={onKey}>
      <Toolbar>
        <button type="button" className={tool} onClick={() => go(index - 1)} aria-label={t('os.certificates.prev')} title={t('os.certificates.prev')}>
          <ChevronLeft size={17} />
        </button>
        <button type="button" className={tool} onClick={() => go(index + 1)} aria-label={t('os.certificates.next')} title={t('os.certificates.next')}>
          <ChevronRight size={17} />
        </button>
        <span className="font-mono text-[12px] text-faint">
          {t('os.certificates.page', {
            current: index + 1,
            total: certificates.length,
          })}
        </span>
        <p className="min-w-0 flex-1 truncate px-1 text-[13px] font-medium">{cert.title}</p>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={tool}
            onClick={() => setZoom((v) => Math.max(0, v - 1))}
            disabled={zoom === 0}
            aria-label={t('os.certificates.zoomOut')}
            title={t('os.certificates.zoomOut')}
          >
            <ZoomOut size={16} />
          </button>
          <span className="w-11 text-center font-mono text-[11.5px] text-muted" aria-live="polite">
            {Math.round(z * 100)}%
          </span>
          <button
            type="button"
            className={tool}
            onClick={() => setZoom((v) => Math.min(ZOOMS.length - 1, v + 1))}
            disabled={zoom === ZOOMS.length - 1}
            aria-label={t('os.certificates.zoomIn')}
            title={t('os.certificates.zoomIn')}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className={tool}
            onClick={() => setZoom(2)}
            disabled={zoom === 2}
            aria-label={t('os.certificates.zoomReset')}
            title={t('os.certificates.zoomReset')}
          >
            <RotateCcw size={14} />
          </button>
          {image && !image.isMock && (
            <a
              href={image.src}
              target="_blank"
              rel="noreferrer"
              className={tool}
              aria-label={t('os.certificates.openFile')}
              title={t('os.certificates.openFile')}
            >
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </Toolbar>

      <div className="flex min-h-0 flex-1 flex-col @2xl:flex-row">
        <nav
          aria-label={t('os.certificates.documents')}
          className="shrink-0 overflow-x-auto border-b border-card-border bg-bg-subtle/50 p-2 @2xl:w-56 @2xl:overflow-y-auto @2xl:border-b-0 @2xl:border-r"
        >
          <Eyebrow className="hidden px-1.5 pb-1.5 pt-1 @2xl:block">{t('os.certificates.documents')}</Eyebrow>
          <ul className="flex gap-2 @2xl:flex-col">
            {certificates.map((c, i) => {
              const img = certImage(c)
              const on = i === index
              return (
                <li key={i} className="w-40 shrink-0 @2xl:w-auto">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={t('certifications.viewAria', {
                      title: c.title,
                    })}
                    aria-current={on ? 'true' : undefined}
                    className={`block w-full rounded-lg border p-1.5 text-left transition-colors ${on ? 'border-primary bg-glow' : 'border-card-border bg-sheet hover:border-line-strong'}`}
                  >
                    <span className="relative block aspect-[7/5] overflow-hidden rounded-md bg-bg-subtle">
                      {img ? (
                        <img src={img.src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-primary">
                          <Award size={26} strokeWidth={1.4} />
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block truncate px-0.5 text-[12px] font-medium">{c.title}</span>
                    <span className="block truncate px-0.5 font-mono text-[10.5px] text-faint">
                      {c.issuer} · {c.date}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="min-h-0 flex-1 overflow-auto bg-bg-subtle/60 p-4 @2xl:p-6">
          <div
            className="mx-auto transition-[width] duration-200"
            style={{
              width: `${z * 100}%`,
              maxWidth: z > 1 ? 'none' : `${z * 880}px`,
            }}
          >
            <div className="relative overflow-hidden rounded-lg border border-card-border bg-sheet shadow-window">
              {image ? (
                <>
                  <img
                    src={image.src}
                    alt={
                      image.isMock
                        ? t('images.alt.certificate', { title: cert.title })
                        : t('certifications.issuedBy', {
                            title: cert.title,
                            issuer: cert.issuerFull ?? cert.issuer,
                          })
                    }
                    decoding="async"
                    className="block h-auto w-full"
                  />
                  {image.isMock && <MockBadge kind="sample" className="absolute left-3 top-3" />}
                </>
              ) : (
                <Placeholder cert={cert} />
              )}
            </div>
          </div>
        </div>
      </div>

      <StatusBar>
        <span className="truncate">
          {t('os.certificates.issuer')}: {cert.issuerFull ?? cert.issuer}
        </span>
        <span className="ml-auto shrink-0">
          {t('os.certificates.date')}: {cert.date}
        </span>
      </StatusBar>
    </div>
  )
}
