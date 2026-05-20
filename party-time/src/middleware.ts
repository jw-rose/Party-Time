import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const cookies = request.cookies
  const session =
    cookies.get('party-up.session_token')?.value ||
    cookies.get('__Secure-party-up.session_token')?.value ||
    cookies.get('better-auth.session_token')?.value ||
    cookies.get('__Secure-better-auth.session_token')?.value

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/events') ||
    request.nextUrl.pathname.startsWith('/settings')

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
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