import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

const PROTECTED_ROUTES = ['/dashboard', '/events', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ----------------------------
  // 1. Force non-www domain
  // ----------------------------
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.host = host.replace('www.', '')
    return NextResponse.redirect(url, 301)
  }

  // ----------------------------
  // 2. Read session cookie (FIXED)
  // ----------------------------
  const session =
    request.cookies.get('__Secure.party-up.session_token')?.value ||
    request.cookies.get('party-up.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('better-auth.session_token')?.value

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  const isPublic = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // ----------------------------
  // 3. Redirect unauthenticated users
  // ----------------------------
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ----------------------------
  // 4. Prevent logged-in users from seeing login page
  // ----------------------------
  if (isPublic && session) {
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
  ],
}