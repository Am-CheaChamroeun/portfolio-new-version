# DeveloperOS — My Digital Workspace

A portfolio built as an interactive developer desktop. Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion · react-i18next (EN / ខ្មែរ / 中文).

## Run

```bash
npm install
npm run dev        # development
npm run build      # type-check + production build + prerender every route
npm run preview    # serve the production build locally
npm run lint       # oxlint
npm run typecheck  # tsc -b
npm test           # Vitest (unit tests)
npm run test:e2e   # Playwright (needs `npm run build` first; first run: npx playwright install chromium)
```

GitHub Actions (`.github/workflows/ci.yml`) runs lint → type check → unit tests → production build → end-to-end tests on every push and pull request.

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
  apps/              ← About, Projects, Skills, Education, Work Experience, Specializations (Services), System Monitor, Terminal, Contact, Settings
                        (Certificates exists but is hidden for now — see CONTENT_CHECKLIST.md)
```

### Add an app
1. Create `src/os/apps/MyApp.tsx` with a default export.
2. Register it in `src/os/registry.ts`.
3. Add `os.apps.<id>` and `os.titles.<id>` to the three files in `src/i18n/locales/`.

## CV

The CV is a normal file in the repository: `public/documents/am-cheachamroeun-cv.pdf` (served at `/documents/am-cheachamroeun-cv.pdf`, copied into `dist/` by the build; it is not stored on Cloudinary). The URL and the saved file name (`Am-Cheachamroeun-CV.pdf`) are set once in `profile.cvUrl` / `profile.cvFilename` in `src/data/portfolio.ts`. To update the CV, replace that one file.

* **Download CV** (saves the PDF) and **View CV** (opens the browser's own PDF viewer in a new tab) are in About Me; a compact Download CV is in the Work Experience toolbar and the Contact sidebar; both commands are in the command palette (`Ctrl/⌘ K` → "cv"), and `cv` works in the Terminal. Component: `src/os/apps/CvActions.tsx`.
* The buttons only appear when the file is really being served, so there is never a dead download.

## Projects

Each project lives in `src/data/portfolio.ts` (`liveUrl`, `repoUrl`, tech list), its text in `content.projects.<slug>` in the three locale files, and its media in `src/data/projectMedia.ts`. **Live Demo** (primary) shows only for a valid public https `liveUrl` — never a Vercel dashboard link — and **Source Code** (secondary) for `repoUrl` (`src/os/apps/ProjectActions.tsx`, `src/lib/url.ts`). Both open in a new tab with `rel="noopener noreferrer"`.

## Voice narration
The About Me app has a play button that reads your bio aloud in the current language (never autoplays). It uses the browser's native voice when one exists, then `public/audio/about-<en|km|zh-CN>.mp3` if you add one, then an online text-to-speech fallback (this is what Khmer uses on most browsers). To make the three MP3s for free with Edge TTS: `pip install edge-tts`, then `python3 scripts/generate-narration.py` (it reads your bio from the translation files; re-run after editing it). Logic: `src/lib/narration.ts`, UI: `src/os/apps/NarrationPlayer.tsx`.

## Content
- Language-independent data (names, links, skill levels, images): `src/data/portfolio.ts`
- All visible text, per language: `src/i18n/locales/{en,km,zh-CN}.json` (the `content` key is your bio, projects, etc.; `os` is the interface)
- Placeholders in `[SQUARE BRACKETS]` are yours to replace; they are shown in `npm run dev` and hidden in production.

## Settings (System Settings app)

Visitors can change the wallpaper (Technical Grid, Neon Wave, Geometric, Topographic), the accent colour,
the language, animations (match system / full / reduced) and optional interaction sounds (off by default).
Choices are saved in `localStorage` (`devos-settings`) and applied before first paint by a small script in
`index.html`. The accent colours live in `src/styles/index.css` (`html[data-accent='…']`); the logic is in
`src/lib/settings.ts`; sounds are synthesised in `src/lib/sound.ts` (no audio files).

## GitHub activity (System Monitor → GitHub)

Set your real GitHub URL in `socials.github` (`src/data/portfolio.ts`); the username is read from it.
Data comes from GitHub's public REST API (no token, nothing secret in the bundle), cached for an hour.
GitHub's official API has no contribution calendar without a private token, so the heatmap shows your real
public events from the last ~90 days. For the full year, host a small server-side proxy and put its URL in
`githubConfig.contributionsUrl` (`src/data/github.ts`). Never put a token in the frontend.

## Theme
Neon Yellow + Dark Graphite. Every colour is a token in `src/styles/index.css`. The desktop, taskbar and icons stay graphite in both themes; the workspace switches between dark and light.

## Images
Illustrations in `src/assets/mock/` are labelled placeholders. Swap them in `src/data/images.ts`, or set real images in `portfolio.ts` (`profile.photo`, `certificate.image`, education `logo`) — a real image always wins. The wallpaper is CSS (`src/os/Wallpaper.tsx`).

### Project media (local + Cloudinary)
Project covers (light/dark) and video posters stay in the repo under `src/assets/projects/<dir>/`; screenshots, mobile screenshots, demo MP4s and GIFs are served from Cloudinary (public IDs in `src/data/projectMedia.ts`, URLs built by `src/lib/cloudinary.ts`). A missing or failing asset is hidden or shown as a small "couldn't be loaded" tile; videos never autoplay or preload. The Cloudinary cloud name (a public value, never a key) defaults to the portfolio's own account; `VITE_CLOUDINARY_CLOUD_NAME` overrides it. File names are prefixed with the project's own unique name (`cashcompass-desktop-02-dashboard.webp`, `resumecraft-demo.mp4` …) so Cloudinary public IDs never collide; the permanent naming standard is in the guide. Guide, verified media list and how to add a project: [`docs/CLOUDINARY_MEDIA.md`](docs/CLOUDINARY_MEDIA.md).

## Notes
- The language and theme choices keep the storage keys `notebook-lang` and `notebook-theme-v2`, so returning visitors keep their settings.
- Repository: <https://github.com/AmCheachamroeun-Portfolio/amcheachamroeun-portfolio>. The personal GitHub profile shown in the app (`socials.github`) is separate from this organisation.

## URLs, SEO and deployment

* **Routes:** `/` (About), `/about`, `/projects`, `/projects/:slug`, `/skills`, `/education`, `/experience`, `/services`, `/monitor`, `/terminal`, `/contact`, `/settings`. The address bar mirrors the OS store (`src/os/routes.ts` + `OSProvider`) — there is no second navigation state. Unknown addresses show a DeveloperOS 404 inside the workspace.
* **Build:** `npm run build` = type-check → Vite build → `scripts/prerender.mjs`, which writes a static HTML file per route (own title, description, canonical, Open Graph / Twitter tags, JSON-LD, readable content), plus `sitemap.xml`, `robots.txt` and `404.html`.
* **Domain:** set `VITE_SITE_URL=https://your-domain` (see `.env.example`). Without it the build warns and skips absolute URLs / sitemap rather than guessing.
* **Vercel:** `vercel.json` enables clean URLs and cache headers. No catch-all rewrite is used on purpose: every real route is a prerendered file and anything else gets `404.html` with a real 404 status.
* **Placeholders:** `[BRACKETED]` content is shown in `npm run dev` and hidden in production — see `CONTENT_CHECKLIST.md`.
