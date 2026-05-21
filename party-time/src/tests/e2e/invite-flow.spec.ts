import { test, expect } from '@playwright/test'

const HOST_EMAIL = 'josh1989rose@gmail.com'
const HOST_PASSWORD = 'Ikamoa39!'
const GUEST_EMAIL = 'josh89rose@icloud.com'
const GUEST_PASSWORD = 'Test!1234!'
const GUEST_NAME = 'Josh'

test.describe.serial('Invite flow', () => {

  test('host creates event and sends invite to guest', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', HOST_EMAIL)
    await page.fill('#password', HOST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await page.fill('#title', 'Summer Party')
    await page.fill('#date', '2026-06-06T20:00')
    await page.fill('#location', 'Paris, France')

    await page.click('button[type="submit"]')
    await page.waitForURL(/\/events\/(?!new)[^/]+$/, { timeout: 15000 })

    const eventUrl = page.url()
    console.log('Event URL after creation:', eventUrl)
    const eventId = eventUrl.split('/events/')[1].split('/')[0]
    console.log('Event ID extracted:', eventId)

    await page.screenshot({ path: 'test-results/after-event-create.png', fullPage: true })

    await page.goto(`/events/${eventId}/invite`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: 'test-results/invite-page-load.png', fullPage: true })

    await page.locator('#email').scrollIntoViewIfNeeded()
    await page.fill('#email', GUEST_EMAIL)
    await page.click('button[type="submit"]')

    await page.screenshot({ path: 'test-results/after-invite-submit.png', fullPage: true })

    await expect(
      page.locator('text=Invite sent successfully!')
    ).toBeVisible({ timeout: 15000 })

    process.env.TEST_EVENT_ID = eventId
  })

  test('host can navigate to invite page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', HOST_EMAIL)
    await page.fill('#password', HOST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    await page.goto('/events')

    const firstEvent = page.locator('a[href*="/events/"]').first()
    if (await firstEvent.isVisible()) {
      await firstEvent.click()
      await page.waitForURL(/\/events\/.+/, { timeout: 15000 })

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
    await page.fill('#email', HOST_EMAIL)
    await page.fill('#password', HOST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    await page.goto('/invite/invalid-token-that-does-not-exist')

    const errorText = page.locator('h2', { hasText: 'Invalid invite' })
    await expect(errorText).toBeVisible({ timeout: 10000 })
  })

  test('guest with no account can register via invite link and RSVP', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // SELECT token FROM invites WHERE email = 'josh89rose@icloud.com' ORDER BY created_at DESC LIMIT 1;
    const INVITE_TOKEN = process.env.TEST_INVITE_TOKEN ?? '5729d443-6c1a-4e59-abb4-6dc3cd5795c6'
    const INVITE_URL = `/invite/${INVITE_TOKEN}`

    await page.goto(INVITE_URL)

    await page.waitForURL(/\/register/, { timeout: 10000 })
    expect(page.url()).toContain('/register')
    expect(page.url()).toContain('callbackUrl')

    await expect(
      page.locator('text=Create your account to accept the invitation')
    ).toBeVisible()

    await page.fill('#firstName', GUEST_NAME)
    await page.fill('#email', GUEST_EMAIL)
    await page.fill('#password', GUEST_PASSWORD)
    await page.fill('#confirmPassword', GUEST_PASSWORD)
    await page.check('#terms')

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toContainText('Create account & accept invite')
    await submitButton.click()

    await page.waitForURL(/\/invite\//, { timeout: 20000 })
    expect(page.url()).toContain(INVITE_TOKEN)

    await page.screenshot({ path: 'test-results/invite-page-state.png', fullPage: true })

    const goingButton = page.locator('button', { hasText: "Yes, I'm going!" })
    await expect(goingButton).toBeVisible({ timeout: 15000 })

    await goingButton.click()

    await page.screenshot({ path: 'test-results/after-rsvp-click.png', fullPage: true })

    await page.waitForURL(/\/events\//, { timeout: 10000 })
    expect(page.url()).toContain('/events/')

    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard/)
    const attendingBadge = page.locator('text=Attending').first()
    await expect(attendingBadge).toBeVisible({ timeout: 10000 })

    await context.close()
  })

  test('existing guest sees event on dashboard after RSVP', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // Login as guest created in previous test
    await page.goto('/login')
    await page.fill('#email', GUEST_EMAIL)
    await page.fill('#password', GUEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    // Event should appear on dashboard as attending
    const attendingBadge = page.locator('text=Attending').first()
    await expect(attendingBadge).toBeVisible({ timeout: 10000 })

    await context.close()
  })

})