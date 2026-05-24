import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { parse } from 'cookie';

export function proxy(request: NextRequest) {
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies['auth_token'];
  const { pathname } = request.nextUrl;

  const user = token ? verifyToken(token) : null;

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/board');
  const isAuthPage = pathname === '/login' || pathname === '/sign-in';

  // Redirect logged-out users away from protected pages
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from auth pages to board
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/board', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/board/:path*', '/login', '/sign-in'],
};