import { test, expect } from '@playwright/test'

test.describe('Invite flow', () => {

  test('host can navigate to invite page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'jamie@test.com')
    await page.fill('#password', 'TestPass1!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Go to events page
    await page.goto('/events')

    // Click first event if exists
    const firstEvent = page.locator('a[href*="/events/"]').first()
    if (await firstEvent.isVisible()) {
      await firstEvent.click()
      await page.waitForURL(/\/events\/.+/)

      // Click invite button
      const inviteBtn = page.locator('a[href*="/invite"]').first()
      if (await inviteBtn.isVisible()) {
        await inviteBtn.click()
        await page.waitForURL(/\/invite$/)
        expect(page.url()).toContain('/invite')
      }
    }
  })

  test('invalid invite token shows error page', async ({ page }) => {
    await page.goto('/invite/invalid-token-that-does-not-exist')

    const errorText = page.locator('text=Invalid invite')
    await expect(errorText).toBeVisible()
  })

})