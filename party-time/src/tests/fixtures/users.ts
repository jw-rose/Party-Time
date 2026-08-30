// Synthetic e2e host account — must exist as a seeded row in the test database
export const E2E_HOST_EMAIL = 'existing-guest@test.local'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}
export const E2E_HOST_PASSWORD: string = (() => requireEnv('E2E_HOST_PASSWORD'))()

export const mockUser = {
  id: 'user-host-123',
  name: 'Jamie Host',
  email: 'jamie@test.com',
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockGuest = {
  id: 'user-guest-456',
  name: 'Sophie Guest',
  email: 'sophie@test.com',
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}