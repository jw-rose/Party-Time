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
vi.mock('@/server/services/invite.service', () => ({
  generateInviteToken: vi.fn().mockReturnValue('mock-token'),
  generateExpiryDate: vi.fn().mockReturnValue(new Date(Date.now() + 48 * 60 * 60 * 1000)),
  buildInviteUrl: vi.fn().mockReturnValue('https://party-up.app/invite/mock-token'),
}))
vi.mock('@/server/db', () => ({
  db: {
    query: {
      events: { findFirst: vi.fn() },
      invites: { findFirst: vi.fn() },
      guests: { findFirst: vi.fn() },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ value: 0 }]),
      }),
    }),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    insert: vi.fn(() => ({ values: vi.fn() })),
  },
}))

import { sendInvite, acceptInvite } from '@/server/actions/invite.actions'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { sendInviteEmail } from '@/server/services/email.service'

const mockSession = {
  user: {
    id: 'host-user-id',
    name: 'Host User',
    email: 'host@example.com',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: null,
  },
  session: {
    id: 's',
    token: 't',
    userId: 'host-user-id',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  },
}

const mockEvent = {
  id: 'event-id',
  hostId: 'host-user-id',
  title: 'Test Party',
  description: null,
  date: new Date(),
  location: null,
  coverImageUrl: null,
  photosEnabled: false,
  chatEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('sendInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: authenticated session, event found, well under the rate limit
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession)
    vi.mocked(db.query.events.findFirst).mockResolvedValue(mockEvent)
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ value: 0 }]),
      }),
    } as never)
  })

  it('returns an error and sends no email when the host has hit the hourly invite cap', async () => {
    // Host has already sent 20 invites in the past hour
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ value: 20 }]),
      }),
    } as never)

    const result = await sendInvite('event-id', { email: 'guest@example.com' })

    expect(result).toEqual({
      error: expect.stringContaining('invite limit'),
    })
    expect(sendInviteEmail).not.toHaveBeenCalled()
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('sends an invite successfully when the host is under the hourly cap', async () => {
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) } as never)
    vi.mocked(sendInviteEmail).mockResolvedValue(undefined)

    const result = await sendInvite('event-id', { email: 'guest@example.com' })

    expect(result).toEqual({ success: true })
    expect(db.insert).toHaveBeenCalled()
    expect(sendInviteEmail).toHaveBeenCalled()
  })
})

describe('acceptInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an error and does not hit the DB when status is not a valid enum value', async () => {
    const result = await acceptInvite('test-token', 'admin' as never)

    expect(result).toEqual({ error: expect.stringContaining('Invalid') })
    expect(db.query.invites.findFirst).not.toHaveBeenCalled()
    expect(db.insert).not.toHaveBeenCalled()
    expect(db.update).not.toHaveBeenCalled()
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
