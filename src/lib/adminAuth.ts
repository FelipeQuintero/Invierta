import { timingSafeEqual } from 'node:crypto';
import { createClient, type User } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const ADMIN_TOKEN_COOKIE_NAME = 'admin_token';
const SB_ACCESS_TOKEN_COOKIE = 'sb_admin_access_token';
const SB_REFRESH_TOKEN_COOKIE = 'sb_admin_refresh_token';

export type AdminRole = 'admin' | 'editor';

export interface AdminAuthState {
  isAuthenticated: boolean;
  role: AdminRole | null;
  email: string | null;
  method: 'supabase' | 'token' | null;
}

function getEnv(name: string): string {
  return (import.meta.env[name] || process.env[name] || '').trim();
}

function parseBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = getEnv(name).toLowerCase();
  if (!value) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function parseEmailListEnv(name: string): Set<string> {
  const raw = getEnv(name);
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
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

function getSupabaseClient() {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function roleFromEmail(email: string | null): AdminRole | null {
  if (!email) return null;
  const normalized = email.toLowerCase();

  const adminEmails = parseEmailListEnv('ADMIN_AUTH_ADMIN_EMAILS');
  if (adminEmails.has(normalized)) return 'admin';

  const editorEmails = parseEmailListEnv('ADMIN_AUTH_EDITOR_EMAILS');
  if (editorEmails.has(normalized)) return 'editor';

  return null;
}

export function isAdminTokenConfigured(): boolean {
  return Boolean(getConfiguredAdminToken());
}

export function isAdminTokenFallbackEnabled(): boolean {
  return parseBooleanEnv('ADMIN_TOKEN_FALLBACK', true);
}

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(getEnv('SUPABASE_URL') && getEnv('SUPABASE_ANON_KEY'));
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
    maxAge: 60 * 60 * 12,
  });
}

export function clearAdminAuthCookie(cookies: AstroCookies): void {
  cookies.delete(ADMIN_TOKEN_COOKIE_NAME, { path: '/' });
}

function setSupabaseSessionCookies(cookies: AstroCookies, accessToken: string, refreshToken: string, maxAgeSeconds: number): void {
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: import.meta.env.PROD,
    maxAge: maxAgeSeconds,
  };

  cookies.set(SB_ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
  cookies.set(SB_REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
}

export function clearSupabaseSessionCookies(cookies: AstroCookies): void {
  cookies.delete(SB_ACCESS_TOKEN_COOKIE, { path: '/' });
  cookies.delete(SB_REFRESH_TOKEN_COOKIE, { path: '/' });
}

async function resolveSupabaseUser(cookies: AstroCookies): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const accessToken = cookies.get(SB_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookies.get(SB_REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) return data.user;
  }

  if (!refreshToken) return null;

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session?.access_token || !data.session.refresh_token || !data.user) return null;

  setSupabaseSessionCookies(
    cookies,
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in || 60 * 60,
  );

  return data.user;
}

function roleAllowed(role: AdminRole | null, allowedRoles: AdminRole[]): boolean {
  return Boolean(role && allowedRoles.includes(role));
}

export async function getAdminAuthState(
  request: Request,
  cookies: AstroCookies,
  allowedRoles: AdminRole[] = ['admin', 'editor'],
): Promise<AdminAuthState> {
  if (isSupabaseAuthConfigured()) {
    const user = await resolveSupabaseUser(cookies);
    const email = user?.email?.toLowerCase() || null;
    const role = roleFromEmail(email);

    if (roleAllowed(role, allowedRoles)) {
      return {
        isAuthenticated: true,
        role,
        email,
        method: 'supabase',
      };
    }
  }

  if (isAdminTokenFallbackEnabled() && isValidAdminToken(getAdminTokenFromRequest(request, cookies))) {
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

export async function loginWithEmailPassword(cookies: AstroCookies, email: string, password: string): Promise<AdminAuthState> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase Auth no está configurado.');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token || !data.session.refresh_token || !data.user) {
    throw new Error('Credenciales inválidas o usuario no autorizado.');
  }

  setSupabaseSessionCookies(
    cookies,
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in || 60 * 60,
  );

  const normalizedEmail = data.user.email?.toLowerCase() || null;
  const role = roleFromEmail(normalizedEmail);

  if (!role) {
    clearSupabaseSessionCookies(cookies);
    await supabase.auth.signOut();
    throw new Error('Tu usuario existe, pero no tiene rol autorizado para el panel admin.');
  }

  return {
    isAuthenticated: true,
    role,
    email: normalizedEmail,
    method: 'supabase',
  };
}

export function logoutAdmin(cookies: AstroCookies): void {
  clearSupabaseSessionCookies(cookies);
  clearAdminAuthCookie(cookies);
}

/**
 * Compatibilidad retroactiva (fases previas): autorización síncrona por token.
 * Para auth completa con Supabase usar getAdminAuthState().
 */
export function isAdminRequestAuthorized(request: Request, cookies?: AstroCookies): boolean {
  return isValidAdminToken(getAdminTokenFromRequest(request, cookies));
}
