# Project media: local files + Cloudinary

Plain-language summary: only the small, always-needed pictures (covers and video posters) are used from this repository. Everything heavy (screenshots, mobile screenshots, demo videos, GIFs) lives on Cloudinary and is loaded only when a visitor opens that project. If a Cloudinary reference is missing or Cloudinary is down, the portfolio still works and that media is simply hidden.

Nothing in this project uploads to Cloudinary, calls its API, or holds a secret. It only builds public delivery URLs.

## 1. Naming standard (permanent, for every project)

Cloudinary public IDs must be unique, and two projects used the same file names (`01-landing-page.webp`). So **every project-specific media file starts with the project's own unique prefix** (the project slug, lowercase, no hyphen inside it):

| Media type | Pattern | Example |
| --- | --- | --- |
| Desktop screenshot | `{project}-desktop-{NN}-{feature}.webp` | `cashcompass-desktop-02-dashboard.webp` |
| Mobile screenshot | `{project}-mobile-{NN}-{feature}.{ext}` | `resumecraft-mobile-03-editor.png` |
| Original image | `{project}-original-{descriptive-name}.{ext}` | `cashcompass-original-02-dashboard.png` |
| Light cover | `{project}-cover-light.webp` | `cashcompass-cover-light.webp` |
| Dark cover | `{project}-cover-dark.webp` | `resumecraft-cover-dark.webp` |
| PNG cover | `{project}-cover.png` | `resumecraft-cover.png` |
| Demo video | `{project}-demo.mp4` | `cashcompass-demo.mp4` |
| Demo GIF | `{project}-demo.gif` | `cashcompass-demo.gif` |
| Demo poster | `{project}-demo-poster.webp` | `resumecraft-demo-poster.webp` |

Rules: lowercase; hyphens only (no spaces or underscores); two-digit sequence numbers (`01`, `02` …) that keep the screenshot order; keep the real extension and format; keep the descriptive feature name; one prefix per name (never `cashcompass-cashcompass-…`); a file name must not repeat inside the same project in another category (e.g. an original PNG of a cover is `…-original-cover-light.png`, not `…-cover-light.png`).

The MP4 and GIF share the stem `{project}-demo`. That is fine on Cloudinary because they are different **resource types** (MP4 = `video`, GIF = `image`), but they get separate placeholders here (`…-demo-mp4`, `…-demo-gif`).

Future projects follow the same rule with their own prefix, for example `flowboard-desktop-01-dashboard.webp`, `flowboard-mobile-01-board.webp`, `flowboard-demo.mp4`, `flowboard-cover-light.webp`.

## 2. Architecture

| Asset | Where it lives |
| --- | --- |
| Project covers (light + dark, PNG cover) and card thumbnails | **Local** `src/assets/projects/<dir>/covers/` |
| Video poster images | **Local** `src/assets/projects/<dir>/demo/*-poster.webp` |
| `PORTFOLIO.md`, logos, tech logos, profile, education and experience images, wallpapers, app icons | **Local** |
| Desktop screenshots | **Cloudinary** `portfolio/<slug>/screenshots` |
| Mobile screenshots | **Cloudinary** `portfolio/<slug>/mobile` |
| Demo MP4 and optional GIF | **Cloudinary** `portfolio/<slug>/demo` |
| Original uncompressed media | **Original project repositories** (the local `originals/` folders are a convenience copy and are never imported) |

Local folders (kept as they are; the screenshots, mobile, demo MP4/GIF and originals are currently restored locally but are **not** used by the site):

```
src/assets/projects/
├── cash-compass/   covers/ demo/ mobile/ originals/ screenshots/ PORTFOLIO.md
└── resume-craft/   covers/ demo/ mobile/ originals/ screenshots/ PORTFOLIO.md
```

Only `covers/*.webp` and `demo/*-poster.webp` are imported by the site (`src/data/projectMedia.ts`). Nothing else in these folders is bundled, so the restored files do not affect the build. Remove the duplicates only after the Cloudinary versions are verified.

Code map: `src/lib/cloudinary.ts` (URL builder, `f_auto,q_auto,c_limit`, widths 480/960/1600), `src/data/projectMedia.ts` (the only place that lists media), `src/os/apps/MediaGallery.tsx` (gallery, viewer, video), captions in `content.projects.<slug>.media.<desktop|mobile>-<NN>-<feature>` in the three locale files.

