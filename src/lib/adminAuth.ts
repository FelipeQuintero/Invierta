import { timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

const ADMIN_TOKEN_COOKIE_NAME = 'admin_token';

export type AdminRole = 'admin' | 'editor';

export interface AdminAuthState {
  isAuthenticated: boolean;
  role: AdminRole | null;
  email: string | null;
  method: 'token' | null;
}

function getEnv(name: string): string {
  return (import.meta.env[name] || process.env[name] || '').trim();
}

function getConfiguredAdminToken(): string {
  return getEnv('ADMIN_TOKEN');
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

export function getAdminSessionMaxAgeSeconds(): number {
  const raw = getEnv('ADMIN_SESSION_MAX_AGE_SECONDS');
  const parsed = Number.parseInt(raw || '', 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60 * 60 * 12;
  }

  return parsed;
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

  const cookieToken = cookies?.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  const tokenFromQuery = new URL(request.url).searchParams.get('token');
  return tokenFromQuery || null;
}

export function setAdminAuthCookie(cookies: AstroCookies, token: string): void {
  cookies.set(ADMIN_TOKEN_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: getAdminSessionMaxAgeSeconds(),
  });
}

export function clearAdminAuthCookie(cookies: AstroCookies): void {
  cookies.delete(ADMIN_TOKEN_COOKIE_NAME, { path: '/' });
}

export async function getAdminAuthState(
  request: Request,
  cookies: AstroCookies,
  allowedRoles: AdminRole[] = ['admin', 'editor'],
): Promise<AdminAuthState> {
  if (allowedRoles.length === 0) {
    return {
      isAuthenticated: false,
      role: null,
      email: null,
      method: null,
    };
  }

  if (isValidAdminToken(getAdminTokenFromRequest(request, cookies))) {
    return {
      isAuthenticated: true,
      role: 'admin',
      email: null,
      method: 'token',
    };
  }

  return {
    isAuthenticated: false,
    role: null,
    email: null,
    method: null,
  };
}

export function loginWithAdminToken(cookies: AstroCookies, token: string): void {
  if (!isValidAdminToken(token)) {
    throw new Error('Token inválido.');
  }

  setAdminAuthCookie(cookies, token.trim());
}

export function logoutAdmin(cookies: AstroCookies): void {
  clearAdminAuthCookie(cookies);
}

export function isAdminRequestAuthorized(request: Request, cookies?: AstroCookies): boolean {
  return isValidAdminToken(getAdminTokenFromRequest(request, cookies));
}
