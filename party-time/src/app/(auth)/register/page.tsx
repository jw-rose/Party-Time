'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUp } from '@/lib/auth-client'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = getStrength(password)

  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very strong']
  const hints = [
    '',
    '— add uppercase letters',
    '— add numbers',
    '— add a symbol to make it very strong',
    '— excellent password',
  ]

  const colours = [
    'bg-border',
    'bg-destructive',
    'bg-yellow-400',
    'bg-green-500',
    'bg-green-600',
  ]

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              bar <= strength ? colours[strength] : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {labels[strength]} {hints[strength]}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = watch('password') ?? ''
  const confirmValue = watch('confirmPassword') ?? ''
  const confirmValid =
    confirmValue.length > 0 && confirmValue === passwordValue

async function onSubmit(data: RegisterFormData) {
  setServerError('')

  const { error } = await signUp.email({
    name: `${data.name}`,
    email: data.email,
    password: data.password,
  })

  if (error) {
    setServerError('Something went wrong. Please try again.')
    return
  }

  // If coming from an invite — wait for session to be established
  // then redirect to invite page where user can RSVP
  if (inviteToken) {
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push(`/invite/${inviteToken}`)
    return
  }

  router.push('/dashboard')
}

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-6">

        {/* Back + title */}
        <div className="space-y-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <span>←</span>
            <span>Sign in</span>
          </button>
          <h1 className="text-3xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="text-muted-foreground text-sm">
            {inviteToken
              ? 'Create your account to accept the invitation'
              : 'Join PartyUp and start planning'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary/30" />
            <div className="h-1 flex-1 rounded-full bg-primary/15" />
          </div>
          <p className="text-xs text-muted-foreground">
            Step 2 of 3 — Your details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* First name + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jamie"
                disabled={isSubmitting}
                className="h-12 text-base px-4 rounded-xl border-border/60"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Martin"
                disabled={isSubmitting}
                className="h-12 text-base px-4 rounded-xl border-border/60"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jamie@example.com"
              disabled={isSubmitting}
              className={`h-12 text-base px-4 rounded-xl border-border/60 ${
                errors.email
                  ? 'border-destructive focus:border-destructive'
                  : ''
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-destructive text-destructive text-xs flex-shrink-0">
                  !
                </span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <span className="text-xs text-muted-foreground">
                Min. 8 characters
              </span>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                disabled={isSubmitting}
                className="h-12 text-base px-4 pr-12 rounded-xl border-border/60"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <PasswordStrengthBar password={passwordValue} />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••••"
                disabled={isSubmitting}
                className={`h-12 text-base px-4 pr-12 rounded-xl border-border/60 ${
                  confirmValid ? 'border-green-500 focus:border-green-500' : ''
                }`}
                {...register('confirmPassword')}
              />
              {confirmValid ? (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* RGPD checkbox */}
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5">
              <input
                id="terms"
                type="checkbox"
                className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                {...register('terms')}
              />
            </div>
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-relaxed cursor-pointer"
            >
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . I understand my data is stored securely and I can request
              deletion at any time.
            </Label>
          </div>
          {errors.terms && (
            <p className="text-sm text-destructive">
              {errors.terms.message}
            </p>
          )}

          {/* Server error */}
          {serverError && (
            <p className="text-sm text-destructive text-center">
              {serverError}
            </p>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 text-base rounded-xl font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Creating account...'
              : inviteToken
              ? 'Create account & accept invite'
              : 'Create account'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              or sign up with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base rounded-xl font-normal border-border/60"
            disabled={isSubmitting}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground pb-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}