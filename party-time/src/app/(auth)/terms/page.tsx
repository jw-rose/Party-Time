import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-sm mx-auto space-y-6">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-muted-foreground">
            Last updated: May 2026
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            By using PartyUp you agree to these terms. PartyUp is a
            private event planning service for personal use between
            friends and acquaintances.
          </p>

          <div className="space-y-1">
            <p className="font-medium text-foreground">You agree to</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use the service responsibly and lawfully</li>
              <li>Not share invite links with unintended recipients</li>
              <li>Keep your account credentials secure</li>
              <li>Not use the service for commercial purposes</li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="font-medium text-foreground">We provide</p>
            <ul className="list-disc list-inside space-y-1">
              <li>A private space to organise events with friends</li>
              <li>Secure storage of your event data</li>
              <li>The ability to delete your account at any time</li>
            </ul>
          </div>

          <p>
            The service is provided as-is. We are not liable for any
            loss of data or interruption of service.
          </p>

          <p>
            These terms are governed by French law. For any questions
            contact us at{' '}
            <span className="text-primary">legal@party-up.app</span>
          </p>
        </div>

        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href="/register">Back to register</Link>
        </Button>

      </div>
    </div>
  )
}