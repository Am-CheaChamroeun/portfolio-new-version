# Project media: local files + Cloudinary

Plain-language summary: small, always-needed pictures live in this repository. Big files (screenshots, videos) live on Cloudinary, a free image/video host, and the portfolio loads them only when a visitor opens that project. If Cloudinary is not set up (or is down), the portfolio still works.

Nothing in this project uploads to Cloudinary, calls its API, or holds a secret. It only builds public delivery URLs.

## 1. Architecture

| Asset | Where it lives | Why |
| --- | --- | --- |
| Project cover (light + dark), card thumbnail | **Local** `src/assets/projects/<dir>/covers/` | Shown on the Projects list, must be instant |
| Video poster image | **Local** `src/assets/projects/<dir>/demo/*-poster.webp` | Shown before the video is played |
| Project logos, tech logos, profile, education, experience images | **Local** (unchanged) | Small, used everywhere |
| Wallpapers, app icons, `PORTFOLIO.md` | **Local** (unchanged) | Part of the site itself |
| Desktop screenshots | **Cloudinary** `portfolio/<slug>/screenshots/` | Large, only seen inside a case study |
| Mobile screenshots | **Cloudinary** `portfolio/<slug>/mobile/` | Same |
| Demo MP4 | **Cloudinary** `portfolio/<slug>/demo/` | Largest files |
| Demo GIF preview (optional) | **Cloudinary** `portfolio/<slug>/demo/` | Only a fallback to the MP4 |

The `originals/` folders and the full-size files stay in each project's own repository. Nothing unrelated was migrated.

Code map:

- `src/lib/cloudinary.ts`: turns a public ID or URL into a delivery URL (`f_auto,q_auto,c_limit`, widths 480 / 960 / 1600, never upscaled). Returns `undefined` for empty values, placeholders and invalid input.
- `src/data/projectMedia.ts`: **the only place that lists media.** Per project: local cover/poster file names plus one row per screenshot `[file, caption, Cloudinary reference]`.
- `src/os/apps/MediaGallery.tsx`: the gallery (desktop/mobile tabs, thumbnails, full-size viewer) and the video component.
- `src/os/apps/CaseStudy.tsx` / `ProjectsApp.tsx`: use the above. No Cloudinary URL appears in any component.

What a visitor's browser does:

1. Projects list: loads only each project's local cover (picked by light/dark theme).
2. Case study opened: hero cover only. The demo and gallery stay as empty placeholders until they are about to scroll into view.
3. Gallery scrolled near: main screenshot + small thumbnails. Mobile screenshots load only when the **Mobile** tab is opened. The full-size viewer loads the larger size only when opened.
4. Video: nothing downloads until Play is pressed (`preload="none"`, no autoplay, the local poster is shown).
5. A Cloudinary image that fails to load falls back to the local copy; if there is none, an "image couldn't be loaded" tile appears. A video that fails shows a message.

The GIF and the MP4 are never both loaded. The MP4 is preferred; the GIF is only offered (behind a "Play animated preview" button) when there is no MP4, or the MP4 fails.

## 2. Cloudinary account and environment

1. Create a free account at cloudinary.com (done by you; this project never does it).
2. Find your **cloud name** on the dashboard.
3. Create `.env.local` in the project root (it is git-ignored):

   ```
   VITE_CLOUDINARY_CLOUD_NAME=your-real-cloud-name
   ```

4. On Vercel, add the same variable under Project → Settings → Environment Variables, then redeploy.

`.env.example` contains only the placeholder `your_cloudinary_cloud_name`, which the code treats as "not configured". **Never** put an API key, API secret or upload preset in any `VITE_` variable: those are copied into the public site.

You can skip the cloud name entirely by pasting full `https://res.cloudinary.com/...` URLs into `projectMedia.ts`.

## 3. Folder layout and uploading

Recommended folders (use existing project slugs only):

```
portfolio/cashcompass/screenshots/
portfolio/cashcompass/mobile/
portfolio/cashcompass/demo/
portfolio/resumecraft/screenshots/
portfolio/resumecraft/mobile/
portfolio/resumecraft/demo/
```

Upload by hand in Cloudinary → Media Library → the folder → Upload. Use the originals from each project's `screenshots/`, `mobile/` and `demo/` folders (WebP/PNG screenshots, MP4). Do not upload the `originals/` folders unless you want them.

Public IDs: Cloudinary shows each file's **Public ID** in its details panel. Depending on your account's folder mode, the public ID may or may not include the folder, and may have a random suffix. **Copy the real value from Cloudinary; do not assume it equals the folder path.** Use the ID without a file extension for images.

## 4. Where to put the public IDs / URLs

Open `src/data/projectMedia.ts`. Replace `TODO_CLOUDINARY_PUBLIC_ID_OR_URL` in each row with the public ID (needs `VITE_CLOUDINARY_CLOUD_NAME`) or the full URL:

```ts
['02-dashboard.webp', 'Dashboard', 'portfolio/cashcompass/screenshots/02-dashboard'],
```

Project level: `video` (MP4) and `gif` (optional). Rows still containing a placeholder are skipped silently: the local copy is shown instead, or the item is left out.

