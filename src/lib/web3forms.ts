/**
 * Contact form delivery through Web3Forms (https://web3forms.com), using the native Fetch API.
 * The access key is a public value by design (it can only send mail to the address it was created
 * for); restrict it to your domain in the Web3Forms dashboard. It is read from VITE_WEB3FORMS_ACCESS_KEY.
 */
export const WEB3FORMS_URL = 'https://api.web3forms.com/submit'

export const web3formsKey: string = String(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '').trim()

export type ContactPayload = { name: string; email: string; subject: string; message: string; botcheck?: string }
export type SendResult = { ok: true } | { ok: false; reason: 'spam' | 'rate' | 'network' | 'timeout' | 'server' }

const TIMEOUT_MS = 15_000

/** Resolves to `ok: true` only when Web3Forms itself reports success. Never throws. */
export async function sendContact(payload: ContactPayload, accessKey: string, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  // Honeypot: real visitors never fill this in. Report a quiet failure so bots learn nothing.
  if (payload.botcheck) return { ok: false, reason: 'spam' }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetchImpl(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        access_key: accessKey,
        name: payload.name.slice(0, 80),
        email: payload.email.slice(0, 254),
        replyto: payload.email.slice(0, 254),
        from_name: payload.name.slice(0, 80),
        subject: payload.subject.slice(0, 120),
        message: payload.message.slice(0, 5000),
        botcheck: '',
      }),
    })
    const json = (await res.json().catch(() => null)) as { success?: boolean } | null
    if (res.ok && json?.success === true) return { ok: true }
    return { ok: false, reason: res.status === 429 ? 'rate' : 'server' }
  } catch (err) {
    return { ok: false, reason: (err as Error)?.name === 'AbortError' ? 'timeout' : 'network' }
  } finally {
    clearTimeout(timer)
  }
}
