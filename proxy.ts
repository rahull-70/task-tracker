import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { parse } from 'cookie';

export function proxy(request: NextRequest) {  // ← was "middleware"
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies['auth_token'];
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith('/dashboard');
  const isAuthPage = pathname === '/login' || pathname === '/sign-in';

  const user = token ? verifyToken(token) : null;

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/sign-in'],
};