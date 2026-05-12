import type { Event, Guest } from '@/server/db/schema'

// ── Pure functions — no Next.js imports ───────────────────────────────────
// These have zero dependencies and are fully testable with Vitest

// Check if a user is the host of an event
export function isHost(userId: string, event: Event): boolean {
  return event.hostId === userId
}

// Check if a user can upload photos to an event
export function canUpload(userId: string, event: Event, guest?: Guest | null): boolean {
  // Host can always upload regardless of module toggle
  if (isHost(userId, event)) return true
  // Guests can only upload if module is enabled
  if (!event.photosEnabled) return false
  return guest !== null && guest !== undefined
}

// Check if a user can chat in an event
export function canChat(userId: string, event: Event, guest?: Guest | null): boolean {
  // Host can always chat regardless of module toggle
  if (isHost(userId, event)) return true
  // Guests can only chat if module is enabled
  if (!event.chatEnabled) return false
  return guest !== null && guest !== undefined
}

// Check if a user can view an event
export function canViewEvent(userId: string, event: Event, guest?: Guest | null): boolean {
  if (isHost(userId, event)) return true
  return guest !== null && guest !== undefined
}

// Check if a user can manage guests (host only)
export function canManageGuests(userId: string, event: Event): boolean {
  return isHost(userId, event)
}

// Check if a user can send invites (host only)
export function canSendInvites(userId: string, event: Event): boolean {
  return isHost(userId, event)
}

// Check if a user can edit an event (host only)
export function canEditEvent(userId: string, event: Event): boolean {
  return isHost(userId, event)
}

// Check if a user can delete an event (host only)
export function canDeleteEvent(userId: string, event: Event): boolean {
  return isHost(userId, event)
}