Captions are English. To translate one, add `content.projects.<slug>.media.<file-name-without-extension>` to `en.json`, `km.json` and `zh-CN.json`.

## 5. Recommended sizes

- Desktop screenshots: 1920 px wide (current files are 1920×1200). The site asks for 480 / 960 / 1600 px.
- Mobile screenshots: about 780 px wide.
- Demo MP4: 1080p, silent, ideally under 5 MB (Cloudinary free-plan video limit is 100 MB per file).
- GIF: only if you want a fallback; keep it under about 1 MB, 1120 px wide.
- Poster and covers (local): 1600×900 WebP.

## 6. Adding a future project

1. Add the project to `src/data/portfolio.ts` as usual (and its text in the locale files).
2. Put its cover files in `src/assets/projects/<dir>/covers/` and the poster in `demo/`.
3. Upload screenshots/videos to `portfolio/<slug>/...`.
4. Add an entry in `src/data/projectMedia.ts` keyed by the project's slug (copy the CashCompass entry).

## 7. Verifying

- With **no** `.env.local`: the site works; Projects show covers; case studies show local screenshots (once the screenshots are in the repo) and no demo section.
- With the cloud name and real IDs: open the project, scroll to the gallery, and in the browser's Network tab check that images come from `res.cloudinary.com` with `f_auto,q_auto`.
- Press Play on the demo: only then does the MP4 request appear.
- Only after you provide real URLs and see them load is Cloudinary delivery verified. It has not been tested against a real account here.

## 8. Removing local copies safely

Only after the Cloudinary version of a file is confirmed working on the deployed site:

1. Delete the matching local file in `src/assets/projects/<dir>/screenshots/` or `mobile/`.
2. Keep `covers/` and `demo/*-poster.webp` (they stay local on purpose).
3. Keep each project repo's own copy as the master.

Until you delete them, the local screenshots are still bundled into the build (Vercel deploy gets bigger) and serve as the fallback. Removing them shrinks the deploy but removes the fallback for that file.

## 9. Free-tier notes

- No periodic requests, health checks or background calls. Cloudinary is only contacted when a visitor views that media.
- The width ladder (480 / 960 / 1600) keeps the number of derived images small; `f_auto,q_auto` reduces bandwidth.
- Free-plan credits cover storage, transformations and bandwidth together; check your dashboard if traffic grows.

## 10. Migration checklist (actual filenames)

Source files are under `src/assets/projects/<dir>/`. Destination folders are in Cloudinary.

### CashCompass (`cash-compass/` → `portfolio/cashcompass/`)

- [ ] `screenshots/` → `portfolio/cashcompass/screenshots/`: 01-landing-page, 02-dashboard, 03-transactions, 04-accounts, 05-budgets, 06-savings-goals, 07-analytics, 08-recurring-payments, 09-cash-flow-forecast, 10-financial-calendar, 11-financial-reports, 12-notifications, 13-dark-dashboard, 14-khmer-dashboard, 15-pdf-export (`.webp`)
- [ ] `mobile/` → `portfolio/cashcompass/mobile/`: 01-mobile-home, 02-mobile-dashboard, 03-mobile-transactions, 04-mobile-budgets, 05-mobile-calendar (`.png`)
- [ ] `demo/cashcompass-demo.mp4` → `portfolio/cashcompass/demo/`
- [ ] (optional) `demo/cashcompass-demo.gif` → `portfolio/cashcompass/demo/`
- [ ] Paste the public IDs/URLs into `projectMedia.ts` (`cashcompass`)
- [ ] Keep local: `covers/cashcompass-cover-dark.webp`, `covers/cashcompass-cover-light.webp`, `demo/cashcompass-demo-poster.webp`, `PORTFOLIO.md`

### ResumeCraft (`resume-builder/` → `portfolio/resumecraft/`)

- [ ] `screenshots/` → `portfolio/resumecraft/screenshots/`: 01-landing-page, 02-template-gallery, 03-resume-editor, 04-editor-dark, 05-customization, 06-ai-assistant, 07-ats-analysis, 08-my-resumes, 09-cover-letter, 10-cover-letter-templates, 11-khmer-resume, 12-pdf-export, 13-version-history (`.webp`)
- [ ] `mobile/` → `portfolio/resumecraft/mobile/`: 01-mobile-home, 02-mobile-templates, 03-mobile-editor, 04-mobile-preview (`.png`)
- [ ] `demo/resumecraft-demo.mp4` → `portfolio/resumecraft/demo/`
- [ ] (optional) `demo/resumecraft-demo.gif` → `portfolio/resumecraft/demo/`
- [ ] Paste the public IDs/URLs into `projectMedia.ts` (`resumecraft`)
- [ ] Keep local: `covers/resumecraft-cover-dark.webp`, `covers/resumecraft-cover-light.webp`, `demo/resumecraft-demo-poster.webp`, `PORTFOLIO.md`

### Not migrated

`originals/` folders, wallpapers, logos, profile, education and experience images, and everything for other projects.

## 11. Known limits

- `cashcompass` and `resumecraft` are not entries in `portfolio.ts` yet, so their media does not appear until those projects are added (their slugs must match the keys in `projectMedia.ts`).
- Captions are English unless translated as described in section 4.
