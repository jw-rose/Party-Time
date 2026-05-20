import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']
const PROTECTED_ROUTES = ['/dashboard', '/events', '/settings']

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  // ----------------------------
  // 1. Force canonical domain (non-www)
  // ----------------------------
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.hostname = 'party-up.app'
    return NextResponse.redirect(url, 301)
  }

  // ----------------------------
  // 2. Get session (CORRECTED)
  // ----------------------------
  const session =
    request.cookies.get('__Secure-party-up.session')?.value ||
    request.cookies.get('party-up.session')?.value

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
    const url = new URL('/login', origin)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // ----------------------------
  // 4. Prevent logged-in users from seeing login/register
  // ----------------------------
  if (isPublic && session) {
    return NextResponse.redirect(new URL('/dashboard', origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/events/:path*', '/settings/:path*', '/login', '/register'],
}