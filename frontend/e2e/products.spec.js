// End-to-end test for page 1 (Customer Sales – Products) against the running app and real data.
import { expect, test } from '@playwright/test'

// October 2026 is a closed month with numbers verified in BigQuery (docs/metrics.md).
const OCTOBER = '/?start_date=2026-10-01&end_date=2026-10-31'

test('shows verified October numbers and every section', async ({ page }) => {
  await page.goto(OCTOBER)

  // Hero blocks: Total revenue $2.98M (verified $2,982,098.37), Product revenue present.
  // ("Total revenue" also appears as a table column, so take the first match: the hero block.)
  await expect(page.getByText('Total revenue', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('$2.98M').first()).toBeVisible()
  await expect(page.getByText('Product revenue', { exact: true }).first()).toBeVisible()

  // Every section renders.
  for (const heading of ['Total sales', 'Product sales', 'Where product revenue comes from', 'Product performance', 'Gift cards sold online']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }

  // Gift cards: October Shopify total verified at $50,900.
  await expect(page.getByText('$50.90K').first()).toBeVisible()
})

test('a filter chip filters the page and is saved in the address', async ({ page }) => {
  await page.goto(OCTOBER)
  await expect(page.getByText('$2.98M').first()).toBeVisible()

  await page.getByRole('button', { name: /^State: all$/ }).click()
  await page.getByRole('menuitemcheckbox', { name: 'NSW' }).click()
  await page.keyboard.press('Escape')

  await expect(page).toHaveURL(/state=NSW/)
  await expect(page.getByRole('button', { name: /^State: NSW$/ })).toBeVisible()
  // Total revenue changes once filtered to NSW only.
  await expect(page.getByText('$2.98M')).toHaveCount(0, { timeout: 60_000 })
})

test('the product table can be searched and sorted', async ({ page }) => {
  await page.goto(OCTOBER)
  await expect(page.getByText(/ items$/).first()).toBeVisible()

  await page.getByPlaceholder('Search items…').fill('eye cream')
  await expect(page.getByRole('cell', { name: 'Special Eye Cream', exact: true })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Gift Certificate', exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Total quantity' }).click()
  await expect(page.getByRole('columnheader', { name: 'Total quantity' })).toHaveAttribute('aria-sort', 'descending')
})

test('the theme switch toggles dark mode', async ({ page }) => {
  await page.goto(OCTOBER)
  const html = page.locator('html')
  const before = await html.getAttribute('data-theme')
  await page.getByRole('button', { name: /Switch to (dark|light) mode/ }).click()
  await expect(html).not.toHaveAttribute('data-theme', before)
})
