import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarPlus, PartyPopper } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const firstName = session.user.name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-8">

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hey {firstName} 🎉
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to plan something special?
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Create event</CardTitle>
            <CardDescription>
              Plan a new party or special occasion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/events/new">Get started</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <PartyPopper className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">My events</CardTitle>
            <CardDescription>
              View events you are hosting or attending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/events">See all events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No events yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Create your first event and invite your friends to get started.
          </p>
          <Button asChild>
            <Link href="/events/new">Create your first event</Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  )
}