What a visitor's browser does: the Projects list loads only the local cover; a case study loads its cover, and the gallery/demo only when about to scroll into view; mobile screenshots only when the Mobile tab is opened; the MP4 only after Play (no autoplay, local poster); the GIF is never loaded together with the MP4.

## 3. Environment

Your cloud name is already in `.env.local`:

```
VITE_CLOUDINARY_CLOUD_NAME=df3cyznc
```

`.env.example` keeps only the placeholder. Add the same variable on Vercel when you deploy. Never put an API key, secret or upload preset in a `VITE_` variable.

## 4. Public IDs (Dynamic folders)

Your account uses Dynamic folders, so a file's folder is **not** part of its public ID. The recommended public ID is the file name without its extension (images: no extension; video: no extension). After uploading, open each asset and copy its real **Public ID** (Cloudinary may append a random suffix if a name already exists) or its full delivery URL, and use that. Do not build IDs from folder names. Do not leave the old, unprefixed uploads in place: they are not referenced by anything and can be removed from Cloudinary once the new ones work.

## 5. Where to put the values

In `src/data/projectMedia.ts` each row looks like:

```ts
['cashcompass-desktop-02-dashboard.webp', 'TODO_CLOUDINARY_cashcompass-desktop-02-dashboard'],
```

Replace only the second value with the real public ID or URL. Rows that still hold a placeholder are skipped silently (no broken image); the video section stays hidden until `video` (or `gif`) is set.

## 6. Upload checklist

Counts verified against the actual files: CashCompass 22 references (15 desktop + 5 mobile + 1 MP4 + 1 GIF), ResumeCraft 19 references (13 desktop + 4 mobile + 1 MP4 + 1 GIF). No files are missing and none are extra. In each project's `originals/` there are also the lossless PNGs (CashCompass 16, ResumeCraft 15); those are not uploaded.

