import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateInviteToken,
  generateExpiryDate,
  isTokenExpired,
  isTokenUsed,
  buildInviteUrl,
} from '@/server/services/invite.service'

describe('invite.service', () => {

  describe('generateInviteToken()', () => {
    it('returns a non-empty string', () => {
      const token = generateInviteToken()
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })

    it('returns unique tokens each time', () => {
      const token1 = generateInviteToken()
      const token2 = generateInviteToken()
      expect(token1).not.toBe(token2)
    })

    it('returns a valid UUID format', () => {
      const token = generateInviteToken()
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(token).toMatch(uuidRegex)
    })
  })

  describe('generateExpiryDate()', () => {
    it('returns a date in the future', () => {
      const expiry = generateExpiryDate()
      expect(expiry.getTime()).toBeGreaterThan(Date.now())
    })

    it('expires approximately 48 hours from now', () => {
      const expiry = generateExpiryDate()
      const hoursFromNow =
        (expiry.getTime() - Date.now()) / 1000 / 60 / 60
      expect(hoursFromNow).toBeCloseTo(48, 0)
    })
  })

  describe('isTokenExpired()', () => {
    it('returns false for a future date', () => {
      const future = new Date(Date.now() + 1000 * 60 * 60 * 24)
      expect(isTokenExpired(future)).toBe(false)
    })

    it('returns true for a past date', () => {
      const past = new Date(Date.now() - 1000 * 60 * 60 * 24)
      expect(isTokenExpired(past)).toBe(true)
    })
  })

  describe('isTokenUsed()', () => {
    it('returns false when usedAt is null', () => {
      expect(isTokenUsed(null)).toBe(false)
    })

    it('returns true when usedAt is a date', () => {
      expect(isTokenUsed(new Date())).toBe(true)
    })
  })

  describe('buildInviteUrl()', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    })

    it('returns a valid URL with the token', () => {
      const url = buildInviteUrl('test-token-123')
      expect(url).toBe('http://localhost:3000/invite/test-token-123')
    })

    it('falls back to localhost when env is not set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      const url = buildInviteUrl('test-token-123')
      expect(url).toContain('/invite/test-token-123')
    })
  })

})