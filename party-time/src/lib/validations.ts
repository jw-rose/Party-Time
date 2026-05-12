import { z } from 'zod'

// ── Auth schemas ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    terms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the terms and privacy policy',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

  export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event name is required')
    .min(3, 'Event name must be at least 3 characters')
    .max(100, 'Event name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => {
      const date = new Date(val)
      return date > new Date()
    }, 'Event date must be in the future'),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  photosEnabled: z.boolean(),
  chatEnabled: z.boolean(),
})

// ── Invite schema ──────────────────────────────────────────────────────────

export const inviteSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event name is required')
    .min(3, 'Event name must be at least 3 characters')
    .max(100, 'Event name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  date: z
    .string()
    .min(1, 'Date is required'),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  photosEnabled: z.boolean(),
  chatEnabled: z.boolean(),
})

// ── Post schema ────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
})



// ── Inferred types ─────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CreateEventFormData = z.infer<typeof createEventSchema>
export type InviteFormData = z.infer<typeof inviteSchema>
export type UpdateEventFormData = z.infer<typeof updateEventSchema>
export type CreatePostFormData = z.infer<typeof createPostSchema>