| # | Project | Original filename | New filename | Local file path | Cloudinary folder | Recommended public ID | Resource type | Config location (`src/data/projectMedia.ts`) | Placeholder to replace |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | CashCompass | `01-landing-page.webp` | `cashcompass-desktop-01-landing-page.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-01-landing-page.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-01-landing-page` | image | `cashcompass` → `desktop` row `cashcompass-desktop-01-landing-page.webp` | `TODO_CLOUDINARY_cashcompass-desktop-01-landing-page` |
| 2 | CashCompass | `02-dashboard.webp` | `cashcompass-desktop-02-dashboard.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-02-dashboard.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-02-dashboard` | image | `cashcompass` → `desktop` row `cashcompass-desktop-02-dashboard.webp` | `TODO_CLOUDINARY_cashcompass-desktop-02-dashboard` |
| 3 | CashCompass | `03-transactions.webp` | `cashcompass-desktop-03-transactions.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-03-transactions.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-03-transactions` | image | `cashcompass` → `desktop` row `cashcompass-desktop-03-transactions.webp` | `TODO_CLOUDINARY_cashcompass-desktop-03-transactions` |
| 4 | CashCompass | `04-accounts.webp` | `cashcompass-desktop-04-accounts.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-04-accounts.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-04-accounts` | image | `cashcompass` → `desktop` row `cashcompass-desktop-04-accounts.webp` | `TODO_CLOUDINARY_cashcompass-desktop-04-accounts` |
| 5 | CashCompass | `05-budgets.webp` | `cashcompass-desktop-05-budgets.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-05-budgets.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-05-budgets` | image | `cashcompass` → `desktop` row `cashcompass-desktop-05-budgets.webp` | `TODO_CLOUDINARY_cashcompass-desktop-05-budgets` |
| 6 | CashCompass | `06-savings-goals.webp` | `cashcompass-desktop-06-savings-goals.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-06-savings-goals.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-06-savings-goals` | image | `cashcompass` → `desktop` row `cashcompass-desktop-06-savings-goals.webp` | `TODO_CLOUDINARY_cashcompass-desktop-06-savings-goals` |
| 7 | CashCompass | `07-analytics.webp` | `cashcompass-desktop-07-analytics.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-07-analytics.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-07-analytics` | image | `cashcompass` → `desktop` row `cashcompass-desktop-07-analytics.webp` | `TODO_CLOUDINARY_cashcompass-desktop-07-analytics` |
| 8 | CashCompass | `08-recurring-payments.webp` | `cashcompass-desktop-08-recurring-payments.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-08-recurring-payments.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-08-recurring-payments` | image | `cashcompass` → `desktop` row `cashcompass-desktop-08-recurring-payments.webp` | `TODO_CLOUDINARY_cashcompass-desktop-08-recurring-payments` |
| 9 | CashCompass | `09-cash-flow-forecast.webp` | `cashcompass-desktop-09-cash-flow-forecast.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-09-cash-flow-forecast.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-09-cash-flow-forecast` | image | `cashcompass` → `desktop` row `cashcompass-desktop-09-cash-flow-forecast.webp` | `TODO_CLOUDINARY_cashcompass-desktop-09-cash-flow-forecast` |
| 10 | CashCompass | `10-financial-calendar.webp` | `cashcompass-desktop-10-financial-calendar.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-10-financial-calendar.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-10-financial-calendar` | image | `cashcompass` → `desktop` row `cashcompass-desktop-10-financial-calendar.webp` | `TODO_CLOUDINARY_cashcompass-desktop-10-financial-calendar` |
| 11 | CashCompass | `11-financial-reports.webp` | `cashcompass-desktop-11-financial-reports.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-11-financial-reports.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-11-financial-reports` | image | `cashcompass` → `desktop` row `cashcompass-desktop-11-financial-reports.webp` | `TODO_CLOUDINARY_cashcompass-desktop-11-financial-reports` |
| 12 | CashCompass | `12-notifications.webp` | `cashcompass-desktop-12-notifications.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-12-notifications.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-12-notifications` | image | `cashcompass` → `desktop` row `cashcompass-desktop-12-notifications.webp` | `TODO_CLOUDINARY_cashcompass-desktop-12-notifications` |
| 13 | CashCompass | `13-dark-dashboard.webp` | `cashcompass-desktop-13-dark-dashboard.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-13-dark-dashboard.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-13-dark-dashboard` | image | `cashcompass` → `desktop` row `cashcompass-desktop-13-dark-dashboard.webp` | `TODO_CLOUDINARY_cashcompass-desktop-13-dark-dashboard` |
| 14 | CashCompass | `14-khmer-dashboard.webp` | `cashcompass-desktop-14-khmer-dashboard.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-14-khmer-dashboard.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-14-khmer-dashboard` | image | `cashcompass` → `desktop` row `cashcompass-desktop-14-khmer-dashboard.webp` | `TODO_CLOUDINARY_cashcompass-desktop-14-khmer-dashboard` |
| 15 | CashCompass | `15-pdf-export.webp` | `cashcompass-desktop-15-pdf-export.webp` | `src/assets/projects/cash-compass/screenshots/cashcompass-desktop-15-pdf-export.webp` | `portfolio/cashcompass/screenshots` | `cashcompass-desktop-15-pdf-export` | image | `cashcompass` → `desktop` row `cashcompass-desktop-15-pdf-export.webp` | `TODO_CLOUDINARY_cashcompass-desktop-15-pdf-export` |
| 16 | CashCompass | `01-mobile-home.png` | `cashcompass-mobile-01-home.png` | `src/assets/projects/cash-compass/mobile/cashcompass-mobile-01-home.png` | `portfolio/cashcompass/mobile` | `cashcompass-mobile-01-home` | image | `cashcompass` → `mobile` row `cashcompass-mobile-01-home.png` | `TODO_CLOUDINARY_cashcompass-mobile-01-home` |
| 17 | CashCompass | `02-mobile-dashboard.png` | `cashcompass-mobile-02-dashboard.png` | `src/assets/projects/cash-compass/mobile/cashcompass-mobile-02-dashboard.png` | `portfolio/cashcompass/mobile` | `cashcompass-mobile-02-dashboard` | image | `cashcompass` → `mobile` row `cashcompass-mobile-02-dashboard.png` | `TODO_CLOUDINARY_cashcompass-mobile-02-dashboard` |
| 18 | CashCompass | `03-mobile-transactions.png` | `cashcompass-mobile-03-transactions.png` | `src/assets/projects/cash-compass/mobile/cashcompass-mobile-03-transactions.png` | `portfolio/cashcompass/mobile` | `cashcompass-mobile-03-transactions` | image | `cashcompass` → `mobile` row `cashcompass-mobile-03-transactions.png` | `TODO_CLOUDINARY_cashcompass-mobile-03-transactions` |
| 19 | CashCompass | `04-mobile-budgets.png` | `cashcompass-mobile-04-budgets.png` | `src/assets/projects/cash-compass/mobile/cashcompass-mobile-04-budgets.png` | `portfolio/cashcompass/mobile` | `cashcompass-mobile-04-budgets` | image | `cashcompass` → `mobile` row `cashcompass-mobile-04-budgets.png` | `TODO_CLOUDINARY_cashcompass-mobile-04-budgets` |
| 20 | CashCompass | `05-mobile-calendar.png` | `cashcompass-mobile-05-calendar.png` | `src/assets/projects/cash-compass/mobile/cashcompass-mobile-05-calendar.png` | `portfolio/cashcompass/mobile` | `cashcompass-mobile-05-calendar` | image | `cashcompass` → `mobile` row `cashcompass-mobile-05-calendar.png` | `TODO_CLOUDINARY_cashcompass-mobile-05-calendar` |
| 21 | CashCompass | `cashcompass-demo.mp4` | `cashcompass-demo.mp4` | `src/assets/projects/cash-compass/demo/cashcompass-demo.mp4` | `portfolio/cashcompass/demo` | `cashcompass-demo` | video | `cashcompass` → `video` | `TODO_CLOUDINARY_cashcompass-demo-mp4` |
| 22 | CashCompass | `cashcompass-demo.gif` | `cashcompass-demo.gif` | `src/assets/projects/cash-compass/demo/cashcompass-demo.gif` | `portfolio/cashcompass/demo` | `cashcompass-demo` | image | `cashcompass` → `gif` | `TODO_CLOUDINARY_cashcompass-demo-gif` |
| 23 | ResumeCraft | `01-landing-page.webp` | `resumecraft-desktop-01-landing-page.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-01-landing-page.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-01-landing-page` | image | `resumecraft` → `desktop` row `resumecraft-desktop-01-landing-page.webp` | `TODO_CLOUDINARY_resumecraft-desktop-01-landing-page` |
| 24 | ResumeCraft | `02-template-gallery.webp` | `resumecraft-desktop-02-template-gallery.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-02-template-gallery.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-02-template-gallery` | image | `resumecraft` → `desktop` row `resumecraft-desktop-02-template-gallery.webp` | `TODO_CLOUDINARY_resumecraft-desktop-02-template-gallery` |
| 25 | ResumeCraft | `03-resume-editor.webp` | `resumecraft-desktop-03-resume-editor.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-03-resume-editor.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-03-resume-editor` | image | `resumecraft` → `desktop` row `resumecraft-desktop-03-resume-editor.webp` | `TODO_CLOUDINARY_resumecraft-desktop-03-resume-editor` |
| 26 | ResumeCraft | `04-editor-dark.webp` | `resumecraft-desktop-04-editor-dark.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-04-editor-dark.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-04-editor-dark` | image | `resumecraft` → `desktop` row `resumecraft-desktop-04-editor-dark.webp` | `TODO_CLOUDINARY_resumecraft-desktop-04-editor-dark` |
| 27 | ResumeCraft | `05-customization.webp` | `resumecraft-desktop-05-customization.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-05-customization.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-05-customization` | image | `resumecraft` → `desktop` row `resumecraft-desktop-05-customization.webp` | `TODO_CLOUDINARY_resumecraft-desktop-05-customization` |
| 28 | ResumeCraft | `06-ai-assistant.webp` | `resumecraft-desktop-06-ai-assistant.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-06-ai-assistant.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-06-ai-assistant` | image | `resumecraft` → `desktop` row `resumecraft-desktop-06-ai-assistant.webp` | `TODO_CLOUDINARY_resumecraft-desktop-06-ai-assistant` |
| 29 | ResumeCraft | `07-ats-analysis.webp` | `resumecraft-desktop-07-ats-analysis.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-07-ats-analysis.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-07-ats-analysis` | image | `resumecraft` → `desktop` row `resumecraft-desktop-07-ats-analysis.webp` | `TODO_CLOUDINARY_resumecraft-desktop-07-ats-analysis` |
| 30 | ResumeCraft | `08-my-resumes.webp` | `resumecraft-desktop-08-my-resumes.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-08-my-resumes.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-08-my-resumes` | image | `resumecraft` → `desktop` row `resumecraft-desktop-08-my-resumes.webp` | `TODO_CLOUDINARY_resumecraft-desktop-08-my-resumes` |
| 31 | ResumeCraft | `09-cover-letter.webp` | `resumecraft-desktop-09-cover-letter.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-09-cover-letter.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-09-cover-letter` | image | `resumecraft` → `desktop` row `resumecraft-desktop-09-cover-letter.webp` | `TODO_CLOUDINARY_resumecraft-desktop-09-cover-letter` |
| 32 | ResumeCraft | `10-cover-letter-templates.webp` | `resumecraft-desktop-10-cover-letter-templates.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-10-cover-letter-templates.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-10-cover-letter-templates` | image | `resumecraft` → `desktop` row `resumecraft-desktop-10-cover-letter-templates.webp` | `TODO_CLOUDINARY_resumecraft-desktop-10-cover-letter-templates` |
| 33 | ResumeCraft | `11-khmer-resume.webp` | `resumecraft-desktop-11-khmer-resume.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-11-khmer-resume.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-11-khmer-resume` | image | `resumecraft` → `desktop` row `resumecraft-desktop-11-khmer-resume.webp` | `TODO_CLOUDINARY_resumecraft-desktop-11-khmer-resume` |
| 34 | ResumeCraft | `12-pdf-export.webp` | `resumecraft-desktop-12-pdf-export.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-12-pdf-export.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-12-pdf-export` | image | `resumecraft` → `desktop` row `resumecraft-desktop-12-pdf-export.webp` | `TODO_CLOUDINARY_resumecraft-desktop-12-pdf-export` |
| 35 | ResumeCraft | `13-version-history.webp` | `resumecraft-desktop-13-version-history.webp` | `src/assets/projects/resume-craft/screenshots/resumecraft-desktop-13-version-history.webp` | `portfolio/resumecraft/screenshots` | `resumecraft-desktop-13-version-history` | image | `resumecraft` → `desktop` row `resumecraft-desktop-13-version-history.webp` | `TODO_CLOUDINARY_resumecraft-desktop-13-version-history` |
| 36 | ResumeCraft | `01-mobile-home.png` | `resumecraft-mobile-01-home.png` | `src/assets/projects/resume-craft/mobile/resumecraft-mobile-01-home.png` | `portfolio/resumecraft/mobile` | `resumecraft-mobile-01-home` | image | `resumecraft` → `mobile` row `resumecraft-mobile-01-home.png` | `TODO_CLOUDINARY_resumecraft-mobile-01-home` |
| 37 | ResumeCraft | `02-mobile-templates.png` | `resumecraft-mobile-02-templates.png` | `src/assets/projects/resume-craft/mobile/resumecraft-mobile-02-templates.png` | `portfolio/resumecraft/mobile` | `resumecraft-mobile-02-templates` | image | `resumecraft` → `mobile` row `resumecraft-mobile-02-templates.png` | `TODO_CLOUDINARY_resumecraft-mobile-02-templates` |
| 38 | ResumeCraft | `03-mobile-editor.png` | `resumecraft-mobile-03-editor.png` | `src/assets/projects/resume-craft/mobile/resumecraft-mobile-03-editor.png` | `portfolio/resumecraft/mobile` | `resumecraft-mobile-03-editor` | image | `resumecraft` → `mobile` row `resumecraft-mobile-03-editor.png` | `TODO_CLOUDINARY_resumecraft-mobile-03-editor` |
| 39 | ResumeCraft | `04-mobile-preview.png` | `resumecraft-mobile-04-preview.png` | `src/assets/projects/resume-craft/mobile/resumecraft-mobile-04-preview.png` | `portfolio/resumecraft/mobile` | `resumecraft-mobile-04-preview` | image | `resumecraft` → `mobile` row `resumecraft-mobile-04-preview.png` | `TODO_CLOUDINARY_resumecraft-mobile-04-preview` |
| 40 | ResumeCraft | `resumecraft-demo.mp4` | `resumecraft-demo.mp4` | `src/assets/projects/resume-craft/demo/resumecraft-demo.mp4` | `portfolio/resumecraft/demo` | `resumecraft-demo` | video | `resumecraft` → `video` | `TODO_CLOUDINARY_resumecraft-demo-mp4` |
| 41 | ResumeCraft | `resumecraft-demo.gif` | `resumecraft-demo.gif` | `src/assets/projects/resume-craft/demo/resumecraft-demo.gif` | `portfolio/resumecraft/demo` | `resumecraft-demo` | image | `resumecraft` → `gif` | `TODO_CLOUDINARY_resumecraft-demo-gif` |

