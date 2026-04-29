'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUp } from '@/lib/auth-client'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setServerError('')

    const { error } = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('Something went wrong. Please try again.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <Card className="bg-blue-200">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join Party Time and start planning</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jamie Martin"
              disabled={isSubmitting}
              className="h-12 text-base px-4"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="h-12 text-base px-4"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                disabled={isSubmitting}
                className="h-12 text-base px-4 pr-12"
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
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                disabled={isSubmitting}
                className="h-12 text-base px-4 pr-12"
                {...register('confirmPassword')}
              />
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
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* RGPD terms checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary"
              {...register('terms')}
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
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
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>

        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign Out
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}