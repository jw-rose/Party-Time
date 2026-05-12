import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {

  test('user can register and is redirected to dashboard', async ({ page }) => {
    await page.goto('/register')

    await page.fill('#firstName', 'Test')
    await page.fill('#email', `test-${Date.now()}@example.com`)
    await page.fill('#password', 'TestPass1!')
    await page.fill('#confirmPassword', 'TestPass1!')
    await page.check('#terms')

    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    expect(page.url()).toContain('/dashboard')
  })

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('#email', 'jamie@test.com')
    await page.fill('#password', 'TestPass1!')
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard')
    expect(page.url()).toContain('/dashboard')
  })

  test('login shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('#email', 'wrong@example.com')
    await page.fill('#password', 'WrongPass1!')
    await page.click('button[type="submit"]')

    const error = page.locator('.text-destructive')
    await expect(error).toBeVisible()
  })

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('guest cannot access host edit page directly', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'guest@test.com')
    await page.fill('#password', 'Test1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Try to access a host-only route directly
    await page.goto('/events/b47036e0-92ab-40b6-ac71-6a578c608d14/edit')

    // Should be redirected away — not on the edit page
    expect(page.url()).not.toContain('/edit')
  })

})