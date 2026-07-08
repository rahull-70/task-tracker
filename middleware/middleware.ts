import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { parse } from 'cookie';

export function middleware(request: NextRequest) {
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies['auth_token'];
  const { pathname } = request.nextUrl;

  const user = token ? verifyToken(token) : null;

  // Pages that require login
  const isProtected =
    pathname.startsWith('/board') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/user') ||
    pathname.startsWith('/focus') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/vault') ||
    pathname.startsWith('/garden');

  // Auth pages — logged-in users shouldn't see these
  const isAuthPage = pathname === '/login' || pathname === '/sign-up';

  // Redirect logged-out users to /login
  if (isProtected && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect already logged-in users away from login/signup
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/board', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/board/:path*',
    '/dashboard/:path*',
    '/user/:path*',
    '/focus/:path*',
    '/calendar/:path*',
    '/vault/:path*',
    '/garden/:path*',
    '/login',
    '/sign-up',
  ],
};