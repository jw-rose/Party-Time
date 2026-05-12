import { describe, it, expect } from 'vitest'

describe('API routes', () => {
  it('Better Auth API route exists at /api/auth', async () => {
    const response = await fetch('http://localhost:3000/api/auth/get-session')
    // Should return 200 or 401 — never 404
    expect(response.status).not.toBe(404)
  })
})