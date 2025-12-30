import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/signin',
  '/google',
  '/verify-otp',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verification-pending',
  '/admin/signin',
];

const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('refreshToken')?.value;
  const hasToken = !!token;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin' || pathname === '/admin/') {
      if (hasToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/signin', request.url));
      }
    }

    if (pathname === '/admin/signin' && hasToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    if (pathname !== '/admin/signin' && !hasToken) {
      return NextResponse.redirect(new URL('/admin/signin', request.url));
    }
  }

  if (isPublicRoute(pathname) && hasToken && pathname !== '/admin/signin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicRoute(pathname) && !hasToken && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matches all paths except system files and public assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)'],
};
