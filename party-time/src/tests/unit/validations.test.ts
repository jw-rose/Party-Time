import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  createEventSchema,
  inviteSchema,
  createPostSchema,
} from '@/lib/validations'

describe('validations', () => {

  describe('loginSchema', () => {
    it('passes with valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
      })
      expect(result.success).toBe(true)
    })

    it('fails with invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'Password1',
      })
      expect(result.success).toBe(false)
    })

    it('fails with password under 8 characters', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
      })
      expect(result.success).toBe(false)
    })

    it('fails with empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'Password1',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    const validData = {
      name: 'Jamie Martin',
      email: 'jamie@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      terms: true,
    }

    it('passes with all valid fields', () => {
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('fails when passwords do not match', () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: 'DifferentPass1',
      })
      expect(result.success).toBe(false)
    })

    it('fails when terms not accepted', () => {
      const result = registerSchema.safeParse({
        ...validData,
        terms: false,
      })
      expect(result.success).toBe(false)
    })

    it('fails when password has no uppercase', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'password1',
        confirmPassword: 'password1',
      })
      expect(result.success).toBe(false)
    })

    it('fails when name is too short', () => {
      const result = registerSchema.safeParse({
        ...validData,
        name: 'J',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createEventSchema', () => {
    it('passes with valid data', () => {
      const result = createEventSchema.safeParse({
        title: 'Birthday Party',
        date: new Date(Date.now() + 86400000).toISOString(),
        description: 'Fun times',
        location: 'Paris',
        photosEnabled: false,
        chatEnabled: true,
      })
      expect(result.success).toBe(true)
    })

    it('fails with empty title', () => {
      const result = createEventSchema.safeParse({
        title: '',
        date: new Date(Date.now() + 86400000).toISOString(),
        photosEnabled: false,
        chatEnabled: false,
      })
      expect(result.success).toBe(false)
    })

    it('fails with past date', () => {
      const result = createEventSchema.safeParse({
        title: 'Birthday Party',
        date: new Date(Date.now() - 86400000).toISOString(),
        photosEnabled: false,
        chatEnabled: false,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('inviteSchema', () => {
    it('passes with valid email', () => {
      const result = inviteSchema.safeParse({ email: 'guest@example.com' })
      expect(result.success).toBe(true)
    })

    it('fails with invalid email', () => {
      const result = inviteSchema.safeParse({ email: 'not-valid' })
      expect(result.success).toBe(false)
    })
  })

  describe('createPostSchema', () => {
    it('passes with valid content', () => {
      const result = createPostSchema.safeParse({
        content: 'Hello guests!',
      })
      expect(result.success).toBe(true)
    })

    it('fails with empty content', () => {
      const result = createPostSchema.safeParse({ content: '' })
      expect(result.success).toBe(false)
    })

    it('fails with content over 1000 characters', () => {
      const result = createPostSchema.safeParse({
        content: 'a'.repeat(1001),
      })
      expect(result.success).toBe(false)
    })
  })

})