### Paste-ready list

Send the public ID or full URL after each `=`:

```
TODO_CLOUDINARY_cashcompass-desktop-01-landing-page = 
TODO_CLOUDINARY_cashcompass-desktop-02-dashboard = 
TODO_CLOUDINARY_cashcompass-desktop-03-transactions = 
TODO_CLOUDINARY_cashcompass-desktop-04-accounts = 
TODO_CLOUDINARY_cashcompass-desktop-05-budgets = 
TODO_CLOUDINARY_cashcompass-desktop-06-savings-goals = 
TODO_CLOUDINARY_cashcompass-desktop-07-analytics = 
TODO_CLOUDINARY_cashcompass-desktop-08-recurring-payments = 
TODO_CLOUDINARY_cashcompass-desktop-09-cash-flow-forecast = 
TODO_CLOUDINARY_cashcompass-desktop-10-financial-calendar = 
TODO_CLOUDINARY_cashcompass-desktop-11-financial-reports = 
TODO_CLOUDINARY_cashcompass-desktop-12-notifications = 
TODO_CLOUDINARY_cashcompass-desktop-13-dark-dashboard = 
TODO_CLOUDINARY_cashcompass-desktop-14-khmer-dashboard = 
TODO_CLOUDINARY_cashcompass-desktop-15-pdf-export = 
TODO_CLOUDINARY_cashcompass-mobile-01-home = 
TODO_CLOUDINARY_cashcompass-mobile-02-dashboard = 
TODO_CLOUDINARY_cashcompass-mobile-03-transactions = 
TODO_CLOUDINARY_cashcompass-mobile-04-budgets = 
TODO_CLOUDINARY_cashcompass-mobile-05-calendar = 
TODO_CLOUDINARY_cashcompass-demo-mp4 = 
TODO_CLOUDINARY_cashcompass-demo-gif = 
TODO_CLOUDINARY_resumecraft-desktop-01-landing-page = 
TODO_CLOUDINARY_resumecraft-desktop-02-template-gallery = 
TODO_CLOUDINARY_resumecraft-desktop-03-resume-editor = 
TODO_CLOUDINARY_resumecraft-desktop-04-editor-dark = 
TODO_CLOUDINARY_resumecraft-desktop-05-customization = 
TODO_CLOUDINARY_resumecraft-desktop-06-ai-assistant = 
TODO_CLOUDINARY_resumecraft-desktop-07-ats-analysis = 
TODO_CLOUDINARY_resumecraft-desktop-08-my-resumes = 
TODO_CLOUDINARY_resumecraft-desktop-09-cover-letter = 
TODO_CLOUDINARY_resumecraft-desktop-10-cover-letter-templates = 
TODO_CLOUDINARY_resumecraft-desktop-11-khmer-resume = 
TODO_CLOUDINARY_resumecraft-desktop-12-pdf-export = 
TODO_CLOUDINARY_resumecraft-desktop-13-version-history = 
TODO_CLOUDINARY_resumecraft-mobile-01-home = 
TODO_CLOUDINARY_resumecraft-mobile-02-templates = 
TODO_CLOUDINARY_resumecraft-mobile-03-editor = 
TODO_CLOUDINARY_resumecraft-mobile-04-preview = 
TODO_CLOUDINARY_resumecraft-demo-mp4 = 
TODO_CLOUDINARY_resumecraft-demo-gif = 
```

