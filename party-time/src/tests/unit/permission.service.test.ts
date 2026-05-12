import { describe, it, expect } from 'vitest'
import {
  isHost,
  canUpload,
  canChat,
  canViewEvent,
  canManageGuests,
  canSendInvites,
  canEditEvent,
  canDeleteEvent,
} from '@/server/services/permission.service'
import { mockEvent, mockGuestRecord } from '../fixtures/events'

describe('permission.service', () => {

  describe('isHost()', () => {
    it('returns true when userId matches hostId', () => {
      expect(isHost('user-host-123', mockEvent)).toBe(true)
    })

    it('returns false when userId does not match hostId', () => {
      expect(isHost('user-guest-456', mockEvent)).toBe(false)
    })

    it('returns false for empty userId', () => {
      expect(isHost('', mockEvent)).toBe(false)
    })
  })

  describe('canUpload()', () => {
    it('returns true for host even if photosEnabled is false', () => {
      expect(
        canUpload('user-host-123', { ...mockEvent, photosEnabled: false })
      ).toBe(true)
    })

    it('returns true for guest when photosEnabled is true', () => {
      expect(
        canUpload('user-guest-456', mockEvent, mockGuestRecord)
      ).toBe(true)
    })

    it('returns false for guest when photosEnabled is false', () => {
      expect(
        canUpload(
          'user-guest-456',
          { ...mockEvent, photosEnabled: false },
          mockGuestRecord
        )
      ).toBe(false)
    })

    it('returns false for non-guest with photosEnabled true', () => {
      expect(
        canUpload('user-stranger-789', mockEvent, null)
      ).toBe(false)
    })
  })

  describe('canChat()', () => {
    it('returns true for host even if chatEnabled is false', () => {
      expect(
        canChat('user-host-123', { ...mockEvent, chatEnabled: false })
      ).toBe(true)
    })

    it('returns true for guest when chatEnabled is true', () => {
      expect(
        canChat('user-guest-456', mockEvent, mockGuestRecord)
      ).toBe(true)
    })

    it('returns false for guest when chatEnabled is false', () => {
      expect(
        canChat(
          'user-guest-456',
          { ...mockEvent, chatEnabled: false },
          mockGuestRecord
        )
      ).toBe(false)
    })
  })

  describe('canViewEvent()', () => {
    it('returns true for host', () => {
      expect(canViewEvent('user-host-123', mockEvent)).toBe(true)
    })

    it('returns true for guest with a guest record', () => {
      expect(
        canViewEvent('user-guest-456', mockEvent, mockGuestRecord)
      ).toBe(true)
    })

    it('returns false for non-member', () => {
      expect(
        canViewEvent('user-stranger-789', mockEvent, null)
      ).toBe(false)
    })
  })

  describe('host-only permissions', () => {
    it('canManageGuests returns true only for host', () => {
      expect(canManageGuests('user-host-123', mockEvent)).toBe(true)
      expect(canManageGuests('user-guest-456', mockEvent)).toBe(false)
    })

    it('canSendInvites returns true only for host', () => {
      expect(canSendInvites('user-host-123', mockEvent)).toBe(true)
      expect(canSendInvites('user-guest-456', mockEvent)).toBe(false)
    })

    it('canEditEvent returns true only for host', () => {
      expect(canEditEvent('user-host-123', mockEvent)).toBe(true)
      expect(canEditEvent('user-guest-456', mockEvent)).toBe(false)
    })

    it('canDeleteEvent returns true only for host', () => {
      expect(canDeleteEvent('user-host-123', mockEvent)).toBe(true)
      expect(canDeleteEvent('user-guest-456', mockEvent)).toBe(false)
    })
  })

})