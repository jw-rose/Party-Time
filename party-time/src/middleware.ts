import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Force www to non-www
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('www.')) {
    const newUrl = request.url.replace('://www.', '://')
    return NextResponse.redirect(newUrl, 301)
  }

  // Check all possible Better Auth cookie names
  const cookies = request.cookies
  const session =
    cookies.get('party-up.session_token')?.value ||
    cookies.get('__Secure-party-up.session_token')?.value ||
    cookies.get('better-auth.session_token')?.value ||
    cookies.get('__Secure-better-auth.session_token')?.value

  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password')

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/events') ||
    request.nextUrl.pathname.startsWith('/settings')

  // Never redirect invite routes
  const isInviteRoute = request.nextUrl.pathname.startsWith('/invite')
  if (isInviteRoute) {
    return NextResponse.next()
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/(.*)',],
}