import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))
vi.mock('@/server/services/email.service', () => ({
  sendInviteEmail: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  db: {
    query: {
      invites: { findFirst: vi.fn() },
      guests: { findFirst: vi.fn() },
    },
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    insert: vi.fn(() => ({ values: vi.fn() })),
  },
}))

import { acceptInvite } from '@/server/actions/invite.actions'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'

describe('acceptInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an error and creates no guest record when session email does not match invite email', async () => {
    // Session email is uppercase to also exercise the case-insensitive comparison
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: {
        id: 'user-123',
        name: 'Other User',
        email: 'OTHER@EXAMPLE.COM',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: null,
      },
      session: {
        id: 's',
        token: 't',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
    })

    vi.mocked(db.query.invites.findFirst).mockResolvedValue({
      id: 'invite-1',
      eventId: 'event-1',
      createdBy: 'host-user',
      email: 'intended@example.com',
      token: 'test-token',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
      usedAt: null,
      createdAt: new Date(),
    })

    const result = await acceptInvite('test-token')

    expect(result).toEqual({ error: 'This invite was sent to a different email address' })
    expect(db.insert).not.toHaveBeenCalled()
  })
})
