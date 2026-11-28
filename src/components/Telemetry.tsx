import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

/** Visits and speed are only measured on the deployed site, never on localhost or a local preview. */
const deployed = import.meta.env.PROD && !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)

/** Drops anything after the path (query string, hash) so no page address can carry personal data into the statistics. */
const pathOnly = <T extends { url: string }>(event: T): T => {
  try {
    const u = new URL(event.url)
    return { ...event, url: u.origin + u.pathname }
  } catch {
    return event
  }
}

/**
 * Vercel Web Analytics (cookieless page views) and Speed Insights (real-user Core Web Vitals).
 * Mounted once at the app root. Both load their own small script from this site (/_vercel/…); if a script is
 * blocked or unavailable the portfolio carries on unchanged. Nothing from the contact form is ever sent.
 */
export function Telemetry() {
  if (!deployed) return null
  return (
    <>
      <Analytics beforeSend={pathOnly} />
      <SpeedInsights beforeSend={pathOnly} />
    </>
  )
}
