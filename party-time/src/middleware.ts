import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Force www to non-www
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('www.')) {
    const newUrl = request.url.replace('://www.', '://')
    return NextResponse.redirect(newUrl, 301)
  }

  const cookies = request.cookies
  const session =
    cookies.get('party-up.session_token')?.value ||
    cookies.get('__Secure-party-up.session_token')?.value ||
    cookies.get('better-auth.session_token')?.value ||
    cookies.get('__Secure-better-auth.session_token')?.value

  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/events') ||
    request.nextUrl.pathname.startsWith('/settings')

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Preserve invite context when redirecting authenticated users
  if (isAuthRoute && session) {
    const invite = request.nextUrl.searchParams.get('invite')
    if (invite) {
      return NextResponse.redirect(
        new URL(`/invite/${invite}`, request.url)
      )
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/events/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/invite/:path*',
  ],
}