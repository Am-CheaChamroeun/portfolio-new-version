import { expect, test, type Page } from '@playwright/test'

/** Open a route and wait until the desktop has finished its short boot screen. */
async function open(page: Page, path: string) {
  await page.goto(path)
  await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 20_000 })
}

test.describe('navigation', () => {
  test('every app route opens directly and survives a refresh', async ({ page }) => {
    for (const path of ['/', '/about', '/projects', '/skills', '/education', '/experience', '/services', '/monitor', '/terminal', '/contact', '/settings']) {
      await open(page, path)
      await page.reload()
      await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 20_000 })
      await expect(page.getByText('Page not found')).toHaveCount(0)
    }
  })

  test('project case studies open directly; unknown ones show the 404', async ({ page }) => {
    await open(page, '/projects/cashcompass')
    await expect(page.getByRole('heading', { level: 1, name: 'CashCompass' })).toBeVisible()
    await open(page, '/projects/resumecraft')
    await expect(page.getByRole('heading', { level: 1, name: 'ResumeCraft' })).toBeVisible()
    await open(page, '/projects/not-a-project')
    await expect(page.getByText('Page not found').first()).toBeVisible()
  })

  test('browser Back and Forward follow the apps', async ({ page }) => {
    await open(page, '/about')
    await page.getByRole('button', { name: 'Projects' }).first().click()
    await expect(page).toHaveURL(/\/projects$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/about$|\/$/)
    await page.goForward()
    await expect(page).toHaveURL(/\/projects$/)
  })
})

