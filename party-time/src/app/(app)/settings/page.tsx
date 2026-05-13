'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateProfileSchema,
  type UpdateProfileFormData,
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/lib/validations'
import { updateProfile, deleteAccount, changePassword } from '@/server/actions/user.actions'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { User, LogOut, Trash2, Lock, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onProfileSubmit(data: UpdateProfileFormData) {
    setProfileError('')
    setProfileSuccess(false)

    const result = await updateProfile(data)

    if (result?.error) {
      setProfileError(result.error)
      return
    }

    setProfileSuccess(true)
  }

  async function onPasswordSubmit(data: ChangePasswordFormData) {
    setPasswordError('')
    setPasswordSuccess(false)

    const result = await changePassword(data)

    if (result?.error) {
      setPasswordError(result.error)
      return
    }

    setPasswordSuccess(true)
    resetPassword()
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const result = await deleteAccount()

    if (result?.error) {
      setDeleting(false)
      setDeleteOpen(false)
      return
    }

    await signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">

      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription className="text-xs">
                Update your display name
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                disabled={isSubmitting}
                className="h-11 rounded-xl"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email ?? ''}
                disabled
                className="h-11 rounded-xl bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {profileSuccess && (
              <p className="text-sm text-green-600">
                Profile updated successfully
              </p>
            )}

            {profileError && (
              <p className="text-sm text-destructive">{profileError}</p>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Password</CardTitle>
              <CardDescription className="text-xs">
                Update your password
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isPasswordSubmitting}
                  className="h-11 rounded-xl pr-12"
                  {...registerPassword('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  disabled={isPasswordSubmitting}
                  className="h-11 rounded-xl pr-12"
                  {...registerPassword('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                disabled={isPasswordSubmitting}
                className="h-11 rounded-xl"
                {...registerPassword('confirmPassword')}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            {passwordSuccess && (
              <p className="text-sm text-green-600">
                Password updated successfully
              </p>
            )}

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-xl"
              disabled={isPasswordSubmitting}
            >
              {isPasswordSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-xl justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger zone
          </CardTitle>
          <CardDescription>
            Deleting your account is permanent. All your events, guests,
            invites and posts will be deleted immediately and cannot be
            recovered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete my account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-2 pt-2">
                    <span className="block text-sm text-muted-foreground">
                      This will permanently delete your account and all
                      associated data including:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>All events you have hosted</li>
                      <li>All guest records and RSVPs</li>
                      <li>All invites you have sent</li>
                      <li>All posts you have written</li>
                    </ul>
                    <span className="block font-medium text-destructive pt-1">
                      This action cannot be undone.
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="rounded-xl"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* RGPD note */}
      <p className="text-xs text-muted-foreground text-center pb-6">
        Under RGPD you have the right to access, modify and delete your
        personal data at any time. For any request contact us at
        privacy@partyup.app
      </p>

    </div>
  )
}