/**
 * Voice narration engines. The bio is read aloud by, in order of preference:
 *   1. a native browser voice for the page language (Web Speech API),
 *   2. a pre-recorded file you drop in `public/audio/about-<lang>.mp3` (en | km | zh-CN),
 *   3. an online text-to-speech fallback (used for Khmer, which most browsers have no voice for).
 * Every engine streams progress (0–1) so the waveform can follow the voice.
 */

export type NarrationStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'unavailable'

export type NarrationHooks = {
  onStart: () => void
  onProgress: (p: number) => void
  onEnd: () => void
  onError: () => void
}

export type Engine = {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
}

/** UI language → BCP-47 tag used for voice lookup and online TTS */
const speechLang: Record<string, string> = {
  en: 'en',
  km: 'km',
  'zh-CN': 'zh-CN',
}
/** rough speaking speed (characters / second), only used when a voice reports no word boundaries */
const charsPerSecond: Record<string, number> = { en: 14, km: 10, 'zh-CN': 4.5 }

/** Text to read: the bio paragraphs, without [BRACKETED PLACEHOLDERS] still waiting to be filled in. */
export function narrationText(paragraphs: string[]) {
  return paragraphs
    .map((p) => p.replace(/\[[^\]]*\]/g, '').trim())
    .filter(Boolean)
    .join(' ')
}

/** Split into sentence-sized chunks (long utterances get cut off by some browsers, and online TTS has a length limit). */
export function chunkText(text: string, max = 170) {
  // sentence ends: CJK stops anywhere, Latin / Khmer stops only before a space (so "Next.js" stays whole)
  const sentences = text.split(/(?<=[。！？])|(?<=[.!?។])\s+/).filter(Boolean)
  const pieces: string[] = []
  for (let s of sentences) {
    s = s.trim()
    while (s.length > max) {
      const cut = Math.max(s.lastIndexOf(' ', max), s.lastIndexOf('，', max), s.lastIndexOf('、', max), s.lastIndexOf(',', max))
      const at = cut > max * 0.4 ? cut + 1 : max
      pieces.push(s.slice(0, at).trim())
      s = s.slice(at).trim()
    }
    if (s) pieces.push(s)
  }
  const chunks: string[] = []
  for (const p of pieces) {
    const last = chunks[chunks.length - 1]
    if (last && last.length + p.length + 1 <= max) chunks[chunks.length - 1] = `${last} ${p}`
    else chunks.push(p)
  }
  return chunks
}

/* ── 1. native browser voices ── */

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
/** keep a reference — some browsers garbage-collect an utterance before its end event fires */
const alive = new Set<SpeechSynthesisUtterance>()

function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!synth) return resolve([])
    const have = synth.getVoices()
    if (have.length) return resolve(have)
    const done = () => {
      synth.removeEventListener('voiceschanged', done)
      clearTimeout(timer)
      resolve(synth.getVoices())
    }
    const timer = setTimeout(done, 1000)
    synth.addEventListener('voiceschanged', done)
  })
}

/** Best installed voice for a language: prefers natural / neural / online ones, then region match. */
function pickVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const base = lang.split('-')[0].toLowerCase()
  const matches = voices.filter((v) => {
    const l = v.lang.toLowerCase().replace('_', '-')
    return l === lang.toLowerCase() || l.startsWith(base + '-') || l === base || (base === 'zh' && l.startsWith('cmn'))
  })
  // Cantonese / Taiwanese voices are not Mandarin for a zh-CN site
  const usable = base === 'zh' ? matches.filter((v) => !/yue|hk|zh-tw|tw/i.test(v.lang + v.name)) : matches
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online|premium|enhanced|google/i.test(v.name) ? 4 : 0) +
    (v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase() || (base === 'en' && /en-(us|gb)/i.test(v.lang)) ? 2 : 0) +
    (v.default ? 1 : 0)
  return usable.sort((a, b) => score(b) - score(a))[0] ?? null
}

