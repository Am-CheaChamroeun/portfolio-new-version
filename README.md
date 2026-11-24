# DeveloperOS — My Digital Workspace

A portfolio built as an interactive developer desktop. Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion · react-i18next (EN / ខ្មែរ / 中文).

## Run

```bash
npm install
npm run dev      # development
npm run build    # type-check + production build
```

## How it works

| Screen | Experience |
| --- | --- |
| Desktop (≥ 1024 px) | Icons on the left, the active app filling the main workspace (About Me by default), taskbar, launcher, right-click menu. One click switches apps — no popup windows |
| Tablet (768–1023 px) | Same desktop and workspace, touch-friendly (a single tap switches app) |
| Phone (< 768 px) | Full-screen apps (About Me first), home-screen icon grid, bottom dock, browser Back closes the app |

```
src/os/
  registry.ts        ← the app list (icon, lazy component)
  store.ts           ← central state: the one active app (reducer)
  OSProvider.tsx     ← state + actions (openApp, launcher)
  Workspace.tsx      ← renders the active app in the main desktop area
  Desktop.tsx  DesktopIcon.tsx  DesktopMenu.tsx
  Taskbar.tsx  AppLauncher.tsx  BootScreen.tsx  MobileShell.tsx
  apps/              ← About, Projects, Skills, Education, Certificates, Services, Monitor, Contact
```

### Add an app
1. Create `src/os/apps/MyApp.tsx` with a default export.
2. Register it in `src/os/registry.ts`.
3. Add `os.apps.<id>` and `os.titles.<id>` to the three files in `src/i18n/locales/`.

## Voice narration
The About Me app has a play button that reads your bio aloud in the current language (never autoplays). It uses the browser's native voice when one exists, then `public/audio/about-<en|km|zh-CN>.mp3` if you add one, then an online text-to-speech fallback (this is what Khmer uses on most browsers). To make the three MP3s for free with Edge TTS: `pip install edge-tts`, then `python3 scripts/generate-narration.py` (it reads your bio from the translation files; re-run after editing it). Logic: `src/lib/narration.ts`, UI: `src/os/apps/NarrationPlayer.tsx`.

## Content
- Language-independent data (names, links, skill levels, images): `src/data/portfolio.ts`
- All visible text, per language: `src/i18n/locales/{en,km,zh-CN}.json` (the `content` key is your bio, projects, etc.; `os` is the interface)
- Placeholders in `[SQUARE BRACKETS]` are yours to replace.

## Theme
Neon Yellow + Dark Graphite. Every colour is a token in `src/styles/index.css`. The desktop, taskbar and icons stay graphite in both themes; the workspace switches between dark and light.

## Images
Illustrations in `src/assets/mock/` are labelled placeholders. Swap them in `src/data/images.ts`, or set real images in `portfolio.ts` (`profile.photo`, `project.image`, `certificate.image`, education `logo`) — a real image always wins. The wallpaper is CSS (`src/os/Wallpaper.tsx`).

## Notes
- The language and theme choices keep the storage keys `notebook-lang` and `notebook-theme-v2`, so returning visitors keep their settings.
- `@fontsource-variable/fraunces` and `@fontsource-variable/caveat` are no longer used and can be removed with `npm uninstall` (then commit the updated lockfile).
