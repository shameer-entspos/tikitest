export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  USER_HOME: '/user/feeds',
  ORG_HOME: '/organization/organization-details',
} as const;

export const PUBLIC_ROUTES = [
  '/organization/signup',
  '/organization/password-reset',
] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}
