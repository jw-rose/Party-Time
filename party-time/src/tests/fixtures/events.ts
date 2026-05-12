export const mockEvent = {
  id: 'event-123',
  hostId: 'user-host-123',
  title: 'Rooftop Birthday Bash',
  description: 'Smart casual dress code',
  date: new Date('2026-06-15T20:00:00'),
  location: 'Rooftop Bar Marais, Paris',
  coverImageUrl: null,
  photosEnabled: true,
  chatEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockGuestRecord = {
  id: 'guest-record-123',
  eventId: 'event-123',
  userId: 'user-guest-456',
  status: 'going' as const,
  invitedAt: new Date(),
  respondedAt: new Date(),
}