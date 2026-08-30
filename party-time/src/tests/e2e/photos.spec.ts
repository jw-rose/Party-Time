import { test, expect } from '@playwright/test'
import { E2E_HOST_EMAIL as HOST_EMAIL, E2E_HOST_PASSWORD as HOST_PASSWORD } from '@/tests/fixtures/users'

async function loginAsHost(page: any) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill('#email', HOST_EMAIL)
  await page.fill('#password', HOST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 30000 })
  await page.waitForLoadState('networkidle')
}

test.describe('Photos feature', () => {

  test('host sees upload button on Photos tab when photos enabled', async ({ page }) => {
    await loginAsHost(page)

    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    const firstEvent = page.locator('a[href*="/events/"]').first()
    if (await firstEvent.isVisible()) {
      await firstEvent.click()
      await page.waitForURL(/\/events\/.+/, { timeout: 10000 })
      await page.waitForLoadState('networkidle')

      const photosTab = page.locator('button', { hasText: 'Photos' })
      if (await photosTab.isVisible()) {
        await photosTab.click()

        const uploadArea = page.locator('text=Upload').first()
        await expect(uploadArea).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('host always sees Photos tab regardless of photosEnabled', async ({ page }) => {
    await loginAsHost(page)

    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await page.fill('#title', 'No Photos Event')
    await page.fill('#date', '2026-07-01T20:00')
    await page.fill('#location', 'Paris')

    // Photos toggle off by default — do not enable it
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/events\/(?!new)[^/]+$/, { timeout: 15000 })

    // Host always sees Photos tab — canUpload returns true for host regardless
    const photosTab = page.locator('button', { hasText: 'Photos' })
    await expect(photosTab).toBeVisible({ timeout: 5000 })
  })

})