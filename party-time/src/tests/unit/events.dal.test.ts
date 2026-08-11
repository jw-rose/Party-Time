import { describe, it, expect, vi, beforeEach } from 'vitest'

// Prevent the server-only guard from throwing in the jsdom test environment
vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))
vi.mock('@/server/db', () => ({
  db: {
    query: {
      events: { findFirst: vi.fn() },
      guests: { findFirst: vi.fn(), findMany: vi.fn() },
    },
  },
}))

import { getEvent } from '@/server/dal/events.dal'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'

const SESSION_USER_ID = 'user-guest-456'
const HOST_USER_ID = 'user-host-123'
const EVENT_B_ID = 'event-B'

const mockEventB = {
  id: EVENT_B_ID,
  hostId: HOST_USER_ID,
  title: 'Event B',
  description: null,
  date: new Date(),
  location: null,
  coverImageUrl: null,
  photosEnabled: false,
  chatEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockGuestRecordForEventB = {
  id: 'guest-record-for-B',
  eventId: EVENT_B_ID,
  userId: SESSION_USER_ID,
  status: 'going' as const,
  invitedAt: new Date(),
  respondedAt: new Date(),
}

function withSession(userId: string) {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { id: userId, name: 'Test', email: 'test@test.com', emailVerified: false, createdAt: new Date(), updatedAt: new Date(), image: null },
    session: { id: 's', token: 't', userId, expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date(), ipAddress: null, userAgent: null },
  })
}

describe('getEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws UNAUTHORIZED when there is no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    await expect(getEvent(EVENT_B_ID)).rejects.toThrow('UNAUTHORIZED')
  })

  it('throws NOT_FOUND when the event does not exist', async () => {
    withSession(SESSION_USER_ID)
    vi.mocked(db.query.events.findFirst).mockResolvedValue(undefined)
    await expect(getEvent(EVENT_B_ID)).rejects.toThrow('NOT_FOUND')
  })

  it('returns the event immediately for the host without querying guests', async () => {
    withSession(HOST_USER_ID)
    vi.mocked(db.query.events.findFirst).mockResolvedValue(mockEventB)

    const result = await getEvent(EVENT_B_ID)

    expect(result.event).toEqual(mockEventB)
    expect(result.userId).toBe(HOST_USER_ID)
    // Host path must not touch the guests table at all
    expect(db.query.guests.findFirst).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when user has no guest record for this event', async () => {
    // Regression guard for the && vs and() bug.
    //
    // Before the fix, the WHERE clause was built as:
    //   eq(guests.eventId, eventId) && eq(guests.userId, userId)
    // JavaScript's && returns the right-hand operand when the left is truthy,
    // so Drizzle only received eq(guests.userId, userId) — the eventId filter
    // was silently dropped. Any user with a guest record on *any* event could
    // reach any event detail page by bypassing this check.
    //
    // The fix wraps both conditions in Drizzle's and(), ensuring both are sent
    // to the database. This test asserts the outcome: a null result from the
    // guests query (no record for this specific event+user) must produce FORBIDDEN.
    withSession(SESSION_USER_ID)
    vi.mocked(db.query.events.findFirst).mockResolvedValue(mockEventB)
    vi.mocked(db.query.guests.findFirst).mockResolvedValue(null)

    await expect(getEvent(EVENT_B_ID)).rejects.toThrow('FORBIDDEN')
  })

  it('returns the event when the user has a guest record for this event', async () => {
    withSession(SESSION_USER_ID)
    vi.mocked(db.query.events.findFirst).mockResolvedValue(mockEventB)
    vi.mocked(db.query.guests.findFirst).mockResolvedValue(mockGuestRecordForEventB)

    const result = await getEvent(EVENT_B_ID)

    expect(result.event).toEqual(mockEventB)
    expect(result.userId).toBe(SESSION_USER_ID)
  })
})