function speechEngine(chunks: string[], voice: SpeechSynthesisVoice, lang: string, hooks: NarrationHooks): Engine {
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const cps = charsPerSecond[lang] ?? 12
  let index = 0
  let before = 0 // characters in finished chunks
  let gen = 0
  let paused = false
  let sawBoundary = false
  let elapsed = 0
  let timer: ReturnType<typeof setInterval> | undefined

  const stopTimer = () => clearInterval(timer)

  const speak = () => {
    const token = gen
    const text = chunks[index]
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = 0.98
    sawBoundary = false
    elapsed = 0
    u.onboundary = (e) => {
      if (token !== gen) return
      sawBoundary = true
      hooks.onProgress(Math.min(0.99, (before + e.charIndex) / total))
    }
    u.onend = () => {
      alive.delete(u)
      if (token !== gen) return
      before += text.length
      index += 1
      if (index < chunks.length) speak()
      else {
        stopTimer()
        hooks.onEnd()
      }
    }
    u.onerror = (e) => {
      if (token !== gen || e.error === 'canceled' || e.error === 'interrupted') return
      stopTimer()
      hooks.onError()
    }
    alive.add(u)
    synth!.speak(u)
  }

  return {
    start() {
      gen += 1
      synth!.cancel()
      index = 0
      before = 0
      paused = false
      hooks.onStart()
      speak()
      // voices that report no word boundaries still get a smooth, time-based progress estimate
      timer = setInterval(() => {
        if (paused || sawBoundary) return
        elapsed += 0.12
        const len = chunks[index]?.length ?? 0
        hooks.onProgress(Math.min(0.99, (before + Math.min(len * 0.95, elapsed * cps)) / total))
      }, 120)
    },
    pause() {
      paused = true
      synth!.pause()
    },
    resume() {
      paused = false
      synth!.resume()
    },
    stop() {
      gen += 1
      stopTimer()
      synth!.cancel()
      alive.clear()
    },
  }
}

/* ── 2 + 3. audio files: a pre-recorded track, or online text-to-speech chunks ── */

type Track = { url: string; weight: number }

function audioEngine(tracks: Track[], hooks: NarrationHooks): Engine {
  const total = tracks.reduce((n, t) => n + t.weight, 0)
  const audio = new Audio()
  audio.preload = 'auto'
  audio.setAttribute('referrerpolicy', 'no-referrer')
  let index = 0
  let before = 0
  let started = false

  const load = () => {
    audio.src = tracks[index].url
    void audio.play().catch(() => hooks.onError())
  }
  audio.ontimeupdate = () => {
    const d = audio.duration
    if (!d || !isFinite(d)) return
    hooks.onProgress(Math.min(0.99, (before + tracks[index].weight * (audio.currentTime / d)) / total))
  }
  audio.onplaying = () => {
    if (started) return
    started = true
    hooks.onStart()
  }
  audio.onended = () => {
    before += tracks[index].weight
    index += 1
    if (index < tracks.length) load()
    else hooks.onEnd()
  }
  audio.onerror = () => hooks.onError()

  return {
    start() {
      index = 0
      before = 0
      started = false
      load()
    },
    pause: () => audio.pause(),
    resume: () => void audio.play().catch(() => hooks.onError()),
    stop() {
      audio.onended = audio.onerror = audio.ontimeupdate = audio.onplaying = null
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    },
  }
}

const recordedCache = new Map<string, Promise<string | null>>()

/** Is there a pre-recorded narration for this language in /public/audio? (Vite answers 200 + HTML for missing files, so check the type.) */
function recordedUrl(lang: string) {
  const url = `${import.meta.env.BASE_URL}audio/about-${lang}.mp3`
  if (!recordedCache.has(lang)) {
    recordedCache.set(
      lang,
      fetch(url, { method: 'HEAD' })
        .then((r) => (r.ok && (r.headers.get('content-type') ?? '').startsWith('audio') ? url : null))
        .catch(() => null),
    )
  }
  return recordedCache.get(lang)!
}

const onlineTts = (text: string, tl: string) =>
  `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`

/** Pick the best available engine for the language, or null when none can speak it. */
export async function createEngine(text: string, appLang: string, hooks: NarrationHooks): Promise<Engine | null> {
  const lang = speechLang[appLang] ?? appLang
  if (synth) {
    const voice = pickVoice(await voicesReady(), lang)
    if (voice) return speechEngine(chunkText(text, 220), voice, appLang, hooks)
  }
  const recorded = await recordedUrl(appLang)
  if (recorded) return audioEngine([{ url: recorded, weight: 1 }], hooks)
  if (typeof Audio === 'undefined') return null
  return audioEngine(
    chunkText(text, 180).map((c) => ({
      url: onlineTts(c, lang),
      weight: c.length,
    })),
    hooks,
  )
}
