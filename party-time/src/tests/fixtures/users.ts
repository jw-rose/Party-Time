// E2e test account credentials — seeded in the test database, not real personal addresses
export const E2E_HOST_EMAIL = 'josh1989rose@gmail.com'

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