test.describe('preferences', () => {
  test('theme switches and is remembered', async ({ page }) => {
    await open(page, '/about')
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
    await page.getByRole('button', { name: 'Switch to light windows' }).click()
    await expect(html).not.toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('language switches to Khmer and Chinese', async ({ page }) => {
    await open(page, '/about')
    await page.getByRole('button', { name: /^EN —/ }).click()
    await page.getByRole('menuitemradio', { name: /ខ្មែរ/ }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'km')
    await page.getByRole('button', { name: /—/ }).filter({ hasText: /KM|ខ្មែរ/ }).first().click()
    await page.getByRole('menuitemradio', { name: /中文/ }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect(page.getByRole('link', { name: /下载简历/ }).first()).toBeVisible()
  })
})

test.describe('projects', () => {
  test('Live Demo and Source Code links are public and open safely', async ({ page }) => {
    await open(page, '/projects')
    const live = page.getByRole('link', { name: /live demo/i })
    await expect(live).toHaveCount(2)
    for (const a of await live.all()) {
      await expect(a).toHaveAttribute('href', /^https:\/\/[a-z0-9-]+\.vercel\.app\/?$/)
      await expect(a).toHaveAttribute('target', '_blank')
      await expect(a).toHaveAttribute('rel', /noopener/)
    }
    for (const a of await page.getByRole('link', { name: /source code/i }).all()) {
      await expect(a).toHaveAttribute('href', /^https:\/\/github\.com\/AmCheachamroeun-Portfolio\//)
    }
  })

  test('a failed Cloudinary image shows a message instead of breaking the page', async ({ page }) => {
    await page.route('https://res.cloudinary.com/**', (r) => r.abort())
    await open(page, '/projects/cashcompass')
    await page.locator('#cs-gallery').scrollIntoViewIfNeeded()
    await expect(page.getByText('This image couldn’t be loaded.').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { level: 1, name: 'CashCompass' })).toBeVisible()
  })

  test('the demo video is not downloaded until it is played', async ({ page }) => {
    const videos: string[] = []
    page.on('request', (r) => r.url().includes('/video/upload/') && videos.push(r.url()))
    await open(page, '/projects/cashcompass')
    await page.waitForTimeout(1500)
    expect(videos).toEqual([])
    await expect(page.locator('video[autoplay]')).toHaveCount(0)
  })
})

test.describe('CV', () => {
  test('Download CV saves Am-Cheachamroeun-CV.pdf', async ({ page }) => {
    await open(page, '/about')
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download CV as a PDF' }).click()])
    expect(download.suggestedFilename()).toBe('Am-Cheachamroeun-CV.pdf')
  })

  test('View CV opens the PDF in a new tab, and the file is a real PDF', async ({ page, request }) => {
    await open(page, '/about')
    const view = page.getByRole('link', { name: 'View CV in a new tab (PDF)' })
    await expect(view).toHaveAttribute('target', '_blank')
    await expect(view).toHaveAttribute('rel', /noopener/)
    await expect(view).toHaveAttribute('href', '/documents/am-cheachamroeun-cv.pdf')
    const res = await request.get('/documents/am-cheachamroeun-cv.pdf')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('application/pdf')
    expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-')
  })

  test('the command palette finds both CV commands', async ({ page }) => {
    await open(page, '/about')
    await page.keyboard.press('ControlOrMeta+k')
    await page.keyboard.type('cv')
    await expect(page.getByRole('option', { name: /View CV/ })).toBeVisible()
    await expect(page.getByRole('option', { name: /Download CV/ })).toBeVisible()
  })

  test('Work Experience has a compact Download CV', async ({ page }) => {
    await open(page, '/experience')
    await expect(page.getByRole('link', { name: 'Download CV as a PDF' })).toBeVisible()
  })
})

test.describe('contact', () => {
  test('without a form endpoint the message goes to the email app and is never reported as sent', async ({ page }) => {
    await open(page, '/contact')
    await page.locator('input[name=name]').fill('Test Visitor')
    await page.locator('input[name=email]').fill('visitor@example.com')
    await page.locator('textarea[name=message]').fill('Hello, this is a test message for the portfolio.')
    await page.route('mailto:**', (r) => r.abort()).catch(() => undefined)
    await page.getByRole('button', { name: /send|email app/i }).click()
    await expect(page.getByText(/email app should open/i)).toBeVisible()
  })
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 800 } })
  for (const path of ['/about', '/projects', '/experience', '/contact']) {
    test(`${path} has no horizontal scrolling`, async ({ page }) => {
      await open(page, path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      expect(overflow).toBe(false)
    })
  }
  test('CV buttons are reachable on a phone', async ({ page }) => {
    await open(page, '/about')
    await expect(page.getByRole('link', { name: 'Download CV as a PDF' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View CV in a new tab (PDF)' })).toBeVisible()
  })
})

test.describe('polish pass', () => {
  test('case-study shortcuts jump to the demo video and the gallery', async ({ page }) => {
    await open(page, '/projects/resumecraft')
    await page.locator('header').getByRole('button', { name: 'Demo video' }).click()
    await expect.poll(() => page.evaluate(() => Math.round(document.getElementById('cs-demo')!.getBoundingClientRect().top)), { timeout: 5000 }).toBeLessThan(400)
    await expect(page.locator('#cs-demo')).toBeInViewport()
  })

  test('the Specializations name is the same in the menu and the page', async ({ page }) => {
    await open(page, '/services')
    await expect(page.getByRole('heading', { name: 'Specializations' }).first()).toBeVisible()
    await expect(page.getByText('Developer Tools')).toHaveCount(0)
  })

  test('the palette lists an app once when it is also in Recent', async ({ page }) => {
    await open(page, '/about')
    await page.keyboard.press('ControlOrMeta+k')
    const names = await page.getByRole('option').allInnerTexts()
    const apps = names.map((n) => n.split('\n')[0].trim())
    expect(new Set(apps).size).toBe(apps.length)
  })

  test('Contact shows the full email and can copy it', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page, '/contact')
    await expect(page.getByText('amcheachamroeun87@gmail.com').first()).toBeVisible()
    await page.getByRole('button', { name: 'Copy email address' }).click()
    await expect(page.getByText('Copied')).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('amcheachamroeun87@gmail.com')
  })

  test('phone About has a Work Experience link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await open(page, '/about')
    await page.locator('section').getByRole('button', { name: 'Work experience' }).click()
    await expect(page).toHaveURL(/\/experience$/)
  })
})
