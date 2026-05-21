import { test, expect } from '@playwright/test'

// Fresh guest credentials — reset in Neon before running:
// UPDATE invites SET used_at = NULL, expires_at = NOW() + INTERVAL '48 hours'
// WHERE token = '5729d443-6c1a-4e59-abb4-6dc3cd5795c6';
// DELETE FROM users WHERE email = 'josh89rose@icloud.com';
const GUEST_EMAIL = 'josh89rose@icloud.com'
const GUEST_PASSWORD = 'Test!1234!'
const GUEST_NAME = 'Josh'
const INVITE_TOKEN = '5729d443-6c1a-4e59-abb4-6dc3cd5795c6'
const INVITE_URL = `/invite/${INVITE_TOKEN}`

// Serial ensures registration test runs before existing guest test
test.describe.serial('Invite flow', () => {

  test('host can navigate to invite page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'josh1989rose@gmail.com')
    await page.fill('#password', 'Ikamoa39!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    await page.goto('/events')

    const firstEvent = page.locator('a[href*="/events/"]').first()
    if (await firstEvent.isVisible()) {
      await firstEvent.click()
      await page.waitForURL(/\/events\/.+/, { timeout: 10000 })

      const inviteBtn = page.locator('a[href*="/invite"]').first()
      if (await inviteBtn.isVisible()) {
        await inviteBtn.click()
        await page.waitForURL(/\/invite$/, { timeout: 10000 })
        expect(page.url()).toContain('/invite')
      }
    }
  })

  test('invalid invite token shows error page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'josh1989rose@gmail.com')
    await page.fill('#password', 'Ikamoa39!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    await page.goto('/invite/invalid-token-that-does-not-exist')

    const errorText = page.locator('h2', { hasText: 'Invalid invite' })
    await expect(errorText).toBeVisible({ timeout: 10000 })
  })

  test('guest with no account can register via invite link and RSVP', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // Step 1 — Guest clicks invite link
    await page.goto(INVITE_URL)

    // Step 2 — No session → redirected to register with callbackUrl
    await page.waitForURL(/\/register/, { timeout: 10000 })
    expect(page.url()).toContain('/register')
    expect(page.url()).toContain('callbackUrl')

    // Step 3 — Register form shows invite-specific text
    await expect(
      page.locator('text=Create your account to accept the invitation')
    ).toBeVisible()

    // Step 4 — Fill in registration form
    await page.fill('#firstName', GUEST_NAME)
    await page.fill('#email', GUEST_EMAIL)
    await page.fill('#password', GUEST_PASSWORD)
    await page.fill('#confirmPassword', GUEST_PASSWORD)
    await page.check('#terms')

    // Step 5 — Submit button says "Create account & accept invite"
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toContainText('Create account & accept invite')
    await submitButton.click()

    // Step 6 — Should land on invite page after registration
    await page.waitForURL(/\/invite\//, { timeout: 20000 })
    expect(page.url()).toContain(INVITE_TOKEN)

    // Take screenshot to see what is actually on the page
    await page.screenshot({ path: 'test-results/invite-page-state.png', fullPage: true })

    // Step 7 — RSVP buttons visible
    const goingButton = page.locator('button', { hasText: "Yes, I'm going!" })
    await expect(goingButton).toBeVisible({ timeout: 15000 })

    // Step 8 — Click going
    await goingButton.click()

    // Step 9 — Redirected to event hub
    await page.waitForURL(/\/events\//, { timeout: 10000 })
    expect(page.url()).toContain('/events/')

    // Step 10 — Dashboard shows event as attending
    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard/)
    await expect(page.locator('text=Attending')).toBeVisible({ timeout: 10000 })

    await context.close()
  })

  test('existing guest can click invite link and see RSVP without registering', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/login')
    await page.fill('#email', GUEST_EMAIL)
    await page.fill('#password', GUEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    await page.goto(INVITE_URL)
    await page.waitForURL(/\/invite\//, { timeout: 10000 })

    const goingButton = page.locator('button', { hasText: "Yes, I'm going!" })
    await expect(goingButton).toBeVisible({ timeout: 10000 })

    await context.close()
  })

})