import { timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

const ADMIN_COOKIE_NAME = 'admin_token';

function getConfiguredAdminToken(): string {
  return (import.meta.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN || '').trim();
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function isAdminTokenConfigured(): boolean {
  return Boolean(getConfiguredAdminToken());
}

export function isValidAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const configured = getConfiguredAdminToken();
  if (!configured) return false;
  return safeEqual(token.trim(), configured);
}

export function getAdminTokenFromRequest(request: Request, cookies?: AstroCookies): string | null {
  const headerToken = request.headers.get('x-admin-token');
  if (headerToken) return headerToken;

  const cookieToken = cookies?.get(ADMIN_COOKIE_NAME)?.value;
  return cookieToken || null;
}

export function isAdminRequestAuthorized(request: Request, cookies?: AstroCookies): boolean {
  return isValidAdminToken(getAdminTokenFromRequest(request, cookies));
}

export function setAdminAuthCookie(cookies: AstroCookies, token: string): void {
  cookies.set(ADMIN_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 12, // 12h
  });
}

export function clearAdminAuthCookie(cookies: AstroCookies): void {
  cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
}
