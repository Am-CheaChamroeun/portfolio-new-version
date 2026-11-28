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

The MP4 and GIF share the stem `{project}-demo`. That is fine on Cloudinary because they are different **resource types** (MP4 = `video`, GIF = `image`). Both use the public ID `{project}-demo`.

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


## 4. Public IDs and URL generation

Your account uses Dynamic folders, so a file's folder is **not** part of its public ID. The public ID is the file name without its extension (e.g. `cashcompass-desktop-01-landing-page`). `projectMedia.ts` stores only these IDs; `src/lib/cloudinary.ts` builds the URLs from `VITE_CLOUDINARY_CLOUD_NAME` (`df3cyznc`). No version numbers (`v123…`) are used, so re-uploading an asset under the same ID updates it.

| Kind | URL the site requests |
| --- | --- |
| Screenshot (desktop / mobile) | `https://res.cloudinary.com/df3cyznc/image/upload/f_auto,q_auto,c_limit,w_{480,960,1600}/<id>` |
| Demo video | `https://res.cloudinary.com/df3cyznc/video/upload/f_auto,q_auto/<id>` |
| GIF preview | `https://res.cloudinary.com/df3cyznc/image/upload/<id>.gif` (no transformations: Cloudinary answered HTTP 400 when `f_auto`/resize was applied to the GIF) |

## 5. Verification result (28 Nov 2026)

**41 of 41 references configured and verified; 0 missing or failed.**

Method: every URL below was opened in your browser pane (the sandbox cannot reach `res.cloudinary.com`). A screenshot/GIF counts as verified when the browser loaded it as an image and reported its pixel size; each MP4 was opened and played. The transformed forms the site actually uses were additionally opened for `cashcompass-desktop-02-dashboard`, `cashcompass-mobile-01-home` and the video `cashcompass-demo`. **Not checked:** HTTP headers and `content-type` values (page scripting returned nothing in this environment), the transformed URLs of the other 37 assets, and the video poster/GIF behaviour for ResumeCraft with transformations. These use the same pattern as the checked ones.

CashCompass: 15 desktop + 5 mobile + 1 MP4 + 1 GIF = 22 verified. ResumeCraft: 13 desktop + 4 mobile + 1 MP4 + 1 GIF = 19 verified.

