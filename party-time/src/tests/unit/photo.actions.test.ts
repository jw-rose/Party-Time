import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))
vi.mock('@/server/db', () => ({
  db: {
    query: {
      photos: { findFirst: vi.fn() },
      events: { findFirst: vi.fn() },
    },
    delete: vi.fn(() => ({ where: vi.fn() })),
    insert: vi.fn(() => ({ values: vi.fn() })),
  },
}))

import { deletePhoto } from '@/server/actions/photo.actions'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'

const SESSION_HOST_A = {
  user: {
    id: 'host-a',
    name: 'Host A',
    email: 'hosta@example.com',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: null,
  },
  session: {
    id: 's1',
    token: 't1',
    userId: 'host-a',
    expiresAt: new Date(Date.now() + 3_600_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  },
}

describe('deletePhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('IDOR regression: host of event A cannot delete a photo belonging to event B', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(SESSION_HOST_A)
    // With the eventId constraint in the WHERE clause, the photo from event B
    // is not returned when queried with event A's id — findFirst returns null.
    vi.mocked(db.query.photos.findFirst).mockResolvedValue(null)

    const result = await deletePhoto('photo-from-event-b', 'event-a-id')

    expect(result).toEqual({ error: 'Photo not found' })
    expect(db.delete).not.toHaveBeenCalled()
  })

  it('uploader can delete their own photo with the correct eventId', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(SESSION_HOST_A)
    vi.mocked(db.query.photos.findFirst).mockResolvedValue({
      id: 'photo-1',
      eventId: 'event-a-id',
      uploadedBy: 'host-a',
      url: 'https://example.com/photo.jpg',
      key: 'photo-key',
      createdAt: new Date(),
    })
    vi.mocked(db.query.events.findFirst).mockResolvedValue({
      id: 'event-a-id',
      hostId: 'someone-else',
      title: 'Event A',
      description: null,
      date: new Date(),
      location: null,
      coverImageUrl: null,
      photosEnabled: true,
      chatEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await deletePhoto('photo-1', 'event-a-id')

    expect(result).toEqual({ success: true })
    expect(db.delete).toHaveBeenCalledOnce()
  })
})