## 7. Complete old → new filename mapping (68 files)

Unchanged because they were already compliant: all files in `covers/` and `demo/` (poster, MP4, GIF) and both `PORTFOLIO.md` files. Renamed: CashCompass 36, ResumeCraft 32.

| # | Project | Old filename | New filename | Folder |
| --- | --- | --- | --- | --- |
| 1 | CashCompass | `01-landing-page.webp` | `cashcompass-desktop-01-landing-page.webp` | `screenshots/` |
| 2 | CashCompass | `02-dashboard.webp` | `cashcompass-desktop-02-dashboard.webp` | `screenshots/` |
| 3 | CashCompass | `03-transactions.webp` | `cashcompass-desktop-03-transactions.webp` | `screenshots/` |
| 4 | CashCompass | `04-accounts.webp` | `cashcompass-desktop-04-accounts.webp` | `screenshots/` |
| 5 | CashCompass | `05-budgets.webp` | `cashcompass-desktop-05-budgets.webp` | `screenshots/` |
| 6 | CashCompass | `06-savings-goals.webp` | `cashcompass-desktop-06-savings-goals.webp` | `screenshots/` |
| 7 | CashCompass | `07-analytics.webp` | `cashcompass-desktop-07-analytics.webp` | `screenshots/` |
| 8 | CashCompass | `08-recurring-payments.webp` | `cashcompass-desktop-08-recurring-payments.webp` | `screenshots/` |
| 9 | CashCompass | `09-cash-flow-forecast.webp` | `cashcompass-desktop-09-cash-flow-forecast.webp` | `screenshots/` |
| 10 | CashCompass | `10-financial-calendar.webp` | `cashcompass-desktop-10-financial-calendar.webp` | `screenshots/` |
| 11 | CashCompass | `11-financial-reports.webp` | `cashcompass-desktop-11-financial-reports.webp` | `screenshots/` |
| 12 | CashCompass | `12-notifications.webp` | `cashcompass-desktop-12-notifications.webp` | `screenshots/` |
| 13 | CashCompass | `13-dark-dashboard.webp` | `cashcompass-desktop-13-dark-dashboard.webp` | `screenshots/` |
| 14 | CashCompass | `14-khmer-dashboard.webp` | `cashcompass-desktop-14-khmer-dashboard.webp` | `screenshots/` |
| 15 | CashCompass | `15-pdf-export.webp` | `cashcompass-desktop-15-pdf-export.webp` | `screenshots/` |
| 16 | CashCompass | `01-mobile-home.png` | `cashcompass-mobile-01-home.png` | `mobile/` |
| 17 | CashCompass | `02-mobile-dashboard.png` | `cashcompass-mobile-02-dashboard.png` | `mobile/` |
| 18 | CashCompass | `03-mobile-transactions.png` | `cashcompass-mobile-03-transactions.png` | `mobile/` |
| 19 | CashCompass | `04-mobile-budgets.png` | `cashcompass-mobile-04-budgets.png` | `mobile/` |
| 20 | CashCompass | `05-mobile-calendar.png` | `cashcompass-mobile-05-calendar.png` | `mobile/` |
| 21 | CashCompass | `01-landing-page.png` | `cashcompass-original-01-landing-page.png` | `originals/` |
| 22 | CashCompass | `02-dashboard.png` | `cashcompass-original-02-dashboard.png` | `originals/` |
| 23 | CashCompass | `03-transactions.png` | `cashcompass-original-03-transactions.png` | `originals/` |
| 24 | CashCompass | `04-accounts.png` | `cashcompass-original-04-accounts.png` | `originals/` |
| 25 | CashCompass | `05-budgets.png` | `cashcompass-original-05-budgets.png` | `originals/` |
| 26 | CashCompass | `06-savings-goals.png` | `cashcompass-original-06-savings-goals.png` | `originals/` |
| 27 | CashCompass | `07-analytics.png` | `cashcompass-original-07-analytics.png` | `originals/` |
| 28 | CashCompass | `08-recurring-payments.png` | `cashcompass-original-08-recurring-payments.png` | `originals/` |
| 29 | CashCompass | `09-cash-flow-forecast.png` | `cashcompass-original-09-cash-flow-forecast.png` | `originals/` |
| 30 | CashCompass | `10-financial-calendar.png` | `cashcompass-original-10-financial-calendar.png` | `originals/` |
| 31 | CashCompass | `11-financial-reports.png` | `cashcompass-original-11-financial-reports.png` | `originals/` |
| 32 | CashCompass | `12-notifications.png` | `cashcompass-original-12-notifications.png` | `originals/` |
| 33 | CashCompass | `13-dark-dashboard.png` | `cashcompass-original-13-dark-dashboard.png` | `originals/` |
| 34 | CashCompass | `14-khmer-dashboard.png` | `cashcompass-original-14-khmer-dashboard.png` | `originals/` |
| 35 | CashCompass | `15-pdf-export.png` | `cashcompass-original-15-pdf-export.png` | `originals/` |
| 36 | CashCompass | `cashcompass-cover-light.png` | `cashcompass-original-cover-light.png` | `originals/` |
| 37 | ResumeCraft | `01-landing-page.webp` | `resumecraft-desktop-01-landing-page.webp` | `screenshots/` |
| 38 | ResumeCraft | `02-template-gallery.webp` | `resumecraft-desktop-02-template-gallery.webp` | `screenshots/` |
| 39 | ResumeCraft | `03-resume-editor.webp` | `resumecraft-desktop-03-resume-editor.webp` | `screenshots/` |
| 40 | ResumeCraft | `04-editor-dark.webp` | `resumecraft-desktop-04-editor-dark.webp` | `screenshots/` |
| 41 | ResumeCraft | `05-customization.webp` | `resumecraft-desktop-05-customization.webp` | `screenshots/` |
| 42 | ResumeCraft | `06-ai-assistant.webp` | `resumecraft-desktop-06-ai-assistant.webp` | `screenshots/` |
| 43 | ResumeCraft | `07-ats-analysis.webp` | `resumecraft-desktop-07-ats-analysis.webp` | `screenshots/` |
| 44 | ResumeCraft | `08-my-resumes.webp` | `resumecraft-desktop-08-my-resumes.webp` | `screenshots/` |
| 45 | ResumeCraft | `09-cover-letter.webp` | `resumecraft-desktop-09-cover-letter.webp` | `screenshots/` |
| 46 | ResumeCraft | `10-cover-letter-templates.webp` | `resumecraft-desktop-10-cover-letter-templates.webp` | `screenshots/` |
| 47 | ResumeCraft | `11-khmer-resume.webp` | `resumecraft-desktop-11-khmer-resume.webp` | `screenshots/` |
| 48 | ResumeCraft | `12-pdf-export.webp` | `resumecraft-desktop-12-pdf-export.webp` | `screenshots/` |
| 49 | ResumeCraft | `13-version-history.webp` | `resumecraft-desktop-13-version-history.webp` | `screenshots/` |
| 50 | ResumeCraft | `01-mobile-home.png` | `resumecraft-mobile-01-home.png` | `mobile/` |
| 51 | ResumeCraft | `02-mobile-templates.png` | `resumecraft-mobile-02-templates.png` | `mobile/` |
| 52 | ResumeCraft | `03-mobile-editor.png` | `resumecraft-mobile-03-editor.png` | `mobile/` |
| 53 | ResumeCraft | `04-mobile-preview.png` | `resumecraft-mobile-04-preview.png` | `mobile/` |
| 54 | ResumeCraft | `01-landing-page.png` | `resumecraft-original-01-landing-page.png` | `originals/` |
| 55 | ResumeCraft | `02-template-gallery.png` | `resumecraft-original-02-template-gallery.png` | `originals/` |
| 56 | ResumeCraft | `03-resume-editor.png` | `resumecraft-original-03-resume-editor.png` | `originals/` |
| 57 | ResumeCraft | `04-editor-dark.png` | `resumecraft-original-04-editor-dark.png` | `originals/` |
| 58 | ResumeCraft | `05-customization.png` | `resumecraft-original-05-customization.png` | `originals/` |
| 59 | ResumeCraft | `06-ai-assistant.png` | `resumecraft-original-06-ai-assistant.png` | `originals/` |
| 60 | ResumeCraft | `07-ats-analysis.png` | `resumecraft-original-07-ats-analysis.png` | `originals/` |
| 61 | ResumeCraft | `08-my-resumes.png` | `resumecraft-original-08-my-resumes.png` | `originals/` |
| 62 | ResumeCraft | `09-cover-letter.png` | `resumecraft-original-09-cover-letter.png` | `originals/` |
| 63 | ResumeCraft | `10-cover-letter-templates.png` | `resumecraft-original-10-cover-letter-templates.png` | `originals/` |
| 64 | ResumeCraft | `11-khmer-resume.png` | `resumecraft-original-11-khmer-resume.png` | `originals/` |
| 65 | ResumeCraft | `12-pdf-export.png` | `resumecraft-original-12-pdf-export.png` | `originals/` |
| 66 | ResumeCraft | `13-version-history.png` | `resumecraft-original-13-version-history.png` | `originals/` |
| 67 | ResumeCraft | `resumecraft-cover-dark.png` | `resumecraft-original-cover-dark.png` | `originals/` |
| 68 | ResumeCraft | `resumecraft-cover-light.png` | `resumecraft-original-cover-light.png` | `originals/` |

## 8. Adding a future project

1. Add the project to `portfolio.ts` and its text to the three locale files (`content.projects.<slug>`, including `media.<desktop|mobile>-<NN>-<feature>` captions).
2. Name all media with the project's own prefix (section 1). Put covers in `covers/` and the poster in `demo/` under `src/assets/projects/<dir>/`.
3. Upload screenshots and videos to `portfolio/<slug>/screenshots|mobile|demo` and add an entry to `projectMedia.ts`.

## 9. Verifying (after you provide real values)

Open a project, scroll to the gallery, and in the Network tab check that images come from `res.cloudinary.com` with `f_auto,q_auto`; the MP4 request should appear only after Play. Remote delivery has **not** been tested against real assets yet.
