# Production setup guide

Everything below is free. Nothing here is switched on for you: each step needs your own account or dashboard.
Replace the values in `<angle brackets>` with your own. Never paste real tokens into this file or into Git.

Production URL: <https://amcheachamroeun.vercel.app>

## 1. Google Search Console (ownership + indexing)

1. Go to <https://search.google.com/search-console> and sign in with your Google account.
2. Choose **Add property → URL prefix** and enter `https://amcheachamroeun.vercel.app/` (a `*.vercel.app` subdomain can only be verified with the URL-prefix method).
3. Pick the **HTML tag** verification method. Google shows `<meta name="google-site-verification" content="<TOKEN>" />`. Copy only the `<TOKEN>` part.
4. In Vercel: **Project → Settings → Environment Variables**, add `VITE_GOOGLE_SITE_VERIFICATION` = `<TOKEN>` for Production. Locally you can put it in `.env.local`.
5. **Redeploy** (Deployments → ⋯ → Redeploy). The tag is written into the static HTML at build time, so it is present without running JavaScript. Check it: open the site, **View Source**, search for `google-site-verification`.
6. Back in Search Console press **Verify**. (Alternative: download Google's `google<…>.html` file and put it in `public/`, then redeploy.)
7. **Sitemaps → Add a new sitemap**: enter `sitemap.xml` and Submit.
8. **URL Inspection**: paste `https://amcheachamroeun.vercel.app/` → **Request indexing**.
9. Check progress later under **Pages** (indexing status) and **Sitemaps**. Indexing can take days; it is not instant or guaranteed.

## 2. Vercel Web Analytics

1. Vercel dashboard → this project → **Analytics** tab → **Enable**. (Hobby plan: free allowance with limits on events and history.)
2. Redeploy if Vercel asks. The code (`src/components/Telemetry.tsx`) is already in place and only runs on the deployed site.
3. Visit the live site, then check the Analytics tab; data can take a few minutes to appear. If you use an ad blocker, disable it for the test.

## 3. Vercel Speed Insights

1. Vercel dashboard → this project (only this one) → **Speed Insights** tab → **Enable**.
2. Redeploy if asked, then browse the live site. Real-user data needs real visits and takes time to build up; it is different from Lighthouse's lab score.

## 4. Web3Forms (contact form)

Set `VITE_WEB3FORMS_ACCESS_KEY` in Vercel (Production + Preview) and in `.env.local`, then redeploy. In the Web3Forms dashboard restrict the key to your domain. It is a public key by design. Spam protection in place: a hidden honeypot field, Web3Forms' own filtering, input length limits and duplicate-submit prevention. These reduce spam but are not a guarantee. If spam still arrives, Web3Forms documents optional free CAPTCHA integrations (check their current docs for what your plan includes); adding one would also need its script host added to the CSP in `vercel.json`.

## 5. GitHub security settings (repository → Settings)

I cannot change these for you. In the repository on GitHub:

1. **Settings → Advanced Security** (or **Code security**): enable **Dependency graph**, **Dependabot alerts**, **Dependabot security updates**, **Secret scanning** and **Push protection**. These are free for public repositories.
2. **Code scanning**: the workflow `.github/workflows/codeql.yml` runs CodeQL; results appear under **Security → Code scanning** after the first run.
3. `.github/dependabot.yml` groups weekly minor/patch updates into one pull request. Review and merge them yourself; nothing merges automatically.
4. `.github/workflows/ci.yml` runs lint, type check, unit tests, build, end-to-end tests and `npm audit` with read-only permissions.
5. Optional: protect `main` (Settings → Branches) so CI must pass before merging.

If the repository is inside an organisation, an owner may need to enable some of these.

## 6. Optional free monitoring (nothing is installed by the portfolio)

* **UptimeRobot** (<https://uptimerobot.com>, free plan): create a monitor of type **HTTPS**, URL `https://amcheachamroeun.vercel.app/`, interval 5 minutes, and add your email as the alert contact.
* **Bing Webmaster Tools** (<https://www.bing.com/webmasters>): add the site (you can import it from Search Console), verify, then submit `https://amcheachamroeun.vercel.app/sitemap.xml`. If you choose Bing's meta-tag method, the tag would need to be added to the prerender step; the import-from-Google route avoids that.
* **Google PageSpeed Insights** (<https://pagespeed.web.dev>): enter the production URL; check both Mobile and Desktop. The top section is real-user data when available; the Lighthouse section is a lab test.
* **Security Headers** (<https://securityheaders.com>): scan the production URL.
* **Mozilla HTTP Observatory** (<https://developer.mozilla.org/en-US/observatory>): scan the production host.

## 7. Production checks after each deploy

Security: open the site with the browser console open and click through every app. A message such as "Refused to load … Content Security Policy" means the policy in `vercel.json` needs that host added. To trial a stricter or changed policy safely, temporarily rename the header key to `Content-Security-Policy-Report-Only` (it then only reports, never blocks).
Performance: run PageSpeed Insights (mobile + desktop) and compare with the previous run; look at LCP, INP and CLS.
SEO: View Source on `/`, `/projects/cashcompass` and `/projects/resumecraft` for the title, description, canonical, Open Graph and JSON-LD; test sharing the link in a chat app; validate structured data with Google's Rich Results Test or <https://validator.schema.org>.
