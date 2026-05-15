'use client'

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Check, Clock, X, CalendarDays, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type InviteData = {
  token: string
  email: string
  expiresAt: string
  event: {
    id: string
    title: string
    description: string | null
    date: string
    location: string | null
  }
}

type State =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'ready'; invite: InviteData }
  | { status: 'error'; message: string }

export function InvitePageClient({ token }: { token: string }) {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      // Poll for session — full 15 attempts before declaring unauthenticated
      let session = null
      for (let i = 0; i < 15; i++) {
        const result = await authClient.getSession()
        if (result?.data?.session) {
          session = result.data.session
          break
        }
        await new Promise((r) => setTimeout(r, 300))
      }

      if (!session) {
        setState({ status: 'unauthenticated' })
        return
      }

      // Fetch invite data via API with session cookie
      try {
        const response = await fetch(`/api/invite/${token}`, {
          credentials: 'include',
        })
        const data = await response.json()

        if (!response.ok) {
          setState({
            status: 'error',
            message: data.error ?? 'Invalid invite',
          })
          return
        }

        setState({ status: 'ready', invite: data })
      } catch {
        setState({ status: 'error', message: 'Something went wrong' })
      }
    }

    init()
  }, [token])

  async function handleRSVP(status: 'going' | 'maybe' | 'declined') {
    setRsvpLoading(status)

    try {
      const response = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, status }),
      })

      const result = await response.json()

      if (!response.ok) {
        setState({
          status: 'error',
          message: result.error ?? 'Failed to RSVP',
        })
        setRsvpLoading(null)
        return
      }

      if (result.eventId) {
        router.push(`/events/${result.eventId}`)
      }
    } catch {
      setState({ status: 'error', message: 'Something went wrong' })
      setRsvpLoading(null)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-7 h-7 border-[3px] border-white/90 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white/90 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded-xl animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded-xl animate-pulse w-1/2" />
            <div className="h-24 bg-muted rounded-xl animate-pulse mt-4" />
            <div className="h-12 bg-muted rounded-xl animate-pulse mt-4" />
            <div className="h-12 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (state.status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-7 h-7 border-[3px] border-white/90 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white/90 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              You&apos;re invited
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              You have been invited to an event
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Sign in or create an account to RSVP
            </h1>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full h-12 rounded-xl font-medium">
              <Link href={`/register?invite=${token}`}>
                Create account to RSVP
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              <Link href={`/login?invite=${token}`}>
                Already have an account? Sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Invalid invite</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {state.message}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Ready — RSVP UI ──────────────────────────────────────────────────────
  const { invite } = state

  const hoursLeft = Math.max(
    0,
    Math.round(
      (new Date(invite.expiresAt).getTime() - Date.now()) / 1000 / 60 / 60
    )
  )

  const formattedDate = new Date(invite.event.date).toLocaleDateString(
    'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )

  const formattedTime = new Date(invite.event.date).toLocaleTimeString(
    'en-GB',
    { hour: '2-digit', minute: '2-digit' }
  )

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="w-full max-w-sm mx-auto space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-7 h-7 border-[3px] border-white/90 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white/90 rounded-full" />
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-end">
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            You&apos;re invited
          </span>
        </div>

        {/* Event title */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Someone invited you to
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {invite.event.title}
          </h1>
          {invite.event.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {invite.event.description}
            </p>
          )}
        </div>

        {/* Valid badge */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Valid invite link
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Expires in {hoursLeft}h</span>
          </div>
        </div>

        {/* Event details */}
        <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{formattedDate}</p>
              <p className="text-xs text-muted-foreground">{formattedTime}</p>
            </div>
          </div>
          {invite.event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{invite.event.location}</p>
            </div>
          )}
        </div>

        {/* RSVP buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium">RSVP</p>
          <div className="space-y-2">
            <Button
              onClick={() => handleRSVP('going')}
              disabled={rsvpLoading !== null}
              className="w-full h-12 rounded-xl font-medium"
            >
              <Check className="h-4 w-4 mr-2" />
              {rsvpLoading === 'going' ? 'Accepting...' : "Yes, I'm going!"}
            </Button>
            <Button
              onClick={() => handleRSVP('maybe')}
              disabled={rsvpLoading !== null}
              variant="outline"
              className="w-full h-12 rounded-xl font-medium"
            >
              <Clock className="h-4 w-4 mr-2" />
              {rsvpLoading === 'maybe'
                ? 'Saving...'
                : "Maybe — I'll confirm later"}
            </Button>
            <Button
              onClick={() => handleRSVP('declined')}
              disabled={rsvpLoading !== null}
              variant="ghost"
              className="w-full h-12 rounded-xl text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              {rsvpLoading === 'declined' ? 'Saving...' : "Can't make it"}
            </Button>
          </div>
        </div>

        {/* Maybe later */}
        <Button
          asChild
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <Link href="/dashboard">Maybe later</Link>
        </Button>

      </div>
    </div>
  )
}