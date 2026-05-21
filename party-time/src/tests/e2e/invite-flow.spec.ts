import { test, expect } from '@playwright/test'

const HOST_EMAIL = 'josh1989rose@gmail.com'
const HOST_PASSWORD = 'Ikamoa39!'
const GUEST_EMAIL = 'josh89rose@icloud.com'
const GUEST_PASSWORD = 'Test!1234!'
const GUEST_NAME = 'Josh'


test.describe.serial('Invite flow', () => {

  test('host creates event and sends invite to guest', async ({ page }) => {
    // Login as host
    await page.goto('/login')
    await page.fill('#email', HOST_EMAIL)
    await page.fill('#password', HOST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })

    // Create a new event
    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await page.fill('#title', 'Summer Party')
    await page.fill('#date', '2026-06-06T20:00')
    await page.fill('#location', 'Paris, France')

    await page.click('button[type="submit"]')

    // Wait for redirect to event hub — exclude /events/new
    await page.waitForURL(/\/events\/(?!new)[^/]+$/, { timeout: 15000 })

    // Log the URL to see what eventId we get
    const eventUrl = page.url()
    console.log('Event URL after creation:', eventUrl)
    const eventId = eventUrl.split('/events/')[1].split('/')[0]
    console.log('Event ID extracted:', eventId)

    await page.screenshot({ path: 'test-results/after-event-create.png', fullPage: true })

    // Go to invite page
    await page.goto(`/events/${eventId}/invite`)
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: 'test-results/invite-page-load.png', fullPage: true })

    // Send invite to guest email
    await page.locator('#email').scrollIntoViewIfNeeded()
    await page.fill('#email', GUEST_EMAIL)
    await page.click('button[type="submit"]')

    // Screenshot after invite submit
    await page.screenshot({ path: 'test-results/after-invite-submit.png', fullPage: true })

    // Wait for success message
    await expect(
      page.locator('text=Invite sent successfully!')
    ).toBeVisible({ timeout: 15000 })

    // Store event ID for use in subsequent tests
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

    // Get the invite token — either from env or hardcoded fallback
    // Run this in Neon to get the latest token after the first test:
    // SELECT token FROM invites WHERE email = 'josh89rose@icloud.com' ORDER BY created_at DESC LIMIT 1;
    const INVITE_TOKEN = process.env.TEST_INVITE_TOKEN ?? '5729d443-6c1a-4e59-abb4-6dc3cd5795c6'
    const INVITE_URL = `/invite/${INVITE_TOKEN}`

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

    // Step 5 — Submit
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toContainText('Create account & accept invite')
    await submitButton.click()

    // Step 6 — Should land on invite page after registration
    await page.waitForURL(/\/invite\//, { timeout: 20000 })
    expect(page.url()).toContain(INVITE_TOKEN)

    await page.screenshot({ path: 'test-results/invite-page-state.png', fullPage: true })

    // Step 7 — RSVP buttons visible
    const goingButton = page.locator('button', { hasText: "Yes, I'm going!" })
    await expect(goingButton).toBeVisible({ timeout: 15000 })

    // Step 8 — Click going
    await goingButton.click()

    await page.screenshot({ path: 'test-results/after-rsvp-click.png', fullPage: true })

    // Step 9 — Redirected to event hub
    await page.waitForURL(/\/events\//, { timeout: 10000 })
    expect(page.url()).toContain('/events/')

    // Step 10 — Dashboard shows event as attending
    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard/)
    const attendingBadge = page.locator('text=Attending').first()
    await expect(attendingBadge).toBeVisible({ timeout: 10000 })

    await context.close()
  })

  test('existing guest can click invite link and see RSVP without registering', async ({ browser }) => {
    const INVITE_TOKEN = process.env.TEST_INVITE_TOKEN ?? '5729d443-6c1a-4e59-abb4-6dc3cd5795c6'
    const INVITE_URL = `/invite/${INVITE_TOKEN}`

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