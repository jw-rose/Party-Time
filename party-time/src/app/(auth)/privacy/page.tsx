import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-sm mx-auto space-y-6">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground">
            Last updated: May 2026
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            PartyUp collects only the data necessary to provide the
            service. We do not sell or share your data with third parties.
          </p>

          <div className="space-y-1">
            <p className="font-medium text-foreground">Data we collect</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Name and email address for your account</li>
              <li>Event data you create</li>
              <li>RSVP responses</li>
              <li>Messages and posts within events</li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="font-medium text-foreground">Your rights</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access your data at any time</li>
              <li>Update your profile from Settings</li>
              <li>Delete your account and all data from Settings</li>
            </ul>
          </div>

          <p>
            All data is stored securely on servers located in the EU.
            Passwords are hashed and never stored in plain text.
          </p>

          <p>
            For any privacy requests contact us at{' '}
            <span className="text-primary">privacy@party-up.app</span>
          </p>
        </div>

        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href="/register">Back to register</Link>
        </Button>

      </div>
    </div>
  )
}