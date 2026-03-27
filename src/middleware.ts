import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { JWT } from 'next-auth/jwt';
import { AUTH_ROUTES, isPublicRoute } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';

function getRole(token?: JWT): number | undefined {
  const role = (token?.user as { role?: number } | undefined)?.role;
  return typeof role === 'number' ? role : undefined;
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    if (!token?.user) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, req.url));
    }

    const role = getRole(token);

    if (pathname === '/') {
      if (role === USER_ROLE.USER) {
        return NextResponse.redirect(new URL(AUTH_ROUTES.USER_HOME, req.url));
      }
      if (role === USER_ROLE.ORGANIZATION) {
        return NextResponse.redirect(new URL(AUTH_ROUTES.ORG_HOME, req.url));
      }
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, req.url));
    }

    if (pathname === '/organization' || pathname === '/organization/login') {
      if (role === USER_ROLE.ORGANIZATION) {
        return NextResponse.redirect(new URL(AUTH_ROUTES.ORG_HOME, req.url));
      }
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, req.url));
    }

    if (pathname === '/user' || pathname === '/user/login') {
      return NextResponse.redirect(new URL(AUTH_ROUTES.USER_HOME, req.url));
    }

    if (pathname.startsWith('/organization') && role !== USER_ROLE.ORGANIZATION) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, req.url));
    }

    if (
      pathname.startsWith('/user') &&
      role !== USER_ROLE.USER &&
      role !== USER_ROLE.ORGANIZATION
    ) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (isPublicRoute(req.nextUrl.pathname)) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/', '/user/:path*', '/organization/:path*'],
};
