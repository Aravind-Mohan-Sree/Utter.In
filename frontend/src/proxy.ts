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
  const sessionExpiredMessage = 'Session expired. Please try again';

  if (pathname.startsWith('/_next')) return NextResponse.next();

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin' || pathname === '/admin/') {
      if (hasToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        const url = new URL('/admin/signin', request.url);
        url.searchParams.set('responseMessage', sessionExpiredMessage);
        return NextResponse.redirect(url);
      }
    }

    if (pathname === '/admin/signin' && hasToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    if (pathname !== '/admin/signin' && !hasToken) {
      const url = new URL('/admin/signin', request.url);
      url.searchParams.set('responseMessage', sessionExpiredMessage);
      return NextResponse.redirect(url);
    }
  }

  const isGoogleCallback =
    pathname === '/google' || pathname.startsWith('/google/');

  if (
    isPublicRoute(pathname) &&
    hasToken &&
    pathname !== '/admin/signin' &&
    !isGoogleCallback
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicRoute(pathname) && !hasToken && !pathname.startsWith('/admin')) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('responseMessage', sessionExpiredMessage);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'],
};
