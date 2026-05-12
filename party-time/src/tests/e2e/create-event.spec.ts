import { test, expect } from '@playwright/test'

test.describe('Create event', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('#email', 'jamie@test.com')
    await page.fill('#password', 'TestPass1!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('host can create an event and is redirected to event hub', async ({ page }) => {
    await page.goto('/events/new')

    await page.fill('#title', 'Test Birthday Party')

    // Set date to tomorrow
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 16)
    await page.fill('#date', tomorrow)
    await page.fill('#location', 'Paris, France')

    await page.click('button[type="submit"]')

    // Should redirect to event hub
    await page.waitForURL(/\/events\/.+/)
    expect(page.url()).toMatch(/\/events\/.+/)

    // Event title should be visible
    await expect(page.locator('h1')).toContainText('Test Birthday Party')
  })

  test('form shows validation errors when submitted empty', async ({ page }) => {
    await page.goto('/events/new')
    await page.click('button[type="submit"]')

    const error = page.locator('.text-destructive').first()
    await expect(error).toBeVisible()
  })

})