| # | Project | Public ID | Resource | Verified as | Size |
| --- | --- | --- | --- | --- | --- |
| 1 | cashcompass | `cashcompass-desktop-01-landing-page` | image | `cashcompass-desktop-01-landing-page.webp` | 1920×1200 |
| 2 | cashcompass | `cashcompass-desktop-02-dashboard` | image | `cashcompass-desktop-02-dashboard.webp` | 1920×1200 |
| 3 | cashcompass | `cashcompass-desktop-03-transactions` | image | `cashcompass-desktop-03-transactions.webp` | 1920×1200 |
| 4 | cashcompass | `cashcompass-desktop-04-accounts` | image | `cashcompass-desktop-04-accounts.webp` | 1920×1200 |
| 5 | cashcompass | `cashcompass-desktop-05-budgets` | image | `cashcompass-desktop-05-budgets.webp` | 1920×1200 |
| 6 | cashcompass | `cashcompass-desktop-06-savings-goals` | image | `cashcompass-desktop-06-savings-goals.webp` | 1920×1200 |
| 7 | cashcompass | `cashcompass-desktop-07-analytics` | image | `cashcompass-desktop-07-analytics.webp` | 1920×1200 |
| 8 | cashcompass | `cashcompass-desktop-08-recurring-payments` | image | `cashcompass-desktop-08-recurring-payments.webp` | 1920×1200 |
| 9 | cashcompass | `cashcompass-desktop-09-cash-flow-forecast` | image | `cashcompass-desktop-09-cash-flow-forecast.webp` | 1920×1200 |
| 10 | cashcompass | `cashcompass-desktop-10-financial-calendar` | image | `cashcompass-desktop-10-financial-calendar.webp` | 1920×1200 |
| 11 | cashcompass | `cashcompass-desktop-11-financial-reports` | image | `cashcompass-desktop-11-financial-reports.webp` | 1920×1200 |
| 12 | cashcompass | `cashcompass-desktop-12-notifications` | image | `cashcompass-desktop-12-notifications.webp` | 1920×1200 |
| 13 | cashcompass | `cashcompass-desktop-13-dark-dashboard` | image | `cashcompass-desktop-13-dark-dashboard.webp` | 1920×1200 |
| 14 | cashcompass | `cashcompass-desktop-14-khmer-dashboard` | image | `cashcompass-desktop-14-khmer-dashboard.webp` | 1920×1200 |
| 15 | cashcompass | `cashcompass-desktop-15-pdf-export` | image | `cashcompass-desktop-15-pdf-export.webp` | 1920×1200 |
| 16 | cashcompass | `cashcompass-mobile-01-home` | image | `cashcompass-mobile-01-home.png` | 780×1688 |
| 17 | cashcompass | `cashcompass-mobile-02-dashboard` | image | `cashcompass-mobile-02-dashboard.png` | 780×1688 |
| 18 | cashcompass | `cashcompass-mobile-03-transactions` | image | `cashcompass-mobile-03-transactions.png` | 780×1688 |
| 19 | cashcompass | `cashcompass-mobile-04-budgets` | image | `cashcompass-mobile-04-budgets.png` | 780×1688 |
| 20 | cashcompass | `cashcompass-mobile-05-calendar` | image | `cashcompass-mobile-05-calendar.png` | 780×1688 |
| 21 | cashcompass | `cashcompass-demo` | video | `cashcompass-demo.mp4` | plays |
| 22 | cashcompass | `cashcompass-demo` | image | `cashcompass-demo.gif` | 1120×630 |
| 23 | resumecraft | `resumecraft-desktop-01-landing-page` | image | `resumecraft-desktop-01-landing-page.webp` | 1920×1080 |
| 24 | resumecraft | `resumecraft-desktop-02-template-gallery` | image | `resumecraft-desktop-02-template-gallery.webp` | 1920×1080 |
| 25 | resumecraft | `resumecraft-desktop-03-resume-editor` | image | `resumecraft-desktop-03-resume-editor.webp` | 1920×1080 |
| 26 | resumecraft | `resumecraft-desktop-04-editor-dark` | image | `resumecraft-desktop-04-editor-dark.webp` | 1920×1080 |
| 27 | resumecraft | `resumecraft-desktop-05-customization` | image | `resumecraft-desktop-05-customization.webp` | 1920×1080 |
| 28 | resumecraft | `resumecraft-desktop-06-ai-assistant` | image | `resumecraft-desktop-06-ai-assistant.webp` | 1920×1080 |
| 29 | resumecraft | `resumecraft-desktop-07-ats-analysis` | image | `resumecraft-desktop-07-ats-analysis.webp` | 1920×1080 |
| 30 | resumecraft | `resumecraft-desktop-08-my-resumes` | image | `resumecraft-desktop-08-my-resumes.webp` | 1920×1080 |
| 31 | resumecraft | `resumecraft-desktop-09-cover-letter` | image | `resumecraft-desktop-09-cover-letter.webp` | 1920×1080 |
| 32 | resumecraft | `resumecraft-desktop-10-cover-letter-templates` | image | `resumecraft-desktop-10-cover-letter-templates.webp` | 1920×1080 |
| 33 | resumecraft | `resumecraft-desktop-11-khmer-resume` | image | `resumecraft-desktop-11-khmer-resume.webp` | 1920×1080 |
| 34 | resumecraft | `resumecraft-desktop-12-pdf-export` | image | `resumecraft-desktop-12-pdf-export.webp` | 1920×1080 |
| 35 | resumecraft | `resumecraft-desktop-13-version-history` | image | `resumecraft-desktop-13-version-history.webp` | 1920×1080 |
| 36 | resumecraft | `resumecraft-mobile-01-home` | image | `resumecraft-mobile-01-home.png` | 780×1688 |
| 37 | resumecraft | `resumecraft-mobile-02-templates` | image | `resumecraft-mobile-02-templates.png` | 780×1688 |
| 38 | resumecraft | `resumecraft-mobile-03-editor` | image | `resumecraft-mobile-03-editor.png` | 780×1688 |
| 39 | resumecraft | `resumecraft-mobile-04-preview` | image | `resumecraft-mobile-04-preview.png` | 780×1688 |
| 40 | resumecraft | `resumecraft-demo` | video | `resumecraft-demo.mp4` | plays, 0:44 |
| 41 | resumecraft | `resumecraft-demo` | image | `resumecraft-demo.gif` | 1120×630 |

Duplicate references: none (each ID is used once; the MP4 and GIF of a project share an ID but live in different resource types, `video` and `image`).

## 6. Local files (final structure)

```
src/assets/projects/
  cash-compass/  covers/ (cashcompass-cover-dark.webp, cashcompass-cover-light.webp, cashcompass-cover.png)
                 demo/ (cashcompass-demo-poster.webp)   PORTFOLIO.md
  resume-craft/  covers/ (resumecraft-…)   demo/ (resumecraft-demo-poster.webp)   PORTFOLIO.md
```

Covers and posters stay local so the first view needs no extra network request. Screenshots, mobile screenshots, MP4 and GIF have no local copies.

## 7. Adding a future project

1. Add the project to `portfolio.ts` and its text to the three locale files (`content.projects.<slug>`, including `media.<desktop|mobile>-<NN>-<feature>` captions).
2. Name every file with the project's own prefix (section 1): `{project}-desktop-NN-feature.webp`, `{project}-mobile-NN-feature.png`, `{project}-demo.mp4`, `{project}-demo.gif`. Put covers in `covers/` and the poster in `demo/` under `src/assets/projects/<dir>/`.
3. Upload the screenshots, MP4 and GIF to Cloudinary with those exact names (public ID = name without extension).
4. Add one entry to `configs` in `src/data/projectMedia.ts` with the IDs, then open each URL once to confirm it loads.

## 8. If something looks wrong

Open the project, scroll to the gallery, and in the Network tab check that images come from `res.cloudinary.com` with `f_auto,q_auto`; the MP4 request should appear only after pressing play. A missing asset shows a small "unavailable" tile instead of breaking the page.
