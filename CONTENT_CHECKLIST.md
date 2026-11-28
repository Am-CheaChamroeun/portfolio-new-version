# Content checklist — what only you can provide

Everything below is **hidden from visitors in production builds** until you fill it in (visitors never see `[PLACEHOLDER]` text).
`npm run dev` still shows placeholders so you can find them. Placeholders are anything written `[IN SQUARE BRACKETS]`.

Text lives in `src/i18n/locales/{en,km,zh-CN}.json` under `content.*`. Everything else (links, images, names) is in `src/data/portfolio.ts`.

## Must do before launch

| # | What | Where | If you skip it |
|---|------|-------|----------------|
| 1 | **Production domain** → `VITE_SITE_URL=https://your-domain` | Vercel env vars / `.env.local` (see `.env.example`) | No canonical URLs, `og:url`, `og:image`, or `sitemap.xml` are generated |
| 2 | **CV file** → `public/documents/am-cheachamroeun-cv.pdf` (already in place) | `profile.cvUrl` / `profile.cvFilename` in `portfolio.ts` | The CV buttons are hidden automatically if the file is missing |
| 3 | **Web3Forms access key** → `VITE_WEB3FORMS_ACCESS_KEY` (local `.env.local` and Vercel) | environment | Without it the form opens the visitor's email app ("Open in email app") and never claims a message was sent |
| 4 | **Projects** — name, slug, tech, `liveUrl`, `repoUrl`, `image` (+ optional `gallery`) | `featuredProject` / `projects` in `portfolio.ts` | The Projects app shows a "coming soon" panel |
| 5 | **Project text** — `tagline`, `description`, `highlights`, and the optional `study` (objectives, problem, solution, role, architecture, challenges) per slug | `content.projects.<slug>` in each locale | Case-study sections without real text are hidden |
| 6 | **Education** — school, period, details | `education` in `portfolio.ts` + `content.education.<id>` | Education shows "coming soon" |
| 7 | **Work experience** — company, job title, type, dates, location, description, responsibilities, achievements, technologies, logo, website | `workExperience` in `portfolio.ts` (logos in `src/assets/experience/`, wording in `content.experience.<id>` in the 3 locale files — see the how-to comment above `workExperience`) | Work Experience shows "coming soon" |
|  | *Certificates (hidden for now)* | `certificates` in `portfolio.ts`, `CertificatesApp.tsx` | Kept for later — re-enable by adding `certificates` back to `src/os/registry.ts` and `routes.ts` |

## Strongly recommended

| What | Where |
|------|-------|
| Profile photo and logo | `profile.photo` (`src/assets/profile/`), `profile.logo` — until then an initial "R" tile is shown |
| Last bio paragraph (what you are looking for) | `content.about.paragraphs[2]` — hidden until replaced |
| Real skill levels (marked `// TODO` for newer skills) | `skillGroups` in `portfolio.ts` |
| Khmer and Chinese translations of any text you add in English | the other two locale files |
| `og-image.png` replaced with your own design (1200×630) | `public/og-image.png` (a plain name + role card is included) |

## Already real (nothing to do)

Email, GitHub, LinkedIn and Telegram links · location (Phnom Penh) · GitHub stats (loaded live from the public GitHub API) ·
System Monitor counts (derived from your skills; "Years coding: 3+" is a hand-written number in `stats` — keep it true).

## Known limitations

* The simulated "Sample deploy" animation in System Monitor is decoration and is labelled as such.
* Khmer / Chinese are chosen in the app (saved in the browser); each page has one URL, so search engines index the English version.
* Without a Web3Forms access key there is no way to know whether the visitor actually sent the email.
