// Takes full-page screenshots of the running dashboard for design review.
// Usage: node e2e/screenshots.mjs <output-folder> [widths] [themes] [url]
//   widths: comma list, default "1440"   e.g. "1440,1024,390"
//   themes: comma list, default "light,dark"
// Needs the dev servers running (npm run dev + backend) and `npx playwright install chromium`.
import { chromium } from 'playwright'

const outDir = process.argv[2] ?? '.'
const widths = (process.argv[3] ?? '1440').split(',').map(Number)
const themes = (process.argv[4] ?? 'light,dark').split(',')
const url = process.argv[5] ?? 'http://localhost:5173/'

const browser = await chromium.launch()
for (const width of widths) {
  for (const theme of themes) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    // Choose the theme before the app loads (the app reads it from localStorage).
    await page.addInitScript((t) => localStorage.setItem('eb-theme', t), theme)
    page.on('console', (msg) => msg.type() === 'error' && console.log(`[${theme}] console error:`, msg.text()))
    await page.goto(url)
    // Wait until the KPI cards and the product table have real data.
    await page.getByText(/^Total revenue$/i).first().waitFor({ timeout: 60_000 })
    await page.getByText(/ items$/).first().waitFor({ timeout: 60_000 })
    await page.waitForTimeout(1000)
    // Flag horizontal overflow (a layout bug at small widths).
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 0) console.log(`[${width}px ${theme}] horizontal overflow: ${overflow}px`)
    const path = `${outDir}/products-${width}-${theme}.png`
    await page.screenshot({ path, fullPage: true })
    console.log('saved', path)
    await page.close()
  }
}
await browser.close()
