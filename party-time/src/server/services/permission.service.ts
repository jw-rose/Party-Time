import type { Event } from '@/server/db/schema'

// Pure functions — no Next.js imports
// These are fully testable with Vitest

export function isHost(userId: string, event: Event): boolean {
  return event.hostId === userId
}

export function canUpload(userId: string, event: Event): boolean {
  if (!event.photosEnabled) return false
  return true
}

export function canChat(userId: string, event: Event): boolean {
  if (!event.chatEnabled) return false
  return true
}