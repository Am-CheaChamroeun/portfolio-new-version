import { describe, expect, it, vi } from 'vitest'
import { sendContact, WEB3FORMS_URL } from './web3forms'

const payload = { name: 'Sok', email: 'sok@example.com', subject: 'Hello', message: 'Hi there' }
const reply = (status: number, body: unknown) => vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch

describe('sendContact', () => {
  it('posts to Web3Forms with the visitor as reply-to and succeeds only on success: true', async () => {
    const f = reply(200, { success: true })
    expect(await sendContact(payload, 'KEY', f)).toEqual({ ok: true })
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe(WEB3FORMS_URL)
    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({ access_key: 'KEY', name: 'Sok', email: 'sok@example.com', replyto: 'sok@example.com', subject: 'Hello', message: 'Hi there' })
  })
  it('is not a success when the API says so, even with HTTP 200', async () => {
    expect(await sendContact(payload, 'KEY', reply(200, { success: false }))).toEqual({ ok: false, reason: 'server' })
    expect(await sendContact(payload, 'KEY', reply(400, { success: false }))).toEqual({ ok: false, reason: 'server' })
    expect(await sendContact(payload, 'KEY', reply(200, 'nope'))).toEqual({ ok: false, reason: 'server' })
  })
  it('maps rate limits and network failures', async () => {
    expect(await sendContact(payload, 'KEY', reply(429, {}))).toEqual({ ok: false, reason: 'rate' })
    const down = vi.fn(async () => { throw new TypeError('offline') }) as unknown as typeof fetch
    expect(await sendContact(payload, 'KEY', down)).toEqual({ ok: false, reason: 'network' })
  })
  it('never sends when the honeypot is filled', async () => {
    const f = reply(200, { success: true })
    expect(await sendContact({ ...payload, botcheck: 'on' }, 'KEY', f)).toEqual({ ok: false, reason: 'spam' })
    expect(f).not.toHaveBeenCalled()
  })
})
