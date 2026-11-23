import { FolderKanban, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MockBadge } from '../components/ui/MockBadge'
import { mockImages } from '../data/images'
import { profile } from '../data/portfolio'
import { useOSActions } from './hooks'
import { OSLogo } from './OSLogo'

/** The desktop's welcome card: heading, intro and two real shortcuts. */
export function WelcomeWidget() {
  const { t } = useTranslation()
  const { openApp } = useOSActions()
  return (
    <section
      aria-labelledby="welcome-title"
      className="os-chrome glass-dark pointer-events-auto absolute right-6 top-6 hidden w-[min(380px,calc(100%-280px))] overflow-hidden rounded-2xl border border-edge text-warm shadow-[0_30px_70px_-24px_rgba(0,0,0,0.95)] md:block"
    >
      <div className="relative aspect-[16/8] overflow-hidden border-b border-edge bg-graphite">
        <img src={mockImages.hero} alt="" aria-hidden="true" decoding="async" className="h-full w-full object-cover" />
        <MockBadge kind="concept" className="absolute right-2.5 top-2.5" />
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <OSLogo size={20} />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-neon">{t('os.name')}</span>
        </div>
        <h1 id="welcome-title" className="text-xl font-semibold leading-snug tracking-tight text-warm">
          {t('os.welcome.title')}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-steel">{t('os.welcome.subtitle')}</p>
        <p className="mt-4 border-t border-edge pt-3 text-[13px] text-warm/90">
          <span className="font-semibold text-neon">{profile.name}</span> · {t('content.profile.role')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openApp('projects')}
            className="inline-flex items-center gap-2 rounded-lg bg-neon px-3.5 py-2 text-[13px] font-semibold text-graphite transition-colors hover:bg-gold"
          >
            <FolderKanban size={15} />
            {t('os.welcome.openProjects')}
          </button>
          <button
            type="button"
            onClick={() => openApp('contact')}
            className="inline-flex items-center gap-2 rounded-lg border border-edge px-3.5 py-2 text-[13px] font-medium text-warm transition-colors hover:border-neon/60 hover:text-neon"
          >
            <Send size={14} />
            {t('os.welcome.sayHello')}
          </button>
        </div>
        <p className="mt-4 text-[11.5px] leading-relaxed text-steel/80">{t('os.welcome.hint')}</p>
      </div>
    </section>
  )
}
