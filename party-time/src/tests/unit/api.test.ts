import { describe, it, expect } from 'vitest'

describe('API routes', () => {
  it.skip('Better Auth API route exists at /api/auth', async () => {
    const response = await fetch('http://localhost:3000/api/auth/get-session')
    expect(response.status).not.toBe(404)
  })
})