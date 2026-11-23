import { ArrowUpRight, CheckCircle2, Download, Mail, Send } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../../components/ui/Avatar'
import { mockImages } from '../../data/images'
import { contactFormEndpoint, profile, socials } from '../../data/portfolio'
import { GithubIcon, LinkedinIcon, TelegramIcon } from '../../lib/icons'
import { Eyebrow } from './shared'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const field =
  'w-full rounded-lg border border-card-border bg-sheet px-3 py-2 text-[14px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary'

function Channel({ href, icon, label, value }: { href: string; icon: ReactNode; label: string; value: string }) {
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noreferrer' })}
      className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-fg/5"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-graphite text-neon ring-1 ring-neon/30">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium">{label}</span>
        <span className="block truncate font-mono text-[11px] text-faint">{value}</span>
      </span>
      <ArrowUpRight
        size={14}
        className="shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </a>
  )
}

/** Contact → a Messages app: channels on the side, a conversation, and the real contact form. */
export default function ContactApp() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<Status>('idle')
  const id = useId()

  /** Replace the browser's built-in validation bubble text with the current language. */
  const validation = {
    onInvalid: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const el = e.currentTarget
      el.setCustomValidity(el.validity.typeMismatch ? t('contact.validation.email') : t('contact.validation.required'))
    },
    onInput: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.setCustomValidity(''),
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (!contactFormEndpoint) {
      // No backend configured: hand the message to the visitor's email app.
      const subject = encodeURIComponent(t('contact.mailSubject', { name: data.name }))
      const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`)
      window.location.href = `mailto:${socials.email}?subject=${subject}&body=${body}`
      setStatus('sent')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(contactFormEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="@container h-full">
      <div className="h-full overflow-y-auto @2xl:grid @2xl:grid-cols-[250px_1fr] @2xl:overflow-hidden">
        <aside className="border-b border-card-border bg-bg-subtle/60 p-3 @2xl:overflow-y-auto @2xl:border-b-0 @2xl:border-r">
          <div className="mb-2 flex items-center gap-3 px-2.5 py-2">
            <Avatar className="h-10 w-10 shrink-0 ring-1 ring-neon/40" />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{profile.name}</p>
              <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
                {t('os.contact.online')}
              </p>
            </div>
          </div>
          <Eyebrow className="px-2.5 pb-1 pt-2">{t('os.contact.channels')}</Eyebrow>
          <Channel href={`mailto:${socials.email}`} icon={<Mail size={15} />} label={t('contact.email')} value={socials.email} />
          <Channel href={socials.linkedin.url} icon={<LinkedinIcon size={15} />} label={t('contact.linkedin')} value={socials.linkedin.label} />
          <Channel href={socials.github.url} icon={<GithubIcon size={15} />} label={t('contact.github')} value={socials.github.label} />
          <Channel href={socials.telegram.url} icon={<TelegramIcon size={15} />} label={t('contact.telegram')} value={socials.telegram.label} />
          {profile.cvUrl && (
            <a
              href={profile.cvUrl}
              download
              className="mx-2.5 mt-3 inline-flex items-center gap-2 rounded-lg border border-card-border bg-sheet px-3 py-2 text-[12.5px] font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <Download size={14} />
              {t('contact.cv')}
            </a>
          )}
        </aside>

        <div className="flex min-h-0 flex-col @2xl:overflow-hidden">
          <div className="flex-1 space-y-4 p-4 @2xl:overflow-y-auto @2xl:p-5">
            <Eyebrow className="text-center">{t('os.contact.thread')}</Eyebrow>
            <div className="flex items-end gap-2.5">
              <Avatar className="h-8 w-8 shrink-0" />
              <div className="max-w-[min(34rem,90%)] rounded-2xl rounded-bl-md border border-card-border bg-bg-subtle px-4 py-3 text-[14px] leading-6 text-fg">
                {t('content.profile.availability')}
              </div>
            </div>
            <img
              src={mockImages.contact}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="mx-auto hidden h-28 w-auto opacity-90 @2xl:block"
            />
          </div>

          <form
            onSubmit={onSubmit}
            aria-label={t('os.contact.composeAria')}
            className="shrink-0 space-y-3 border-t border-card-border bg-bg-subtle/60 p-4 @2xl:p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
              {t('os.contact.compose')} · {t('os.contact.to')}: <span className="text-primary">{profile.name}</span>
            </p>
            <div className="grid gap-3 @lg:grid-cols-2">
              <div>
                <label htmlFor={`${id}-name`} className="mb-1 block text-[12px] font-medium text-muted">
                  {t('contact.placeholders.name')}
                </label>
                <input
                  id={`${id}-name`}
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={t('contact.placeholders.name')}
                  className={field}
                  {...validation}
                />
              </div>
              <div>
                <label htmlFor={`${id}-email`} className="mb-1 block text-[12px] font-medium text-muted">
                  {t('contact.email')}
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={t('contact.placeholders.email')}
                  className={field}
                  {...validation}
                />
              </div>
            </div>
            <div>
              <label htmlFor={`${id}-message`} className="mb-1 block text-[12px] font-medium text-muted">
                {t('contact.labels.message')}
              </label>
              <textarea
                id={`${id}-message`}
                name="message"
                required
                rows={4}
                placeholder={t('contact.placeholders.message')}
                {...validation}
                className={`${field} resize-none leading-6`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-2 rounded-lg bg-cta px-5 py-2.5 text-[13px] font-semibold text-on-cta transition-colors hover:bg-cta-hover disabled:opacity-70"
              >
                {status === 'sent' ? <CheckCircle2 size={15} /> : <Send size={15} />}
                {status === 'sending' ? t('contact.sending') : status === 'sent' ? t('contact.sent') : t('contact.submit')}
              </button>
              <p role="status" className="min-h-4 text-[12px] text-faint">
                {status === 'error' && t('contact.error')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
