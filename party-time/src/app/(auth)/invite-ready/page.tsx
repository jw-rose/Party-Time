'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PartyPopper } from 'lucide-react'

function InviteReadyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-muted-foreground">No invite token found.</p>
          <Button asChild variant="outline" className="rounded-xl w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 border-[3px] border-white/90 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white/90 rounded-full" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Account created!
          </h1>
          <p className="text-sm text-muted-foreground">
            You are now signed in. Click below to view your invitation
            and RSVP to the event.
          </p>
        </div>

        {/* CTA */}
        <Button asChild className="w-full h-12 rounded-xl font-medium">
          <Link href={`/invite/${token}`}>
            View my invitation
          </Link>
        </Button>

        <Button asChild variant="ghost" className="w-full text-muted-foreground">
          <Link href="/dashboard">
            Skip for now
          </Link>
        </Button>

      </div>
    </div>
  )
}

export default function InviteReadyPage() {
  return (
    <Suspense>
      <InviteReadyContent />
    </Suspense>
  )
}