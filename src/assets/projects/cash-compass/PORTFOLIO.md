# CashCompass: portfolio kit

Everything needed to add CashCompass to a developer portfolio. Paths are relative to this folder
(`docs/portfolio/`).

[Before you publish](#before-you-publish) · [Project facts](#project-facts) ·
[Descriptions](#descriptions) · [Case study](#case-study) · [Features](#main-features) ·
[Technology](#technology-stack) · [Three languages](#descriptions-in-three-languages) ·
[Integration](#adding-it-to-the-portfolio) · [Gallery](#recommended-gallery) ·
[Media index](#media-index) · [How these files were made](#how-these-files-were-made)

> **File names:** every media file starts with the project prefix `cashcompass-` (`cashcompass-desktop-NN-feature.webp`, `cashcompass-mobile-NN-feature.png`, `cashcompass-original-…`, `cashcompass-demo.mp4`, …) so Cloudinary public IDs are unique across projects. Standard and full old-to-new mapping: `docs/CLOUDINARY_MEDIA.md`. Screenshots, mobile images, the video, GIF and originals are no longer imported by the portfolio (covers and posters are); the code snippets below that copy images into `public/` are historical.

## Before you publish

- **Account mode has never run against a real Supabase project.** Sign-up, sign-in, file storage and
  account data requests are unverified. The demo, the unit tests and the database migrations (on
  plain PostgreSQL) have been checked locally. Test account mode before you present it as working.
- **Live URL:** not deployed. Add it after you deploy.
- **Khmer and Chinese text below:** have a fluent reader check it. The app's own Khmer wording also
  needs a native review.
- **"My role" lines:** edit them so they describe your own part accurately.

## Project facts

| Field     | Value                                              |
| --------- | -------------------------------------------------- |
| Name      | CashCompass                                        |
| Slug      | `cashcompass`                                      |
| Tagline   | Navigate your money with confidence.               |
| Category  | `fullstack` (personal finance web app)             |
| Accent    | `#5cb5a0` (on dark pages), `#176b5b` (on light)    |
| GitHub    | https://github.com/Am-CheaChamroeun/cash-compass   |
| Live URL  | _placeholder: add after deployment_                |
| Image fit | `cover`                                            |
| Cover     | `covers/cashcompass-cover-dark.webp` (recommended) |

The dark cover suits a graphite portfolio and survives a 16:10 thumbnail crop. Use
`covers/cashcompass-cover-light.webp` on a light page. `covers/cashcompass-cover.png` is a PNG copy
of the dark cover.

## Descriptions

### Short

A personal finance web app that brings accounts, spending, budgets, savings goals and recurring
payments into one view, forecasts what is coming next and exports PDF reports, in English and Khmer.

### Detailed

CashCompass answers three questions: where your money is, where it went and what is coming next. It
brings cash, bank, savings, credit card and digital wallet accounts together, records income,
expenses and transfers, and tracks monthly budgets, savings goals and recurring payments. A calendar
and a 30, 60 or 90 day forecast show upcoming entries and the projected balance, and monthly, yearly
or custom reports download as PDF. The interface works in English and Khmer and handles seven
currencies, including US dollars and riel, converted with dated exchange rates that the user enters.
Every screen can be tried in a demo that runs on fictional data in the browser. Account mode is built
on Supabase with Row Level Security. Insights and forecasts are plain arithmetic over the user's own
records, with no AI model and no outside service.

## Case study

### Objectives

- Show where money is, where it went and what is coming, in one calm interface.
- Keep financial results exact, including across currencies and over time.
- Keep each person's records private, and let anyone try the product without signing up.

### Problem

Money spread over cash, banks, cards and wallets, often in two currencies, is hard to follow. Simple
trackers show past spending but not upcoming payments, and converting old amounts at today's rate
changes history.

### Solution

A web app that records every movement once, calculates balances from those records, converts each
amount with the rate in force on its date and projects future balances from scheduled payments. A
browser-only demo uses the same rules as account mode.

### My role

- Application design and development with Nuxt, Vue and TypeScript
- Financial rules: balances, currencies, budgets, forecasting and PDF reports
- Supabase schema, Row Level Security and server API routes

### Architecture

Nuxt 4 with Vue 3 and a Pinia store. Screens talk to one repository interface with two
implementations: browser storage for the demo, and Nitro API routes for signed-in use. Each route
checks the session, validates input with Zod and queries Supabase with the signed-in user's own
client, so PostgreSQL Row Level Security enforces ownership and no service-role key is used.
Calculations and validation live in a shared folder used by the browser, the server and the tests.
Charts use ECharts, and PDF reports are created in the browser.

```text
Browser (Vue screens, Pinia store)
        |
FinanceRepository
        |-- demo mode ----> localStorage
        '-- account mode -> Nitro API: session -> Zod -> service
                              -> Supabase: PostgreSQL + RLS, Auth, private Storage
shared/  financial rules and schemas used by the browser, the server and the tests
```

### Challenges and solutions

| Challenge                                          | Solution                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Floating-point numbers distort money               | Store `numeric(19,4)` and calculate decimal strings with Big.js                               |
| A new exchange rate would rewrite past results     | Give rates a start date and convert each entry with the rate in force on its own date         |
| Recurring payments could be recorded twice         | Lock the schedule, compare its next date and allow each occurrence once with a unique index   |
| One user's record could point at another's account | Composite foreign keys that include `user_id`, Row Level Security and database triggers       |
| Khmer text breaks in common browser PDF libraries  | Shape text with HarfBuzz and write the PDF with a small in-browser writer                     |
| Demo and account mode could drift apart            | One repository interface and one set of shared rules                                          |
| An offline cache could keep private data           | The service worker stores only an offline page and icons, never pages, API responses or money |

## Main features

- Overview with net balance history, cash flow, savings rate, spending by category and written insights
- Income, expenses and transfers with receipts, search, filters, and CSV import and export
- Cash, bank, savings, credit card and wallet accounts, with assets and liabilities kept apart
- Overall and category budgets, savings goals and recurring payments
- Financial calendar and a 30, 60 or 90 day cash flow forecast
- Analytics, and monthly, yearly or custom reports with PDF download
- In-app notifications for upcoming payments, budgets, goals and projected shortfalls
- Seven currencies with dated, manually entered exchange rates
- English and Khmer, light and dark themes, phone layouts, installable web app
- Demo mode with fictional data and no sign-up

## Technical highlights

- Strict TypeScript across the interface, server and shared rules
- Row Level Security on every table, with the user identity taken from the session
- Zod validation shared by the browser and the server
- Client-side PDF reports with correct Khmer shaping
- Unit tests with Vitest and database checks for ownership and integrity

## Technology stack

| Name in portfolio data | Logo (`simple-icons`) | In the portfolio's registry today |
| ---------------------- | --------------------- | --------------------------------- |
| `Nuxt.js`              | `siNuxt`              | Yes                               |
| `Vue`                  | `siVuedotjs`          | Yes                               |
| `TypeScript`           | `siTypescript`        | Yes                               |
| `Supabase`             | `siSupabase`          | Yes                               |
| `PostgreSQL`           | `siPostgresql`        | Yes                               |
| `Tailwind`             | `siTailwindcss`       | Yes                               |
| `Node.js`              | `siNodedotjs`         | Yes                               |
| `Pinia`                | `siPinia`             | Yes                               |
| `ECharts`              | `siApacheecharts`     | No (optional step 4)              |
| `Zod`                  | `siZod`               | No (optional step 4)              |
| `Vitest`               | `siVitest`            | Yes                               |
| `PWA`                  | `siPwa`               | Yes                               |

Also used: Nitro, Nuxt UI, the Nuxt i18n module, VueUse, date-fns, Big.js and HarfBuzz.

## Descriptions in three languages

### English

- **Tagline:** Navigate your money with confidence.
- **Short:** A personal finance web app that brings accounts, spending, budgets, savings goals and recurring payments into one view, forecasts what is coming next and exports PDF reports, in English and Khmer.
- **Detailed:** CashCompass answers three questions: where your money is, where it went and what is coming next. It brings accounts together, records income, expenses and transfers, and tracks budgets, savings goals and recurring payments. A calendar and a 30 to 90 day forecast show upcoming entries and the projected balance, and reports download as PDF. It works in English and Khmer with seven currencies. A demo runs on fictional data in the browser, and account mode is built on Supabase with Row Level Security.

### Khmer

- **Tagline:** គ្រប់គ្រងប្រាក់របស់អ្នកដោយទំនុកចិត្ត។
- **Short:** កម្មវិធីវែបគ្រប់គ្រងហិរញ្ញវត្ថុផ្ទាល់ខ្លួន ដែលប្រមូលគណនី ចំណាយ ថវិកា គោលដៅសន្សំ និងការទូទាត់ប្រចាំមកកន្លែងតែមួយ ព្យាករអ្វីដែលនឹងមកដល់ និងនាំចេញរបាយការណ៍ PDF ជាភាសាអង់គ្លេស និងខ្មែរ។
- **Detailed:** CashCompass ឆ្លើយសំណួរបី៖ ប្រាក់របស់អ្នកនៅឯណា វាបានចាយទៅណា និងអ្វីនឹងមកដល់បន្ទាប់។ កម្មវិធីប្រមូលគណនីទាំងអស់ កត់ត្រាចំណូល ចំណាយ និងការផ្ទេរប្រាក់ ហើយតាមដានថវិកា គោលដៅសន្សំ និងការទូទាត់ប្រចាំ។ ប្រតិទិន និងការព្យាករពី ៣០ ទៅ ៩០ ថ្ងៃ បង្ហាញប្រតិបត្តិការខាងមុខ និងសមតុល្យដែលរំពឹងទុក ហើយរបាយការណ៍អាចទាញយកជា PDF។ កម្មវិធីដំណើរការជាភាសាអង់គ្លេស និងខ្មែរ ជាមួយរូបិយប័ណ្ណ ៧ ប្រភេទ។ កំណែសាកល្បងប្រើទិន្នន័យប្រឌិតក្នុងកម្មវិធីរុករក ហើយរបៀបប្រើគណនីត្រូវបានបង្កើតលើ Supabase ជាមួយ Row Level Security។

### 简体中文

- **Tagline:** 从容掌握你的资金动向。
- **Short:** 一款个人财务网页应用，将账户、支出、预算、储蓄目标和周期性付款集中在同一视图中，预测即将发生的收支，并导出 PDF 报告，支持英语和高棉语。
- **Detailed:** CashCompass 回答三个问题：钱在哪里、花到了哪里、接下来会发生什么。它汇总各类账户，记录收入、支出和转账，并跟踪预算、储蓄目标和周期性付款。日历和 30 至 90 天的现金流预测展示即将发生的款项与预计余额，报告可下载为 PDF。应用支持英语和高棉语以及七种货币。演示模式使用浏览器中的虚构数据运行，账户模式基于 Supabase 和行级安全策略（RLS）构建。

## Adding it to the portfolio

These steps match the structure of
[my-portfolio](https://github.com/AmCheachamroeun-Portfolio/my-portfolio). Steps 1 to 4 were tried on a temporary copy of it (commit `9f956a0`): the
copy built, and the CashCompass project page opened with the cover.

1. Copy the files from `covers/` and `screenshots/` into `public/projects/cashcompass/` in the
   portfolio.
2. Add this object to `src/data/portfolio.ts`, as `featuredProject` or inside `projects`.

```ts
const cashcompassMedia = '/projects/cashcompass'

const cashcompass: Project = {
  name: 'CashCompass',
  slug: 'cashcompass',
  // The card shows the first four.
  tech: [
    'Nuxt.js',
    'Vue',
    'TypeScript',
    'Supabase',
    'PostgreSQL',
    'Tailwind',
    'Node.js',
    'Pinia',
    'ECharts',
    'Zod',
    'Vitest',
    'PWA',
  ],
  accent: '#5cb5a0',
  category: 'fullstack',
  repoUrl: 'https://github.com/Am-CheaChamroeun/cash-compass',
  liveUrl: '', // placeholder: add the live demo URL after deployment
  image: `${cashcompassMedia}/cashcompass-cover-dark.webp`,
  imageFit: 'cover',
  // The first image is also the large picture at the top of the case study.
  gallery: [
    'cashcompass-cover-dark',
    'cashcompass-desktop-02-dashboard',
    'cashcompass-desktop-09-cash-flow-forecast',
    'cashcompass-desktop-03-transactions',
    'cashcompass-desktop-05-budgets',
    'cashcompass-desktop-10-financial-calendar',
    'cashcompass-desktop-11-financial-reports',
    'cashcompass-desktop-14-khmer-dashboard',
  ].map((file) => `${cashcompassMedia}/${file}.webp`),
}
```

If you add it inside `projects`, declare the object above that list and write `cashcompass,` as an
entry.

3. Add the text under `content.projects.cashcompass` in `src/i18n/locales/en.json`, `km.json` and
   `zh-CN.json`. Remove the placeholder entry you replace. To show the detailed description on the
   case-study page, paste the **Detailed** text above into `description`.

<details>
<summary><strong>en.json</strong></summary>

```json
"cashcompass": {
  "tagline": "Navigate your money with confidence.",
  "description": "A personal finance web app that brings accounts, spending, budgets, savings goals and recurring payments into one view, forecasts what is coming next and exports PDF reports, in English and Khmer.",
  "highlights": [
    "Budgets, savings goals and recurring payments",
    "30 to 90 day cash flow forecast and calendar",
    "Seven currencies, English and Khmer, PDF reports"
  ],
  "study": {
    "objectives": [
      "Show where money is, where it went and what is coming",
      "Keep results exact across currencies and over time",
      "Keep records private and let anyone try the app without signing up"
    ],
    "problem": "Money spread over cash, banks, cards and wallets in two currencies is hard to follow, simple trackers do not show upcoming payments, and converting old amounts at today's rate changes history.",
    "solution": "A web app that records every movement once, calculates balances from those records, converts each amount with the rate for its date and projects future balances from scheduled payments.",
    "role": [
      "Application design and development with Nuxt, Vue and TypeScript",
      "Financial rules, forecasting and PDF reports",
      "Supabase schema, Row Level Security and server API routes"
    ],
    "architecture": "Nuxt, Vue and Pinia with one repository interface for the browser demo and the account API. Nitro routes check the session, validate input with Zod and use the signed-in user's Supabase client, so Row Level Security enforces ownership. Financial rules are shared by browser, server and tests.",
    "challenges": [
      "Exact money: decimal arithmetic instead of floating point",
      "Rate history: convert each entry with the rate for its date",
      "Recurring payments: database locking and unique occurrences",
      "Khmer PDF output: HarfBuzz text shaping in the browser"
    ]
  }
}
```

</details>

<details>
<summary><strong>km.json</strong></summary>

```json
"cashcompass": {
  "tagline": "គ្រប់គ្រងប្រាក់របស់អ្នកដោយទំនុកចិត្ត។",
  "description": "កម្មវិធីវែបគ្រប់គ្រងហិរញ្ញវត្ថុផ្ទាល់ខ្លួន ដែលប្រមូលគណនី ចំណាយ ថវិកា គោលដៅសន្សំ និងការទូទាត់ប្រចាំមកកន្លែងតែមួយ ព្យាករអ្វីដែលនឹងមកដល់ និងនាំចេញរបាយការណ៍ PDF ជាភាសាអង់គ្លេស និងខ្មែរ។",
  "highlights": [
    "ថវិកា គោលដៅសន្សំ និងការទូទាត់ប្រចាំ",
    "ការព្យាករលំហូរសាច់ប្រាក់ ៣០ ដល់ ៩០ ថ្ងៃ និងប្រតិទិន",
    "រូបិយប័ណ្ណ ៧ ប្រភេទ ភាសាអង់គ្លេស និងខ្មែរ ព្រមទាំងរបាយការណ៍ PDF"
  ],
  "study": {
    "objectives": [
      "បង្ហាញថាប្រាក់នៅឯណា បានចាយទៅណា និងអ្វីនឹងមកដល់",
      "រក្សាលទ្ធផលឱ្យត្រឹមត្រូវ ទាំងរវាងរូបិយប័ណ្ណ និងតាមពេលវេលា",
      "រក្សាកំណត់ត្រាជាឯកជន ហើយអនុញ្ញាតឱ្យសាកល្បងកម្មវិធីដោយមិនចាំបាច់ចុះឈ្មោះ"
    ],
    "problem": "ប្រាក់ដែលនៅរាយប៉ាយក្នុងសាច់ប្រាក់ ធនាគារ កាត និងកាបូបឌីជីថល ជាពីររូបិយប័ណ្ណ ពិបាកតាមដាន កម្មវិធីសាមញ្ញមិនបង្ហាញការទូទាត់ខាងមុខ ហើយការបម្លែងចំនួនចាស់ដោយអត្រាថ្ងៃនេះធ្វើឱ្យប្រវត្តិប្រែប្រួល។",
    "solution": "កម្មវិធីវែបដែលកត់ត្រាចលនាប្រាក់នីមួយៗតែម្តង គណនាសមតុល្យពីកំណត់ត្រា បម្លែងចំនួននីមួយៗតាមអត្រានៃកាលបរិច្ឆេទរបស់វា និងព្យាករសមតុល្យអនាគតពីការទូទាត់ដែលបានកំណត់ពេល។",
    "role": [
      "រចនា និងអភិវឌ្ឍកម្មវិធីដោយ Nuxt, Vue និង TypeScript",
      "ក្បួនហិរញ្ញវត្ថុ ការព្យាករ និងរបាយការណ៍ PDF",
      "រចនាសម្ព័ន្ធទិន្នន័យ Supabase, Row Level Security និងផ្លូវ API លើម៉ាស៊ីនមេ"
    ],
    "architecture": "ប្រើ Nuxt, Vue និង Pinia ដោយមានចំណុចប្រទាក់ឃ្លាំងទិន្នន័យតែមួយ សម្រាប់ទាំងកំណែសាកល្បងក្នុងកម្មវិធីរុករក និង API គណនី។ ផ្លូវ Nitro ពិនិត្យវគ្គចូលប្រើ ផ្ទៀងផ្ទាត់ទិន្នន័យដោយ Zod ហើយប្រើ Supabase ក្នុងនាមអ្នកប្រើដែលបានចូល ដូច្នេះ Row Level Security ការពារភាពជាម្ចាស់ទិន្នន័យ។ ក្បួនហិរញ្ញវត្ថុត្រូវបានប្រើរួមដោយកម្មវិធីរុករក ម៉ាស៊ីនមេ និងការធ្វើតេស្ត។",
    "challenges": [
      "ចំនួនប្រាក់ត្រឹមត្រូវ៖ គណនាលេខទសភាគពិតប្រាកដ ជំនួសឱ្យ floating point",
      "ប្រវត្តិអត្រាប្តូរប្រាក់៖ បម្លែងប្រតិបត្តិការនីមួយៗតាមអត្រានៃថ្ងៃរបស់វា",
      "ការទូទាត់ប្រចាំ៖ ចាក់សោក្នុងមូលដ្ឋានទិន្នន័យ ដើម្បីកត់ត្រាតែម្តង",
      "PDF អក្សរខ្មែរ៖ រៀបអក្សរដោយ HarfBuzz ក្នុងកម្មវិធីរុករក"
    ]
  }
}
```

</details>

<details>
<summary><strong>zh-CN.json</strong></summary>

```json
"cashcompass": {
  "tagline": "从容掌握你的资金动向。",
  "description": "一款个人财务网页应用，将账户、支出、预算、储蓄目标和周期性付款集中在同一视图中，预测即将发生的收支，并导出 PDF 报告，支持英语和高棉语。",
  "highlights": [
    "预算、储蓄目标与周期性付款",
    "30 至 90 天现金流预测与财务日历",
    "七种货币、英语和高棉语、PDF 报告"
  ],
  "study": {
    "objectives": [
      "清楚呈现钱在哪里、花到了哪里、接下来会发生什么",
      "跨货币、跨时间保持计算结果准确",
      "保护记录隐私，并让任何人无需注册即可试用"
    ],
    "problem": "资金分散在现金、银行、银行卡和电子钱包中，且常涉及两种货币，难以追踪；简单的记账工具不显示即将到来的付款，而按当前汇率换算旧金额会改变历史数据。",
    "solution": "一款网页应用：每笔资金变动只记录一次，余额由记录计算得出，每笔金额按其日期对应的汇率换算，并根据计划付款预测未来余额。",
    "role": [
      "使用 Nuxt、Vue 和 TypeScript 设计与开发应用",
      "财务计算规则、预测与 PDF 报告",
      "Supabase 数据结构、行级安全策略与服务端接口"
    ],
    "architecture": "基于 Nuxt、Vue 和 Pinia，浏览器演示与账户接口共用同一个数据仓库接口。Nitro 接口校验会话，用 Zod 验证输入，并以登录用户身份访问 Supabase，由行级安全策略保证数据归属。财务规则由浏览器、服务器和测试共同使用。",
    "challenges": [
      "金额精度：使用十进制运算代替浮点数",
      "汇率历史：每笔记录按当日汇率换算",
      "周期性付款：通过数据库加锁和唯一约束避免重复记录",
      "高棉语 PDF：在浏览器中使用 HarfBuzz 进行文字排版"
    ]
  }
}
```

</details>

4. Optional: give ECharts and Zod their logos in `src/lib/tech.ts`. Import `siApacheecharts` and
   `siZod` from `simple-icons`, then add `echarts: siApacheecharts,` and `zod: siZod,` to
   `techIcons`.

### How the current portfolio code treats it

- Card thumbnails and the gallery are cropped to 16:10, which the desktop screenshots already match.
  The case-study hero is 16:9, the cover's own shape. In 16:10 views the covers lose about 80 pixels
  at each side, and their content stays inside that area.
- The case study groups technologies it does not recognise under "infrastructure" (`layerOf` in
  `CaseStudy.tsx`). Here that means Pinia, ECharts, Zod, Vitest and PWA.
- The `Project` type has no video field, so the demo files are not part of the object above. See
  [Showing the demo](#showing-the-demo).
- Phone screenshots are portrait and would be cropped heavily, so they are left out of the gallery.

### Showing the demo

Showing the video needs a small portfolio change. Until then, link to the file in the repository or
upload it to a video host. One way to add it (not applied or tested in the portfolio):

1. Copy the three files in `demo/` to `public/projects/cashcompass/`.
2. Add `video?: string` and `videoPoster?: string` to the `Project` type, then set them to
   `/projects/cashcompass/cashcompass-demo.mp4` and
   `/projects/cashcompass/cashcompass-demo-poster.webp`.
3. In `CaseStudy.tsx`, render this above the gallery when `project.video` is set:

```tsx
<video
  className="aspect-video w-full rounded-xl border border-card-border"
  src={project.video}
  poster={project.videoPoster}
  controls
  muted
  playsInline
  preload="none"
/>
```

## Recommended gallery

Eight images, in display order. The first is the recommended primary cover.

| #   | File                                     | Caption                                          |
| --- | ---------------------------------------- | ------------------------------------------------ |
| 1   | `covers/cashcompass-cover-dark.webp`     | CashCompass: navigate your money with confidence |
| 2   | `screenshots/cashcompass-desktop-02-dashboard.webp`          | Balance, cash flow and insights at a glance      |
| 3   | `screenshots/cashcompass-desktop-09-cash-flow-forecast.webp` | Recorded history and projected balance           |
| 4   | `screenshots/cashcompass-desktop-03-transactions.webp`       | Income, expenses and transfers across accounts   |
| 5   | `screenshots/cashcompass-desktop-05-budgets.webp`            | Overall and category budgets with clear status   |
| 6   | `screenshots/cashcompass-desktop-10-financial-calendar.webp` | Recorded and upcoming items by date              |
| 7   | `screenshots/cashcompass-desktop-11-financial-reports.webp`  | Period reports with PDF download                 |
| 8   | `screenshots/cashcompass-desktop-14-khmer-dashboard.webp`    | The same dashboard in Khmer                      |

## Media index

### Covers

| File                                  | Dimensions | Size   |
| ------------------------------------- | ---------- | ------ |
| `covers/cashcompass-cover-dark.webp`  | 1600×900   | 81 KB  |
| `covers/cashcompass-cover-light.webp` | 1600×900   | 83 KB  |
| `covers/cashcompass-cover.png`        | 1600×900   | 462 KB |

### Desktop screenshots

| File                                     | Dimensions | Size   |
| ---------------------------------------- | ---------- | ------ |
| `screenshots/cashcompass-desktop-01-landing-page.webp`       | 1920×1200  | 72 KB  |
| `screenshots/cashcompass-desktop-02-dashboard.webp`          | 1920×1200  | 105 KB |
| `screenshots/cashcompass-desktop-03-transactions.webp`       | 1920×1200  | 107 KB |
| `screenshots/cashcompass-desktop-04-accounts.webp`           | 1920×1200  | 60 KB  |
| `screenshots/cashcompass-desktop-05-budgets.webp`            | 1920×1200  | 84 KB  |
| `screenshots/cashcompass-desktop-06-savings-goals.webp`      | 1920×1200  | 86 KB  |
| `screenshots/cashcompass-desktop-07-analytics.webp`          | 1920×1200  | 79 KB  |
| `screenshots/cashcompass-desktop-08-recurring-payments.webp` | 1920×1200  | 100 KB |
| `screenshots/cashcompass-desktop-09-cash-flow-forecast.webp` | 1920×1200  | 104 KB |
| `screenshots/cashcompass-desktop-10-financial-calendar.webp` | 1920×1200  | 97 KB  |
| `screenshots/cashcompass-desktop-11-financial-reports.webp`  | 1920×1200  | 81 KB  |
| `screenshots/cashcompass-desktop-12-notifications.webp`      | 1920×1200  | 78 KB  |
| `screenshots/cashcompass-desktop-13-dark-dashboard.webp`     | 1920×1200  | 103 KB |
| `screenshots/cashcompass-desktop-14-khmer-dashboard.webp`    | 1920×1200  | 105 KB |
| `screenshots/cashcompass-desktop-15-pdf-export.webp`         | 1920×1200  | 115 KB |

### Mobile screenshots

| File                                | Dimensions | Size   |
| ----------------------------------- | ---------- | ------ |
| `mobile/cashcompass-mobile-01-home.png`         | 780×1688   | 187 KB |
| `mobile/cashcompass-mobile-02-dashboard.png`    | 780×1688   | 176 KB |
| `mobile/cashcompass-mobile-03-transactions.png` | 780×1688   | 195 KB |
| `mobile/cashcompass-mobile-04-budgets.png`      | 780×1688   | 201 KB |
| `mobile/cashcompass-mobile-05-calendar.png`     | 780×1688   | 168 KB |

### Demo video, GIF and poster

| File                                | Dimensions | Size    | Notes                         |
| ----------------------------------- | ---------- | ------- | ----------------------------- |
| `demo/cashcompass-demo-poster.webp` | 1920×1080  | 98 KB   | Still image                   |
| `demo/cashcompass-demo.gif`         | 1120×630   | 992 KB  | 12 fps, 8.5 s, looping        |
| `demo/cashcompass-demo.mp4`         | 1920×1080  | 2.22 MB | 30 fps, 38.6 s, H.264, silent |

The video walks through the dashboard, adding a transaction, budgets, the forecast (30 to 90 days),
the calendar, and the PDF report download, ending on the exported pages. The GIF shows three moments
from it: the balance chart, adding a transaction and the forecast.

### Originals

`originals/` holds lossless PNG captures of the 15 desktop images (2880×1800) and the light cover
(1600×900). The PNG of the dark cover is `covers/cashcompass-cover.png`. Phone captures in `mobile/`
are already lossless.

16 files, 7.08 MB in total. All media in this folder: 13.23 MB.

## How these files were made

- Captured from the production build running locally, in demo mode, with Chrome driven by
  Playwright. The person ("Alex Rivera"), accounts and every amount are fictional. Dates are relative
  to the capture day, 27 November 2026.
- Desktop screenshots: 1440×900 viewport at 2× scale, then resized to 1920×1200 WebP (quality 90).
- Phone screenshots: 390×844 viewport at 2× scale, saved as PNG.
- `cashcompass-desktop-15-pdf-export` is not an app screen. It is the three pages of a PDF that the app exported, laid
  out on a plain background.
- Covers: a layout made of real captures, the logo and the Geist typeface. The dark cover uses the
  dark dashboard and a dark phone capture.
- Video: one continuous recording of real interactions at 1920×1080 (1440×810 viewport), with the
  start trimmed. A pointer and click ripple were added so movements are visible. It fades in and out,
  and crossfades to the exported PDF pages at the end. There is no sound.
- The poster is a capture of the video's opening view, without the pointer.
